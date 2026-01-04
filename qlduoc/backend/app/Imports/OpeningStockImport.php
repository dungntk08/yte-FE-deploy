<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use App\Models\Product;
use App\Models\StockVoucher;
use App\Models\StockVoucherDetail;
use App\Models\ItemBatch;
use App\Models\InventorySnapshot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Exception;

class OpeningStockImport implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    protected $warehouseId;
    protected $userId;

    public function __construct(string $warehouseId)
    {
        $this->warehouseId = $warehouseId;
        $this->userId = Auth::id();
    }

    public function collection(Collection $rows)
    {
        if ($rows->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($rows) {
            // 1. Create Voucher
            $voucher = StockVoucher::create([
                'Code' => 'IMP-OS-' . time(),
                'VoucherDate' => now(),
                'VoucherType' => 'Import',
                'TargetWarehouseId' => $this->warehouseId,
                'Status' => 'Approved',
                'Description' => 'Nhập tồn đầu từ Excel',
                'CreatedBy' => $this->userId,
            ]);

            foreach ($rows as $row) {
                // Expect keys: product_code, batch_number, expiry_date, quantity, price
                $productCode = $row['product_code'] ?? $row['ma_san_pham'] ?? null;
                if (!$productCode) continue;

                $product = Product::where('Code', $productCode)->first();
                if (!$product) {
                    throw new Exception("Sản phẩm với mã {$productCode} không tồn tại");
                }

                $batchNumber = $row['batch_number'] ?? $row['so_lo'] ?? 'BATCH-' . date('Ymd');
                // Handle different date formats if needed, assuming Standard Excel Date or Y-m-d
                $expiryDate = $this->transformDate($row['expiry_date'] ?? $row['han_dung']);
                $quantity = (int)($row['quantity'] ?? $row['so_luong'] ?? 0);
                $price = (float)($row['price'] ?? $row['gia_von'] ?? 0);

                if ($quantity <= 0) continue;

                // 2. Ensure Batch
                ItemBatch::firstOrCreate(
                    ['ProductId' => $product->Id, 'BatchNumber' => $batchNumber],
                    ['ExpiryDate' => $expiryDate]
                );

                // 3. Create Detail
                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $product->Id,
                    'BatchNumber' => $batchNumber,
                    'ExpiryDate' => $expiryDate,
                    'Quantity' => $quantity,
                    'Price' => $price,
                    'UnitName' => $product->unit->Name ?? $product->UnitName ?? 'Đơn vị',
                ]);

                // 4. Update Snapshot (Consistent with InventoryController)
                $snapshot = InventorySnapshot::where('WarehouseId', $this->warehouseId)
                    ->where('ProductId', $product->Id)
                    ->where('BatchNumber', $batchNumber)
                    ->first();

                if ($snapshot) {
                    $snapshot->increment('Quantity', $quantity);
                } else {
                    InventorySnapshot::create([
                        'WarehouseId' => $this->warehouseId,
                        'ProductId' => $product->Id,
                        'BatchNumber' => $batchNumber,
                        'Quantity' => $quantity,
                    ]);
                }
            }
        });
    }

    private function transformDate($value)
    {
        if (!$value) return null;
        try {
            return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
        } catch (\ErrorException $e) {
            return \Carbon\Carbon::parse($value);
        } catch (\Exception $e) {
             return null;
        }
    }
}
