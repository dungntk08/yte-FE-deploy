<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Supplier;
use Ramsey\Uuid\Uuid;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = __DIR__ . '/DM_NhaCungCap.csv';
        
        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: $csvFile");
            return;
        }

        $file = fopen($csvFile, 'r');
        $header = fgetcsv($file); // Skip header

        // CSV Structure seems to be:
        // "NguonNhapID","Ten","DiaChi","TinhThanh","QuocGia","DienThoai","Fax","GhiChu","Email","WebSite","Loai","HienThi"
        
        $batch = [];
        $now = now();
        
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                // skip if name or code is missing
                if (empty($row[0]) || empty($row[1])) {
                    continue;
                }

                $code = trim($row[0]);
                $name = trim($row[1]);

                // Determine Address
                $addressParts = [];
                if (!empty($row[2])) $addressParts[] = trim($row[2]);
                if (!empty($row[3])) $addressParts[] = trim($row[3]);
                if (!empty($row[4])) $addressParts[] = trim($row[4]);
                $fullAddress = implode(', ', $addressParts);

                // Check invalid phone/email length
                $phone = substr($row[5] ?? '', 0, 50);
                $email = substr($row[8] ?? '', 0, 100);

                // Update or Create
                // Key is Code.
                Supplier::updateOrCreate(
                    ['Code' => $code],
                    [
                        'Name' => $name,
                        'Address' => substr($fullAddress, 0, 500),
                        'Phone' => $phone,
                        'Email' => $email,
                        'IsActive' => true,
                        'HealthPostId' => null // Global Supplier
                    ]
                );
            }
            DB::commit();
            $this->command->info('Suppliers seeded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to seed suppliers: ' . $e->getMessage());
        }

        fclose($file);
    }
}
