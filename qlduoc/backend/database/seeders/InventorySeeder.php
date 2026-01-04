<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventorySnapshot;
use App\Models\ItemBatch;
use App\Models\Product;
use App\Models\Warehouse;
use Carbon\Carbon;
use Illuminate\Support\Str;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('📦 Seeding Inventory & Batches...');

        $warehouses = Warehouse::all();
        $products = Product::where('IsActive', true)->get();

        if ($products->count() === 0) {
            $this->command->warn('No products found. Skipping inventory seeding.');
            return;
        }

        if ($warehouses->count() === 0) {
            $this->command->warn('No warehouses found. Skipping inventory seeding.');
            return;
        }

        $count = 0;

        foreach ($products as $product) {
            // Generate 1-3 batches per product
            $numBatches = rand(1, 3);
            
            for ($i = 0; $i < $numBatches; $i++) {
                $batchNumber = 'BATCH-' . Str::upper(Str::random(6));
                $expiryDate = Carbon::now()->addMonths(rand(6, 24));
                
                // Create ItemBatch
                $batch = ItemBatch::create([
                    'ProductId' => $product->Id,
                    'BatchNumber' => $batchNumber,
                    'ExpiryDate' => $expiryDate,
                ]);

                // Create InventorySnapshot for each warehouse (randomly)
                foreach ($warehouses as $warehouse) {
                    // 50% chance to have stock in this warehouse
                    if (rand(0, 1)) {
                        InventorySnapshot::create([
                            'WarehouseId' => $warehouse->Id,
                            'ProductId' => $product->Id,
                            'BatchNumber' => $batchNumber,
                            'Quantity' => rand(10, 500),
                            'AveragePrice' => $product->Price ?? 1000,
                            'SnapshotDate' => Carbon::now()
                        ]);
                    }
                }
            }
            $count++;
        }

        $this->command->info("✅ Seeded inventory for $count products.");
    }
}
