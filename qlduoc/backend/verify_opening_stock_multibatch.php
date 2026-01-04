<?php

require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\InventoryController;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Support\Facades\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

// Setup User
$user = \App\Models\AppUser::first();
if (!$user) die("No user found");
Auth::login($user);

$controller = new InventoryController();
$ts = time();

echo "--- VERIFY OPENING STOCK MULTI-BATCH ---\n";

// 1. Get Warehouse and Product
$wh = Warehouse::first();
if (!$wh) die("FAIL: No warehouse found.\n");

$prod = Product::first();
if (!$prod) {
    // Create verify product
    $prod = Product::create([
        'Code' => 'TEST_P_' . $ts,
        'Name' => 'Test Product ' . $ts,
        'UnitName' => 'Hộp',
        'TypeId' => 1,
        'Active' => true
    ]);
}

echo "Using Warehouse: {$wh->Name} ({$wh->Id})\n";
echo "Using Product: {$prod->Name} ({$prod->Id})\n";

// 2. Prepare Payload with 2 batches for same product
$batch1 = 'B1_' . $ts;
$batch2 = 'B2_' . $ts;

$items = [
    [
        'product_id' => $prod->Id,
        'batch_code' => $batch1,
        'expiry_date' => date('Y-m-d', strtotime('+1 year')),
        'quantity' => 10,
        'price' => 5000
    ],
    [
        'product_id' => $prod->Id,
        'batch_code' => $batch2,
        'expiry_date' => date('Y-m-d', strtotime('+2 years')),
        'quantity' => 20,
        'price' => 5000
    ]
];

$req = Request::create('/api/inventory/opening-stock/manual', 'POST', [
    'warehouse_id' => $wh->Id,
    'description' => 'Test Multi Batch ' . $ts,
    'items' => $items
]);

try {
    $res = $controller->createOpeningStockNote($req);
    if ($res->getStatusCode() == 200) {
        $data = $res->getData();
        $voucher = $data->voucher;
        echo "SUCCESS: Voucher created ID {$voucher->Id}.\n";

        // Verify Details
        $details = \App\Models\StockVoucherDetail::where('VoucherId', $voucher->Id)->get();
        if ($details->count() == 2) {
            echo "SUCCESS: Found 2 details rows.\n";
            foreach ($details as $d) {
                echo " - Batch: {$d->BatchNumber}, Qty: {$d->Quantity}\n";
            }
        } else {
            echo "FAIL: Expected 2 details, found {$details->count()}.\n";
        }

        // Verify Snapshots (FEFO visibility)
        $snaps = \App\Models\InventorySnapshot::where('WarehouseId', $wh->Id)
                ->where('ProductId', $prod->Id)
                ->whereIn('BatchNumber', [$batch1, $batch2])
                ->get();
        
        if ($snaps->count() == 2) {
            echo "SUCCESS: Found 2 snapshots for FEFO.\n";
        } else {
            echo "FAIL: Expected 2 snapshots, found {$snaps->count()}.\n";
        }

    } else {
        echo "FAILED to create opening stock: " . $res->getContent() . "\n";
    }
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
