<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MedicalCenter;
use App\Models\HealthPost;
use App\Models\Warehouse;
use App\Models\AppUser;
use App\Models\AppRole;
use App\Models\UserScope;
use App\Models\Product;
use App\Models\ProductMedicine;
use App\Models\ProductSupply;
use App\Models\ProductVaccine;
use App\Models\Supplier;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedOrganizationAndUsers();
        $this->seedSuppliers();
        $this->seedProducts();
        $this->call(InventorySeeder::class);
    }

    private function seedOrganizationAndUsers()
    {
        $this->command->info('🏗 Seeding Organization & Users...');

        // Roles
        $roleStaff = AppRole::create(['Name' => 'Nhân viên', 'Code' => 'STAFF']);
        $roleManager = AppRole::create(['Name' => 'Trưởng trạm', 'Code' => 'MANAGER']);

        // 1. Medical Center
        $mc = MedicalCenter::create([
            'Code' => 'MC001',
            'Name' => 'Trung tâm Y tế Huyện Demo',
            'Address' => 'Số 1, Đường Demo',
            'IsActive' => true
        ]);

        // 2. Health Posts (5)
        for ($i = 1; $i <= 5; $i++) {
            $hp = HealthPost::create([
                'MedicalCenterId' => $mc->Id,
                'Code' => 'HP00' . $i,
                'Name' => 'Trạm Y tế Xã ' . $i,
                'Address' => 'Xã ' . $i,
            ]);

            // 3. Warehouses (2 per HP)
            Warehouse::create(['HealthPostId' => $hp->Id, 'Name' => 'Kho Chẵn', 'Type' => 'Main', 'IsActive' => true]);
            Warehouse::create(['HealthPostId' => $hp->Id, 'Name' => 'Kho Lẻ', 'Type' => 'Retail', 'IsActive' => true]);

            // 4. Users (2 per HP)
            for ($u = 1; $u <= 2; $u++) {
                $user = AppUser::create([
                    'Username' => "user_hp{$i}_{$u}",
                    'PasswordHash' => Hash::make('123456'), // Use Hash::make
                    'FullName' => "Nhân viên {$u} - Trạm {$i}",
                    'IsSuperAdmin' => false
                ]);

                // Scope
                UserScope::create([
                    'UserId' => $user->Id,
                    'RoleId' => $roleStaff->Id,
                    'MedicalCenterId' => $mc->Id,
                    'HealthPostId' => $hp->Id
                ]);
            }
        }

        // 5. Super Admin
        AppUser::create([
            'Username' => 'admin',
            'PasswordHash' => Hash::make('admin123'),
            'FullName' => 'Super Administrator',
            'IsSuperAdmin' => true
        ]);

        $this->command->info('✅ Organization & Users seeded.');
    }

    private function seedProducts()
    {
        $this->command->info('💊 Seeding Products from Excel...');

        $excelFile = database_path('seeders/danh_sach_duoc_pham_mau_917_23_12_2025_12_52.xlsx');
        if (!file_exists($excelFile)) {
            $this->command->error('File not found: ' . $excelFile);
            return;
        }

        try {
            // Check if IOFactory exists
            if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
                $this->command->error('PhpSpreadsheet is not installed.');
                return;
            }

            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($excelFile);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            $headers = array_shift($rows);

            $count = 0;

            foreach ($rows as $row) {
                $data = array_combine($headers, $row);
                if (empty($data['TEN_THUOC'])) continue;

                // Determine Sub-Type
                $loaiThuoc = mb_strtolower($data['LOAI_THUOC'] ?? '', 'UTF-8');
                
                // 1: Medicine, 2: Supply, 3: Vaccine
                $typeId = 1; 
                if (str_contains($loaiThuoc, 'vắc xin') || str_contains($loaiThuoc, 'vaccine')) {
                    $typeId = 3;
                } elseif (str_contains($loaiThuoc, 'vật tư') || str_contains($loaiThuoc, 'vtyt')) {
                    $typeId = 2;
                }

                // Create Product Base
                $product = Product::create([
                    'Code' => $data['MA_THUOC_BV'] ?? ('M' . Str::random(8)),
                    'Name' => $data['TEN_THUOC'],
                    'ProductTypeId' => $typeId,
                    'UnitId' => 1, // Defaulting to 1 as we don't have Units table yet
                    'Manufacturer' => $data['HANG_SX'] ?? null,
                    'CountryOfOrigin' => $data['NUOC_SX'] ?? null,
                    'PackingRule' => $data['DONG_GOI'] ?? null,
                    'IsActive' => true
                ]);

                // Create Sub-Table Entry
                if ($typeId === 1) { // Medicine
                    ProductMedicine::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientName' => $data['HOAT_CHAT'] ?? null,
                        'Content' => $data['HAM_LUONG'] ?? null,
                        'RegistrationNumber' => $data['SO_DANG_KY'] ?? null,
                        'InsuranceCode' => null, // Not in excel mapping explicitly or 'MA_THUOC_BV'?
                        'InsurancePaymentRate' => 100 // Default
                    ]);
                } elseif ($typeId === 2) { // Supply
                    ProductSupply::create([
                        'ProductId' => $product->Id,
                        'ModelCode' => null,
                        'TechnicalStandard' => null,
                        'IsReusable' => false,
                        'MaterialType' => null
                    ]);
                } elseif ($typeId === 3) { // Vaccine
                    ProductVaccine::create([
                        'ProductId' => $product->Id,
                        'TargetDisease' => null,
                        'StorageCondition' => '2-8°C',
                        'SourceType' => null
                    ]);
                }

                $count++;
                if ($count % 50 == 0) $this->command->info("   Imported $count products...");
            }

            $this->command->info("✅ Imported $count products successfully.");

        } catch (\Exception $e) {
            $this->command->error("Error importing products: " . $e->getMessage());
        }
    }

    private function seedSuppliers()
    {
        $this->command->info('🏭 Seeding Suppliers...');
        Supplier::create(['Code' => 'SUP001', 'Name' => 'Công ty Dược phẩm Trung ương 1', 'Phone' => '0243856234', 'IsActive' => true]);
        Supplier::create(['Code' => 'SUP002', 'Name' => 'Công ty Dược phẩm Traphaco', 'Phone' => '0243768594', 'IsActive' => true]);
        Supplier::create(['Code' => 'SUP003', 'Name' => 'Công ty Dược Hậu Giang', 'Phone' => '02923891433', 'IsActive' => true]);
        $this->command->info('✅ Suppliers seeded.');
    }
}
