<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductMedicine;
use App\Models\ProductBid;
use App\Models\Unit;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportMedicineSeeder extends Seeder
{
    public function run()
    {
        // Path to Excel file
        $file = __DIR__ . '/data_thuoc.xlsx';
        
        if (!file_exists($file)) {
            $this->command->error("File not found: $file");
            return;
        }

        $this->command->info('Cleaning existing medicine data...');
        DB::beginTransaction();
        try {
            // Delete existing products of type 1 (Medicine)
            // Relies on cascades or manual cleanup if no foreign keys.
            // Assuming simplified cleanup of IDs first.
            $productIds = Product::where('ProductTypeId', 1)->pluck('Id');
            
            ProductMedicine::whereIn('ProductId', $productIds)->delete();
            ProductBid::whereIn('ProductId', $productIds)->delete();
            Product::whereIn('Id', $productIds)->delete();

            $this->command->info('Existing data cleaned. Importing new data...');

            $spreadsheet = IOFactory::load($file);
            $sheets = $spreadsheet->getAllSheets();

            foreach ($sheets as $sheet) {
                $rows = $sheet->toArray();
                // Remove header
                $header = array_shift($rows);
                if (!$header) continue;

                // Normalization helper
                $normalize = function($h) {
                    $slug = \Illuminate\Support\Str::slug($h, ''); 
                    // slug removes accents? "Tên thuốc" -> "tenthuoc". "tenDayDu" -> "tendaydu".
                    // "Đơn giá *" -> "dongia".
                    return $slug;
                };

                // Create Map: Slug => Index
                $map = [];
                foreach ($header as $i => $h) {
                    if (!$h) continue;
                    $map[$normalize($h)] = $i;
                }

                // Helper to get value
                $get = function($keys, $row) use ($map) {
                    if (is_string($keys)) $keys = [$keys];
                    foreach ($keys as $k) {
                        if (isset($map[$k])) return $row[$map[$k]];
                    }
                    return null;
                };
                
                foreach ($rows as $row) {
                    $name = $get(['tendaydu', 'tenthuoc'], $row);
                    if (!$name) continue;

                    // Code: 'ma' (Camel), 'mathuoc' (Verbose), 'mahoatchat' (Code 1?)
                    // In Verbose: Code is 'mathuoc' (18). 
                    $code = $get(['ma', 'mathuoc'], $row) ?? ('MED' . uniqid());
                    
                    // Handle Duplicate Code
                    if (Product::where('Code', $code)->exists()) {
                         $code = $code . '_' . uniqid();
                    }

                    $unitName = $get(['donvitinh', 'dvt'], $row) ?? 'Viên';
                    
                    $unit = Unit::firstOrCreate(['Name' => $unitName], ['Code' => \Illuminate\Support\Str::slug($unitName)]);

                    // Get Default Medical Center
                    $medicalCenterId = \App\Models\MedicalCenter::first()->Id ?? null;

                    $product = Product::create([
                        'Code' => $code,
                        'Name' => $name,
                        'ProductTypeId' => 1, // Medicine
                        'MedicalCenterId' => $medicalCenterId,
                        'UnitName' => $unitName,
                        'PackingRule' => $get(['quycach', 'donggoi'], $row),
                        'IsActive' => true
                    ]);

                    // Details
                    ProductMedicine::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientName' => $get(['hoatchat'], $row),
                        'Content' => $get(['hamluong'], $row),
                        'RegistrationNumber' => $get(['sodangky', 'sodk'], $row),
                        'UsageRoute' => $get(['duongdung'], $row),
                        'PharmacyCategory' => $get(['tenloaiduoc', 'loaithuoc'], $row), // 'tenLoaiDuoc' (Camel), 'Loại thuốc' (Verbose) -> loaithuoc
                        'PharmacyGroup' => $get(['tennhomduoc'], $row), // 'tenNhomDuoc' (Camel)
                        'MaterialCode' => $get(['madmdc'], $row),
                    ]);

                    // Bid
                    // 'donGiaThau' (Camel) -> dongiathau
                    // 'Đơn giá' (Verbose) -> dongia
                    // 'Số quyết định' (Verbose) -> soquyetdinh
                    // 'soQDThau' (Camel) -> soqdthau
                    $bidPrice = $get(['dongiathau', 'dongia', 'dongiathanhhoan'], $row);
                    // Filter non-numeric chars from price (e.g. commas)
                    if ($bidPrice) {
                        $bidPrice = (float)str_replace(',', '', $bidPrice);
                    } else {
                        $bidPrice = 0;
                    }

                    $decision = $get(['soqdthau', 'soquyetdinh'], $row);
                    
                    // PackageCode: 'goiThau' (Camel) -> goithau. 'Loại thầu' (Verbose) -> loaithau.
                    // GroupCode: 'nhomThau' (Camel) -> nhomthau. 'Nhóm thầu' (Verbose) -> nhomthau.

                    if ($bidPrice || $decision) {
                        ProductBid::create([
                            'ProductId' => $product->Id,
                            'DecisionNumber' => $decision,
                            'PackageCode' => $get(['goithau', 'loaithau'], $row),
                            'GroupCode' => $get(['nhomthau'], $row), 
                            'BidPrice' => $bidPrice,
                            'WinningDate' => date('Y-m-d'), 
                            'IsPriority' => true
                        ]);
                    }
                }
            }
            
            DB::commit();
            $this->command->info('Import completed successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error: ' . $e->getMessage());
        }
    }
}
