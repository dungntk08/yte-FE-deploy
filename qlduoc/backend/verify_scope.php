<?php
// verify_scope.php
// Run with: php verify_scope.php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\AppUser;
use App\Models\Product;
use App\Models\MedicalCenter;
use App\Models\UserScope;
use Illuminate\Support\Facades\Auth;

echo "--- Starting Scope Verification ---\n";

// 1. Setup Medical Centers
$mc1 = MedicalCenter::firstOrCreate(['Code' => 'MC_TEST_1'], ['Name' => 'MC Test 1', 'IsActive' => 1]);
$mc2 = MedicalCenter::firstOrCreate(['Code' => 'MC_TEST_2'], ['Name' => 'MC Test 2', 'IsActive' => 1]);

echo "Medical Centers: {$mc1->Id} (A), {$mc2->Id} (B)\n";

// 2. Setup Users
$userA = AppUser::firstOrCreate(['Username' => 'user_a'], ['FullName' => 'User A', 'PasswordHash' => '123']);
$userB = AppUser::firstOrCreate(['Username' => 'user_b'], ['FullName' => 'User B', 'PasswordHash' => '123']);

// 3. Assign Scopes
$role = \App\Models\AppRole::firstOrCreate(['Code' => 'test_role'], ['Name' => 'Test Role']);
UserScope::updateOrCreate(['UserId' => $userA->Id], ['MedicalCenterId' => $mc1->Id, 'RoleId' => $role->Id]);
UserScope::updateOrCreate(['UserId' => $userB->Id], ['MedicalCenterId' => $mc2->Id, 'RoleId' => $role->Id]);

// 4. Create Product A (owned by MC1)
Auth::login($userA);
$productA = Product::create([
    'Code' => 'P_TEST_A_' . time(),
    'Name' => 'Product A',
    'ProductTypeId' => 1,
    'UnitName' => 'Box',
    'IsActive' => 1
]);
// Force MC ID just in case scope logic fails (but logic should handle it)
$productA->update(['MedicalCenterId' => $mc1->Id]);
echo "Product A created by User A. MC ID: {$productA->MedicalCenterId}\n";

// 5. Test: User B tries to find Product A
Auth::login($userB);
echo "\nLogged in as User B (MC: {$mc2->Id}). Trying to find Product A (MC: {$mc1->Id})...\n";

$found = Product::find($productA->Id);

if ($found) {
    echo "FAILED: User B found Product A! Scope is NOT working.\n";
} else {
    echo "PASSED: User B could NOT find Product A. Scope is working.\n";
}

// 6. Test: User B tries to update Product A (simulating Controller logic)
try {
    $productToUpdate = Product::findOrFail($productA->Id);
    $productToUpdate->update(['Name' => 'HACKED']);
    echo "FAILED: User B updated Product A!\n";
} catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
    echo "PASSED: User B got 404 Not Found when trying to update Product A.\n";
}

// Cleanup
$productA->delete(); // Might fail if User B can't find it.
// Login as A to delete
Auth::login($userA);
$productA->delete();
echo "\n--- Verification Complete ---\n";
