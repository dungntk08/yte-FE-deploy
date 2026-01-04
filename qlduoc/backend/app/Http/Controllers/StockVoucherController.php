<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockVoucher;
use App\Models\StockVoucherDetail;
use App\Models\InventorySnapshot;
use App\Models\ItemBatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockVoucherController extends Controller
{
    /**
     * Store a newly created resource in storage.
     * Used for Import (and potentially Export if extended).
     */
    public function store(Request $request)
    {
        // Validation with PascalCase expectation
        $request->validate([
            'VoucherDate' => 'required|date',
            'VoucherType' => 'required|string|in:Import,Export',
            'SourceWarehouseId' => 'nullable|exists:Warehouses,Id',
            'TargetWarehouseId' => 'nullable|exists:Warehouses,Id',
            // Details
            'Details' => 'required|array|min:1',
            'Details.*.ProductId' => 'required|exists:Products,Id',
            'Details.*.Quantity' => 'required|integer|min:1',
            'Details.*.Price' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Create Voucher
            $voucher = StockVoucher::create([
                'Code' => 'V' . time(), // Simple Auto-gen
                'VoucherDate' => $request->VoucherDate,
                'VoucherType' => $request->VoucherType,
                'SourceWarehouseId' => $request->SourceWarehouseId,
                'TargetWarehouseId' => $request->TargetWarehouseId,
                'PartnerId' => $request->PartnerId,
                'InvoiceNo' => $request->InvoiceNo,
                'Status' => 'Approved', // Auto-approve for now
            ]);

            foreach ($request->Details as $detail) {
                // Ensure Batch
                $batchNumber = $detail['BatchNumber'] ?? 'BATCH-' . date('Ymd');
                $expiryDate = $detail['ExpiryDate'] ?? null;

                // Create or Update ItemBatch (Optional, just for autocomplete)
                ItemBatch::firstOrCreate(
                    ['ProductId' => $detail['ProductId'], 'BatchNumber' => $batchNumber],
                    ['ExpiryDate' => $expiryDate]
                );

                // Create Detail
                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $detail['ProductId'],
                    'BatchNumber' => $batchNumber,
                    'ExpiryDate' => $expiryDate,
                    'Quantity' => $detail['Quantity'],
                    'Price' => $detail['Price'],
                    'VATRate' => $detail['VATRate'] ?? 0,
                ]);

                // We do NOT update InventorySnapshot here if we follow strict Event Sourcing for calculation.
                // But for performance, many systems update a 'CurrentStock' table. 
                // The requirements said: "Tồn kho = Snapshot + Sum(In) - Sum(Out)".
                // So we don't strictly NEED to update a snapshot on every transaction, 
                // OR we can update a "Current Stock Cache".
                // I will stick to just saving the voucher as requested by the "Event Sourcing" pattern description.
            }

            DB::commit();
            return response()->json($voucher->load('details'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $vouchers = StockVoucher::with(['sourceWarehouse', 'targetWarehouse'])->latest('CreatedAt')->paginate(20);
        return response()->json($vouchers);
    }
}
