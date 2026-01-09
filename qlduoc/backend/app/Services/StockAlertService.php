<?php

namespace App\Services;

use App\Models\StockAlert;
use App\Models\WarehouseBatch;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class StockAlertService
{
    /**
     * Generate all types of stock alerts
     */
    public function generateAlerts()
    {
        $this->generateExpiryAlerts();
        $this->generateLowStockAlerts();
        $this->generateOverStockAlerts();
        
        return [
            'expiry_alerts' => StockAlert::ofType('near_expiry')->unresolved()->count(),
            'expired_alerts' => StockAlert::ofType('expired')->unresolved()->count(),
            'low_stock_alerts' => StockAlert::ofType('low_stock')->unresolved()->count(),
            'over_stock_alerts' => StockAlert::ofType('over_stock')->unresolved()->count(),
        ];
    }

    /**
     * Generate alerts for products nearing expiry or expired
     */
    public function generateExpiryAlerts()
    {
        $sixMonthsFromNow = Carbon::now()->addMonths(6);
        
        // Find batches expiring within 6 months
        $nearExpiryBatches = WarehouseBatch::where('expiry_date', '<=', $sixMonthsFromNow)
            ->where('expiry_date', '>', Carbon::now())
            ->where('quantity', '>', 0)
            ->get();

        foreach ($nearExpiryBatches as $batch) {
            $daysToExpiry = Carbon::now()->diffInDays($batch->expiry_date, false);
            
            // Check if alert already exists
            $existingAlert = StockAlert::where('batch_id', $batch->id)
                ->where('alert_type', 'near_expiry')
                ->where('is_resolved', false)
                ->first();

            if (!$existingAlert) {
                StockAlert::create([
                    'id' => (string) Str::uuid(),
                    'warehouse_id' => $batch->warehouse_id,
                    'product_id' => $batch->product_id,
                    'batch_id' => $batch->id,
                    'alert_type' => 'near_expiry',
                    'current_quantity' => $batch->quantity,
                    'expiry_date' => $batch->expiry_date,
                    'days_to_expiry' => $daysToExpiry,
                ]);
            }
        }

        // Find expired batches
        $expiredBatches = WarehouseBatch::where('expiry_date', '<=', Carbon::now())
            ->where('quantity', '>', 0)
            ->get();

        foreach ($expiredBatches as $batch) {
            $existingAlert = StockAlert::where('batch_id', $batch->id)
                ->where('alert_type', 'expired')
                ->where('is_resolved', false)
                ->first();

            if (!$existingAlert) {
                StockAlert::create([
                    'id' => (string) Str::uuid(),
                    'warehouse_id' => $batch->warehouse_id,
                    'product_id' => $batch->product_id,
                    'batch_id' => $batch->id,
                    'alert_type' => 'expired',
                    'current_quantity' => $batch->quantity,
                    'expiry_date' => $batch->expiry_date,
                    'days_to_expiry' => 0,
                ]);
            }
        }
    }

    /**
     * Generate alerts for low stock products
     */
    public function generateLowStockAlerts()
    {
        // Get products with min_stock_level set
        $products = Product::where('min_stock_level', '>', 0)->get();

        foreach ($products as $product) {
            // Calculate total stock per warehouse
            $warehouseStocks = WarehouseBatch::select('warehouse_id', DB::raw('SUM(quantity) as total'))
                ->where('product_id', $product->id)
                ->where('expiry_date', '>=', Carbon::now())
                ->groupBy('warehouse_id')
                ->get();

            foreach ($warehouseStocks as $stock) {
                if ($stock->total < $product->min_stock_level) {
                    $existingAlert = StockAlert::where('warehouse_id', $stock->warehouse_id)
                        ->where('product_id', $product->id)
                        ->where('alert_type', 'low_stock')
                        ->where('is_resolved', false)
                        ->first();

                    if (!$existingAlert) {
                        StockAlert::create([
                            'id' => (string) Str::uuid(),
                            'warehouse_id' => $stock->warehouse_id,
                            'product_id' => $product->id,
                            'alert_type' => 'low_stock',
                            'current_quantity' => $stock->total,
                            'threshold_quantity' => $product->min_stock_level,
                        ]);
                    } else {
                        // Update current quantity
                        $existingAlert->update(['current_quantity' => $stock->total]);
                    }
                }
            }
        }
    }

    /**
     * Generate alerts for over stock products
     */
    public function generateOverStockAlerts()
    {
        // Get products with max_stock_level set
        $products = Product::whereNotNull('max_stock_level')->get();

        foreach ($products as $product) {
            $warehouseStocks = WarehouseBatch::select('warehouse_id', DB::raw('SUM(quantity) as total'))
                ->where('product_id', $product->id)
                ->where('expiry_date', '>=', Carbon::now())
                ->groupBy('warehouse_id')
                ->get();

            foreach ($warehouseStocks as $stock) {
                if ($stock->total > $product->max_stock_level) {
                    $existingAlert = StockAlert::where('warehouse_id', $stock->warehouse_id)
                        ->where('product_id', $product->id)
                        ->where('alert_type', 'over_stock')
                        ->where('is_resolved', false)
                        ->first();

                    if (!$existingAlert) {
                        StockAlert::create([
                            'id' => (string) Str::uuid(),
                            'warehouse_id' => $stock->warehouse_id,
                            'product_id' => $product->id,
                            'alert_type' => 'over_stock',
                            'current_quantity' => $stock->total,
                            'threshold_quantity' => $product->max_stock_level,
                        ]);
                    } else {
                        $existingAlert->update(['current_quantity' => $stock->total]);
                    }
                }
            }
        }
    }

    /**
     * Auto-resolve alerts that are no longer valid
     */
    public function autoResolveAlerts()
    {
        // Resolve low stock alerts where stock is now above threshold
        $lowStockAlerts = StockAlert::ofType('low_stock')->unresolved()->get();
        foreach ($lowStockAlerts as $alert) {
            if ($alert->current_quantity >= $alert->threshold_quantity) {
                $alert->resolve(null, 'Auto-resolved: Stock level restored');
            }
        }

        // Resolve over stock alerts where stock is now below threshold
        $overStockAlerts = StockAlert::ofType('over_stock')->unresolved()->get();
        foreach ($overStockAlerts as $alert) {
            if ($alert->current_quantity <= $alert->threshold_quantity) {
                $alert->resolve(null, 'Auto-resolved: Stock level normalized');
            }
        }

        // Resolve expiry alerts for batches that have been consumed
        $expiryAlerts = StockAlert::whereIn('alert_type', ['near_expiry', 'expired'])
            ->unresolved()
            ->get();
        foreach ($expiryAlerts as $alert) {
            if ($alert->batch && $alert->batch->quantity == 0) {
                $alert->resolve(null, 'Auto-resolved: Batch consumed');
            }
        }
    }
}
