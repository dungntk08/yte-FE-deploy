<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AppPermission;
use App\Models\AppRole;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Permissions
        $permissions = [
            ['Code' => 'user.view', 'Name' => 'View Users', 'Group' => 'User Management'],
            ['Code' => 'inventory.import', 'Name' => 'Import Inventory', 'Group' => 'Inventory'],
            ['Code' => 'inventory.opening_stock', 'Name' => 'Manage Opening Stock', 'Group' => 'Inventory'],
        ];

        foreach ($permissions as $p) {
            AppPermission::firstOrCreate(['Code' => $p['Code']], $p);
        }

        // 2. Assign to Admin Role (assuming code 'admin')
        $adminRole = AppRole::where('Code', 'admin')->first();
        if ($adminRole) {
            $allPermissionIds = AppPermission::pluck('Id');
            $adminRole->permissions()->syncWithoutDetaching($allPermissionIds);
        }
    }
}
