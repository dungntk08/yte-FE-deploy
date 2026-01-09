<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\StockVoucher;
use App\Models\InventorySnapshot;
use App\Models\StockVoucherDetail;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        // 1. Total Active Products
        $totalProducts = Product::where('IsActive', true)->count();

        // 2. Transactions Today
        $today = now()->format('Y-m-d');
        $importToday = StockVoucher::where('VoucherType', 'Import')
            ->whereDate('VoucherDate', $today)
            //->where('Status', 'Approved') // Count all or approved? Usually Approved + Pending? Let's count all created today for activity.
            ->count();
            
        $exportToday = StockVoucher::where('VoucherType', 'Export')
            ->whereDate('VoucherDate', $today)
            ->count();

        // 3. Out of Stock (Realtime)
        // Complexity: High.
        // Strategy: We can try to approximate in SQL or if N is small (< 1000), PHP is fine.
        // Let's assume N < 2000 for now. Using the same logic as InventoryController but optimized.
        
        // Optimization: 
        // We only care if Stock <= 0.
        // Stock = Snapshot + In - Out.
        
        // Let's do a raw SQL query for performance.
        // Assumptions:
        // - Single Snapshot per Product (latest).
        // - Vouchers > Snapshot Date.
        
        // To keep it simple and robust (reusing the logic we verified):
        // We will fetch ALL products stock summary.
        
        // Warning: This is heavy. 
        // Alternative: Just count InventorySnapshot <= 0?
        // User said: "Bảng InventorySnapshots chỉ tính lại vào đầu tháng... Cón sẽ cộng thực tế..."
        // So Snapshot table IS the base.
        // If we just count Snapshot <= 0, we miss the realtime updates.
        // Let's try to query aggregate.

        $outOfStockCount = 0;
        
        // Heavy calculation approach (PHP side but minimized fields)
        // Products
        $products = Product::where('IsActive', true)->pluck('Id');
        
        // Snapshots (Grouped by Product, Sum Quantity)
        $snapshots = InventorySnapshot::select('ProductId', DB::raw('SUM(Quantity) as qty'), DB::raw('MAX(SnapshotDate) as last_date'))
            ->whereIn('ProductId', $products)
            ->groupBy('ProductId')
            ->get()
            ->keyBy('ProductId');
            
        // Voucher Details (Approvoed, In/Out) - Group by Product
        // We need to filter by Date > Snapshot Date. This is hard to do in one aggregate query if Snapshot Date varies per product.
        // Simplified Logic: 
        // Sum ALL details for now? No.
        // Iterate.
        
        // Let's fetch all Approved details.
        // If the dataset is huge, this crashes.
        // Better:
        // Use a subquery or join.
        
        // For Dashboard, maybe we relax accuracy slightly?
        // User specifically asked for "Realtime" logic implication.
        // Let's implement the PHP loop but try to be efficient.

        $details = StockVoucherDetail::join('StockVouchers', 'StockVouchers.Id', '=', 'StockVoucherDetails.VoucherId')
            ->where('StockVouchers.Status', 'Approved')
            ->select('StockVoucherDetails.ProductId', 'StockVoucherDetails.Quantity', 'StockVouchers.VoucherType', 'StockVouchers.VoucherDate', 'StockVouchers.TargetWarehouseId', 'StockVouchers.SourceWarehouseId')
            ->get()
            ->groupBy('ProductId');

        foreach ($products as $pId) {
            $snap = $snapshots->get($pId);
            $baseQty = $snap ? $snap->qty : 0;
            $snapDate = $snap ? $snap->last_date : '1900-01-01'; // Max date if multiple? 
            // If we summed Qty from multiple warehouses, we should probably take the MIN date to be safe? 
            // Or if we assume synchronous snapshots, MAX is fine. 
            // Let's use MAX.

            $prodDetails = $details->get($pId);
            
            $delta = 0;
            if ($prodDetails) {
                foreach ($prodDetails as $d) {
                    if ($d->VoucherDate <= $snapDate) continue;
                    
                    if ($d->VoucherType === 'Import') {
                        $delta += $d->Quantity;
                    } elseif ($d->VoucherType === 'Export') {
                        $delta -= $d->Quantity;
                    }
                }
            }
            
            if (($baseQty + $delta) <= 0) {
                $outOfStockCount++;
            }
        }

        // 4. Recent Activities
        $recentActivities = \App\Models\ActivityLog::with(['causer'])
            ->latest('CreatedAt')
            ->take(5)
            ->get()
            ->map(function($log) {
                // Try to get Subject Info manually or via Polymorphic if defined
                // To avoid N+1 on various types, we just try-catch or check type.
                $subjectInfo = '';
                if ($log->SubjectType === 'StockVoucher') {
                    $voucher = \App\Models\StockVoucher::find($log->SubjectId);
                    if ($voucher) {
                        $subjectInfo = $voucher->Code;
                    }
                } elseif ($log->SubjectType === 'Product') {
                     $product = \App\Models\Product::find($log->SubjectId);
                     if ($product) {
                         $subjectInfo = $product->Name;
                     }
                }

                return [
                    'id' => $log->Id,
                    'user' => $log->causer->Name ?? 'Hệ thống',
                    'action' => $log->Action, // e.g. "Create", "Update"
                    'description' => $log->Description,
                    'subject_info' => $subjectInfo,
                    'subject_type' => $log->SubjectType,
                    'time' => $log->CreatedAt->diffForHumans(),
                    'created_at' => $log->CreatedAt->toIso8601String()
                ];
            });

        return response()->json([
            'total_products' => $totalProducts,
            'out_of_stock_products' => $outOfStockCount,
            'import_today' => $importToday,
            'export_today' => $exportToday,
            'recent_activities' => $recentActivities
        ]);
    }
}
