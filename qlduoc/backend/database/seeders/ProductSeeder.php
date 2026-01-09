<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔍 Reading Excel file...');
        
        $excelFile = database_path('seeders/danh_sach_duoc_pham_mau_917_23_12_2025_12_52.xlsx');
        
        if (!file_exists($excelFile)) {
            $this->command->error('File not found: ' . $excelFile);
            return;
        }

        try {
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($excelFile);
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            // Lấy header (dòng đầu tiên)
            $headers = array_shift($rows);
            
            $this->command->info('📋 Headers: ' . implode(', ', $headers));
            $this->command->info('📊 Total rows: ' . count($rows));
            
            // Lấy account đầu tiên
            $account = \App\Models\Account::first();
            if (!$account) {
                $this->command->error('No account found! Please create an account first.');
                return;
            }
            $this->command->info('🏢 Using account: ' . $account->name);
            
            // Lấy đơn vị "Viên" mặc định
            $defaultUnit = Unit::where('code', 'VIEN')->first();
            
            $imported = 0;
            $skipped = 0;
            $errors = [];
            
            DB::beginTransaction();
            
            try {
                foreach ($rows as $index => $row) {
                    // Map dữ liệu từ Excel theo tên cột thực tế
                    $data = array_combine($headers, $row);
                    
                    // Skip nếu không có tên thuốc
                    if (empty($data['TEN_THUOC'])) {
                        $skipped++;
                        continue;
                    }
                    
                    // Phân loại dựa trên LOAI_THUOC hoặc SO_DANG_KY
                    $productType = 'medicine'; // Mặc định
                    $isColdChain = false;
                    
                    $loaiThuoc = strtolower($data['LOAI_THUOC'] ?? '');
                    if (str_contains($loaiThuoc, 'vắc xin') || str_contains($loaiThuoc, 'vaccine')) {
                        $productType = 'vaccine';
                        $isColdChain = true;
                    } elseif (str_contains($loaiThuoc, 'vật tư') || str_contains($loaiThuoc, 'vtyt')) {
                        $productType = 'medical_supply';
                    }
                    
                    // Tạo product
                    $productData = [
                        'id' => (string) Str::uuid(),
                        'account_id' => $account->id, // Use first account
                        'product_type' => $productType,
                        'is_batch_managed' => true,
                        'is_cold_chain' => $isColdChain,
                        
                        // Thông tin cơ bản
                        'name' => $data['TEN_THUOC'],
                        'code' => $data['MA_THUOC_BV'] ?? null,
                        'unit' => $data['DON_VI_TINH'] ?? 'Viên',
                        'base_unit_id' => $defaultUnit?->id,
                        
                        // Số đăng ký - QUAN TRỌNG để phân biệt loại dược
                        'registration_number' => $data['SO_DANG_KY'] ?? null,
                        
                        // Thông tin chi tiết
                        'concentration' => $data['HAM_LUONG'] ?? null,
                        'active_ingredient' => $data['HOAT_CHAT'] ?? null,
                        'active_ingredient_code' => $data['MA_HOAT_CHAT'] ?? null,
                        'packaging_spec' => $data['DONG_GOI'] ?? null,
                        'manufacturer' => $data['HANG_SX'] ?? null,
                        'country_of_origin' => $data['NUOC_SX'] ?? null,
                        
                        // Loại thuốc
                        'material_type' => $data['LOAI_THUOC'] ?? 'Thuốc',
                        'drug_type' => $data['LOAI_THUOC'] ?? 'Thuốc tây y',
                        
                        // Đường dùng
                        'usage_route' => $data['DUONG_DUNG'] ?? null,
                        'usage_route_code' => $data['MA_DUONG_DUNG'] ?? null,
                        
                        // Thông tin thầu
                        'bidder' => $data['NHA_THAU'] ?? null,
                        'bid_type' => $data['LOAI_THAU'] ?? null,
                        'bid_group' => $data['NHOM_THAU'] ?? null,
                        'decision_number' => $data['QUYET_DINH'] ?? null,
                        
                        // Giá và tồn kho
                        'price' => !empty($data['DON_GIA']) ? (float)$data['DON_GIA'] : 0,
                        'bid_price' => !empty($data['DON_GIA_TT']) ? (float)$data['DON_GIA_TT'] : 0,
                        'min_stock' => 0,
                        'min_stock_level' => 100, // Mặc định cảnh báo khi < 100
                        
                        'hospital_id' => $data['MA_CSKCB'] ?? null,
                        'active' => true,
                    ];
                    
                    try {
                        Product::create($productData);
                        $imported++;
                        
                        if ($imported % 50 == 0) {
                            $this->command->info("✓ Imported {$imported} products...");
                        }
                    } catch (\Exception $e) {
                        $errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                        $skipped++;
                    }
                }
                
                DB::commit();
                
                $this->command->info("✅ Import completed!");
                $this->command->info("   - Imported: {$imported}");
                $this->command->info("   - Skipped: {$skipped}");
                
                if (!empty($errors)) {
                    $this->command->warn("⚠️  Errors:");
                    foreach (array_slice($errors, 0, 10) as $error) {
                        $this->command->error("   " . $error);
                    }
                    if (count($errors) > 10) {
                        $this->command->warn("   ... and " . (count($errors) - 10) . " more errors");
                    }
                }
                
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error('Error during import: ' . $e->getMessage());
                throw $e;
            }
            
        } catch (\Exception $e) {
            $this->command->error('Error reading Excel: ' . $e->getMessage());
        }
    }
}
