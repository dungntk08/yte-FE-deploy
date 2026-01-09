<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;
use App\Models\Account;
use Illuminate\Support\Str;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🏢 Creating warehouses...');
        
        $account = Account::first();
        if (!$account) {
            $this->command->error('No account found!');
            return;
        }

        // 1. Kho Tổng (Central) - Parent warehouse
        $khoTong = Warehouse::create([
            'id' => (string) Str::uuid(),
            'account_id' => $account->id,
            'name' => 'Kho Tổng',
            'code' => 'KT001',
            'parent_warehouse_id' => null,
            'warehouse_type' => 'central',
            'is_active' => true,
            'active' => true,
        ]);
        $this->command->info('  ✓ Created: Kho Tổng (Central)');

        // 2. Kho Lạnh (Cold Storage) - Child of central
        $khoLanh = Warehouse::create([
            'id' => (string) Str::uuid(),
            'account_id' => $account->id,
            'name' => 'Kho Lạnh',
            'code' => 'KL001',
            'parent_warehouse_id' => $khoTong->id,
            'warehouse_type' => 'cold_storage',
            'is_active' => true,
            'active' => true,
        ]);
        $this->command->info('  ✓ Created: Kho Lạnh (Cold Storage)');

        // 3. Quầy Thuốc 1 (Pharmacy 1) - Child of central
        $qt1 = Warehouse::create([
            'id' => (string) Str::uuid(),
            'account_id' => $account->id,
            'name' => 'Quầy Thuốc 1',
            'code' => 'QT001',
            'parent_warehouse_id' => $khoTong->id,
            'warehouse_type' => 'pharmacy',
            'is_active' => true,
            'active' => true,
        ]);
        $this->command->info('  ✓ Created: Quầy Thuốc 1 (Pharmacy)');

        // 4. Quầy Thuốc 2 (Pharmacy 2) - Child of central
        $qt2 = Warehouse::create([
            'id' => (string) Str::uuid(),
            'account_id' => $account->id,
            'name' => 'Quầy Thuốc 2',
            'code' => 'QT002',
            'parent_warehouse_id' => $khoTong->id,
            'warehouse_type' => 'pharmacy',
            'is_active' => true,
            'active' => true,
        ]);
        $this->command->info('  ✓ Created: Quầy Thuốc 2 (Pharmacy)');

        // 5. Kho Văn Phòng (Office) - Child of central
        $khoVP = Warehouse::create([
            'id' => (string) Str::uuid(),
            'account_id' => $account->id,
            'name' => 'Kho Văn Phòng',
            'code' => 'KVP001',
            'parent_warehouse_id' => $khoTong->id,
            'warehouse_type' => 'office',
            'is_active' => true,
            'active' => true,
        ]);
        $this->command->info('  ✓ Created: Kho Văn Phòng (Office)');

        $this->command->info('✅ Created 5 warehouses with hierarchy');
    }
}
