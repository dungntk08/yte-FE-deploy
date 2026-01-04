<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;
use Illuminate\Support\Str;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            // Base units
            ['name' => 'Viên', 'code' => 'VIEN', 'is_base_unit' => true],
            ['name' => 'Cái', 'code' => 'CAI', 'is_base_unit' => true],
            ['name' => 'Lọ', 'code' => 'LO', 'is_base_unit' => true],
            ['name' => 'Ống', 'code' => 'ONG', 'is_base_unit' => true],
            ['name' => 'Gói', 'code' => 'GOI', 'is_base_unit' => true],
            
            // Derived units for medicine
            ['name' => 'Vỉ', 'code' => 'VI', 'base_unit' => 'VIEN', 'conversion_factor' => 10], // 1 Vỉ = 10 Viên
            ['name' => 'Hộp', 'code' => 'HOP', 'base_unit' => 'VI', 'conversion_factor' => 10], // 1 Hộp = 10 Vỉ = 100 Viên
            ['name' => 'Thùng', 'code' => 'THUNG', 'base_unit' => 'HOP', 'conversion_factor' => 20], // 1 Thùng = 20 Hộp
            
            // Liquid units
            ['name' => 'ml', 'code' => 'ML', 'is_base_unit' => true],
            ['name' => 'Chai', 'code' => 'CHAI', 'base_unit' => 'ML', 'conversion_factor' => 100], // 1 Chai = 100ml
            ['name' => 'Lít', 'code' => 'LIT', 'base_unit' => 'ML', 'conversion_factor' => 1000], // 1 Lít = 1000ml
            
            // Weight units
            ['name' => 'gram', 'code' => 'G', 'is_base_unit' => true],
            ['name' => 'kg', 'code' => 'KG', 'base_unit' => 'G', 'conversion_factor' => 1000], // 1 kg = 1000g
            
            // Medical supplies
            ['name' => 'Bộ', 'code' => 'BO', 'is_base_unit' => true],
            ['name' => 'Cuộn', 'code' => 'CUON', 'is_base_unit' => true],
            ['name' => 'Túi', 'code' => 'TUI', 'is_base_unit' => true],
        ];

        foreach ($units as $unitData) {
            $baseUnitId = null;
            
            if (isset($unitData['base_unit'])) {
                $baseUnit = Unit::where('code', $unitData['base_unit'])->first();
                if ($baseUnit) {
                    $baseUnitId = $baseUnit->id;
                }
            }

            Unit::create([
                'id' => (string) Str::uuid(),
                'account_id' => null, // System default
                'name' => $unitData['name'],
                'code' => $unitData['code'],
                'base_unit_id' => $baseUnitId,
                'conversion_factor' => $unitData['conversion_factor'] ?? 1,
                'is_base_unit' => $unitData['is_base_unit'] ?? false,
                'active' => true,
            ]);
        }

        $this->command->info('✅ Created ' . count($units) . ' system units');
    }
}
