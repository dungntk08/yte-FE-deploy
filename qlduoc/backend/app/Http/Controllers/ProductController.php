<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $query = Product::with(['medicine', 'supply', 'vaccine']);

        // Filter by Scope
        // Request: Products now belong to MedicalCenter.
        $scope = $user->scopes()->first();
        if ($scope) {
            // Note: Both Point User and Master generally belong to a Medical Center.
            // Point User: Has MedicalCenterId (via HealthPost or direct?) 
            // In our system: Point User -> HealthPost -> MedicalCenter.
            // Master: MedicalCenterId.
            
            // We need to resolve the MedicalCenterId for the user.
            $mcId = $scope->MedicalCenterId;
            
            if (!$mcId && $scope->HealthPostId) {
                // If scope doesn't have explicit MC ID, try to get from HealthPost
                $hp = \App\Models\HealthPost::find($scope->HealthPostId);
                if ($hp) $mcId = $hp->MedicalCenterId;
            }

            if ($mcId) {
                $query->where('MedicalCenterId', $mcId);
            } else {
                // Should not happen for valid users, but safety:
                // If no MC found, maybe return empty or allow all? stick to empty for security.
                $query->whereRaw('1 = 0'); 
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('Name', 'like', "%{$search}%")
                  ->orWhere('Code', 'like', "%{$search}%");
            });
        }

        if ($request->has('type_id')) {
            $query->where('ProductTypeId', $request->type_id);
        }

        $products = $query->with(['medicine', 'bids'])->latest('CreatedAt')->paginate(20);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        // 1. Validation
        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:Products,Code',
            'type_id' => 'required|integer|in:1,2,3,4', // 1: Medicine, 2: Supply, 3: Vaccine, 4: Office Supply
            'unit_name' => 'required|string|max:50',
            // Detailed fields validation conditioned by type_id? 
            // Better do loose validation here or specific based on type.
        ];

        // Specific rules based on type
        if ($request->type_id == 1) { // Medicine
             // $rules['active_ingredient'] = 'required|string'; // Optional?
        }
        
        $request->validate($rules);

        DB::beginTransaction();
        try {
            $user = auth()->user();
            $scope = $user->scopes()->first();
            
            // Resolve MedicalCenterId
            $mcId = $scope->MedicalCenterId;
            if (!$mcId && $scope->HealthPostId) {
                $hp = \App\Models\HealthPost::find($scope->HealthPostId);
                if ($hp) $mcId = $hp->MedicalCenterId;
            }

            if (!$mcId) {
                return response()->json(['message' => 'User does not belong to a Medical Center'], 403);
            }

            // Handle Unit (Sync with Units table for suggestion)
            $unitName = $request->unit_name;
            // We still create it in Units table if it doesn't exist, to populate the suggestion list
            \App\Models\Unit::firstOrCreate(
                ['Name' => $unitName], 
                ['Code' => \Illuminate\Support\Str::slug($unitName)]
            );

            // Create Product
            $product = Product::create([
                'Code' => $request->code,
                'Name' => $request->name,
                'ProductTypeId' => $request->type_id,
                'UnitName' => $unitName, // Store string directly
                'MedicalCenterId' => $mcId,
                'IsActive' => $request->active ?? true,
                'PackingRule' => $request->packing_rule ?? null,
                'Manufacturer' => $request->manufacturer,
                'CountryOfOrigin' => $request->country_of_origin,
            ]);

            // Create Type Specific Details
            switch ($request->type_id) {
                case 1: // Medicine
                    \App\Models\ProductMedicine::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientName' => $request->active_ingredient,
                        'Content' => $request->content,
                        'RegistrationNumber' => $request->registration_number,
                        'InsurancePaymentRate' => $request->insurance_payment_rate ?? 100, 
                        'PharmacyType' => $request->pharmacy_type,
                        'PharmacyName' => $request->pharmacy_name,
                        'ActiveIngredientCode' => $request->active_ingredient_code,
                        'UsageRoute' => $request->usage_route,
                        'Dosage' => $request->dosage,
                        'PharmacyCategory' => $request->pharmacy_category,
                        'GroupClassification' => $request->group_classification,
                        'PharmacyGroup' => $request->pharmacy_group,
                        'ServiceGroupInsurance' => $request->service_group_insurance,
                        'MaterialCode' => $request->material_code,
                        'HealthMinistryDecision' => $request->health_ministry_decision,
                        'Usage' => $request->usage,
                        'PrescriptionUnit' => $request->prescription_unit,
                        'ProductCodeDecision130' => $request->product_code_decision_130,
                        'Program' => $request->program,
                        'FundingSource' => $request->funding_source,
                    ]);
                    break;
                case 2: // Supply
                    \App\Models\ProductSupply::create([
                        'ProductId' => $product->Id,
                        'ModelCode' => $request->model_code,
                        'TechnicalStandard' => $request->technical_standard,
                        'DeclarationNumber' => $request->declaration_number,
                        'SupplyGroup' => $request->supply_group,
                        'GroupCode' => $request->group_code,
                        'GroupName' => $request->group_name,
                    ]);
                    break;
                case 3: // Vaccine
                     \App\Models\ProductVaccine::create([
                        'ProductId' => $product->Id,
                        'TargetDisease' => $request->target_disease,
                        'StorageCondition' => $request->storage_condition,
                    ]);
                    break;
                case 4: // Office Supply
                    // No extra table
                    break;
                case 5: // Chemical
                    \App\Models\ProductChemical::create([
                        'ProductId' => $product->Id,
                        'ReferenceCode' => $request->reference_code,
                        'ChemicalFormula' => $request->chemical_formula,
                        'Concentration' => $request->concentration,
                        'RegistrationNumber' => $request->registration_number,
                        'Standard' => $request->standard,
                    ]);
                    break;
            }

            // Save Bids (Common for all types if provided)
            if ($request->has('bids') && is_array($request->bids)) {
                foreach ($request->bids as $bid) {
                    \App\Models\ProductBid::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientCode' => $bid['active_ingredient_code'] ?? null,
                        'InsuranceName' => $bid['insurance_name'] ?? null,
                        'DecisionNumber' => $bid['decision_number'] ?? null,
                        'PackageCode' => $bid['package_code'] ?? null,
                        'GroupCode' => $bid['group_code'] ?? null,
                        'BidPrice' => $bid['bid_price'] ?? 0,
                        'WinningDate' => $bid['winning_date'] ?? null,
                        'ApprovalOrder' => $bid['approval_order'] ?? null,
                        'IsPriority' => $bid['is_priority'] ?? false,
                    ]);
                }
            }

            DB::commit();
            return response()->json($product, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi tạo sản phẩm: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $product = Product::with(['medicine', 'supply', 'vaccine', 'chemical', 'bids'])->findOrFail($id);
        return response()->json($product);
    }

    public function downloadSample(Request $request)
    {
        $type = $request->query('type', 1); // Default to Medicine

        $headers = [
            'Typeto',
            'Name',
            'Code',
            'Unit',
            'Price'
        ];

        // Add type specific headers
        if ($type == 1) { // Medicine
            $headers = array_merge($headers, ['ActiveIngredientName', 'Content', 'RegistrationNumber']);
        } elseif ($type == 2) { // Supply
            $headers = array_merge($headers, ['ModelCode', 'TechnicalStandard']);
        } elseif ($type == 3) { // Vaccine
            $headers = array_merge($headers, ['TargetDisease', 'StorageCondition']);
        } elseif ($type == 5) { // Chemical
            $headers = array_merge($headers, ['ReferenceCode', 'ChemicalFormula', 'Concentration', 'RegistrationNumber', 'Standard']);
        }

        $callback = function() use ($headers, $type) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // BOM for correct UTF-8 in Excel
            fputcsv($file, $headers);

            // Sample Data
            $row = [$type, 'Tên sản phẩm mẫu', 'MA_SP_001', 'Hộp', 10000];

             if ($type == 1) { // Medicine
                $row = array_merge($row, ['Paracetamol', '500mg', 'VD-0000-00']);
            } elseif ($type == 2) { // Supply
                $row = array_merge($row, ['Mẫu 01', 'TCVN']);
            } elseif ($type == 3) { // Vaccine
                $row = array_merge($row, ['Cúm', '2-8 độ C']);
            } elseif ($type == 5) { // Chemical
                $row = array_merge($row, ['CAS-123', 'H2O', '90%', 'SDK-001', 'TCCS']);
            }

            fputcsv($file, $row);
            fclose($file);
        };

        $filename = "mau_nguon_goc_" . $type . ".csv"; 
        $names = [1 => 'thuoc', 2 => 'vat_tu', 3 => 'vac_xin', 4 => 'van_phong_pham', 5 => 'hoa_chat'];
        $name = $names[$type] ?? 'san_pham';
        $filename = "mau_import_{$name}.csv";

        return response()->stream($callback, 200, [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv'
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            // Assume Row 1 is Header
            $header = array_shift($rows);
            
            $count = 0;
            $errors = [];

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                if (empty($row[1])) continue; // Name is empty

                $typeType = (int)($row[0] ?? 1);
                $name = $row[1] ?? 'No Name';
                $code = $row[2] ?? ('P' . time() . $index);
                
                // Check duplicate Code
                if (Product::where('Code', $code)->exists()) {
                    $errors[] = "Row " . ($index + 2) . ": Mã $code đã tồn tại. Bỏ qua.";
                    continue; // Skip Duplicate
                }

                // Handle Unit
                $unitName = $row[3] ?? 'Cái';
                \App\Models\Unit::firstOrCreate(['Name' => $unitName], ['Code' => \Illuminate\Support\Str::slug($unitName)]);

                // Determine MedicalCenterId
                $user = auth()->user();
                $scope = $user->scopes()->first();
                $targetMCId = $scope ? $scope->MedicalCenterId : null;
                 
                if (!$targetMCId && $scope && $scope->HealthPostId) {
                     $hp = \App\Models\HealthPost::find($scope->HealthPostId);
                     if ($hp) $targetMCId = $hp->MedicalCenterId;
                }

                $product = Product::create([
                    'Code' => $code,
                    'Name' => $name,
                    'ProductTypeId' => $typeType,
                    'UnitName' => $unitName,
                    'MedicalCenterId' => $targetMCId,
                    'IsActive' => true
                ]);

                // Details
                if ($typeType === 1) { // Medicine
                    \App\Models\ProductMedicine::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientName' => $row[5] ?? null,
                        'Content' => $row[6] ?? null,
                        'RegistrationNumber' => $row[7] ?? null,
                        'InsurancePaymentRate' => 100
                    ]);
                } elseif ($typeType === 2) { // Supply
                    \App\Models\ProductSupply::create([
                        'ProductId' => $product->Id,
                        'ModelCode' => $row[5] ?? null, // Index shifted? logic in store uses names. Headers: Name,Code,Unit,Price -> 4 cols.
                        // Wait, headers in downloadSample: Type, Name, Code, Unit, Price. (5 cols).
                        // So extra starts at index 5.
                        // Supply row: 5 -> ModelCode, 6 -> Standard.
                        'ModelCode' => $row[5] ?? null, // Corrected index from 8 to 5? 
                        // Previous code used 8? check previous file content.
                        // Previous: $row[8] ?? null. 
                        // Wait, let's check `import` original content.
                        // row[0]=Type, row[1]=Name, row[2]=Code, row[3]=Unit.
                        // Price is row[4]? Original code didn't use price in Create?
                        // Original Medicine: row[5]=ActiveIngredient, 6=Content, 7=Reg.
                        // Original Supply: row[8]=ModelCode?? Why 8? Maybe headers mismatch in original code?
                        // I will assume logic follows downloadSample structure:
                        // 0:Type, 1:Name, 2:Code, 3:Unit, 4:Price.
                        // 5+: Details.
                        'ModelCode' => $row[5] ?? null,
                        'TechnicalStandard' => $row[6] ?? null,
                    ]);
                } elseif ($typeType === 3) { // Vaccine
                    \App\Models\ProductVaccine::create([
                        'ProductId' => $product->Id,
                        'TargetDisease' => $row[5] ?? null,
                        'StorageCondition' => $row[6] ?? '2-8°C'
                    ]);
                } elseif ($typeType === 5) { // Chemical
                    \App\Models\ProductChemical::create([
                        'ProductId' => $product->Id,
                        'ReferenceCode' => $row[5] ?? null,
                        'ChemicalFormula' => $row[6] ?? null,
                        'Concentration' => $row[7] ?? null,
                        'RegistrationNumber' => $row[8] ?? null,
                        'Standard' => $row[9] ?? null,
                    ]);
                }     $count++;
            }

            DB::commit();

            return response()->json([
                'message' => "Imported $count products successfully.",
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);

        $rules = [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:Products,Code,' . $id . ',Id',
            'unit_name' => 'required|string|max:50',
        ];
        $request->validate($rules);

        DB::beginTransaction();
        try {
            // Update Unit if new
            $unitName = $request->unit_name;
             \App\Models\Unit::firstOrCreate(
                ['Name' => $unitName], 
                ['Code' => \Illuminate\Support\Str::slug($unitName)]
            );

            $product->update([
                'Code' => $request->code,
                'Name' => $request->name,
                'UnitName' => $unitName,
                'IsActive' => $request->active ?? $product->IsActive,
                'PackingRule' => $request->packing_rule ?? $product->PackingRule,
                'Manufacturer' => $request->manufacturer ?? $product->Manufacturer,
                'CountryOfOrigin' => $request->country_of_origin ?? $product->CountryOfOrigin,
            ]);

            // Update Details
             switch ($product->ProductTypeId) {
                case 1: // Medicine
                    $detail = \App\Models\ProductMedicine::where('ProductId', $product->Id)->first();
                    if ($detail) {
                        $detail->update([
                           'ActiveIngredientName' => $request->active_ingredient,
                            'Content' => $request->content,
                            'RegistrationNumber' => $request->registration_number,
                            'InsurancePaymentRate' => $request->insurance_payment_rate ?? $detail->InsurancePaymentRate,
                            'PharmacyType' => $request->pharmacy_type,
                            'PharmacyName' => $request->pharmacy_name,
                            'ActiveIngredientCode' => $request->active_ingredient_code,
                            'UsageRoute' => $request->usage_route,
                            'Dosage' => $request->dosage,
                            'PharmacyCategory' => $request->pharmacy_category,
                            'GroupClassification' => $request->group_classification,
                            'PharmacyGroup' => $request->pharmacy_group,
                            'ServiceGroupInsurance' => $request->service_group_insurance,
                            'MaterialCode' => $request->material_code,
                            'HealthMinistryDecision' => $request->health_ministry_decision,
                            'Usage' => $request->usage,
                            'PrescriptionUnit' => $request->prescription_unit,
                            'ProductCodeDecision130' => $request->product_code_decision_130,
                            'Program' => $request->program,
                            'FundingSource' => $request->funding_source,
                        ]);
                    }
                    break;
                case 2: // Supply
                    $detail = \App\Models\ProductSupply::where('ProductId', $product->Id)->first();
                    if ($detail) {
                        $detail->update([
                           'ModelCode' => $request->model_code,
                            'TechnicalStandard' => $request->technical_standard,
                            'DeclarationNumber' => $request->declaration_number,
                            'SupplyGroup' => $request->supply_group,
                            'GroupCode' => $request->group_code,
                            'GroupName' => $request->group_name,
                        ]);
                    } else {
                         \App\Models\ProductSupply::create([
                            'ProductId' => $product->Id,
                            'ModelCode' => $request->model_code,
                            'TechnicalStandard' => $request->technical_standard,
                            'DeclarationNumber' => $request->declaration_number,
                            'SupplyGroup' => $request->supply_group,
                            'GroupCode' => $request->group_code,
                            'GroupName' => $request->group_name,
                        ]);
                    }
                    break;
            }

            // Update Bids - sync approach
            if ($request->has('bids') && is_array($request->bids)) {
                \App\Models\ProductBid::where('ProductId', $product->Id)->delete();
                foreach ($request->bids as $bid) {
                    \App\Models\ProductBid::create([
                        'ProductId' => $product->Id,
                        'ActiveIngredientCode' => $bid['active_ingredient_code'] ?? null,
                        'InsuranceName' => $bid['insurance_name'] ?? null,
                        'DecisionNumber' => $bid['decision_number'] ?? null,
                        'PackageCode' => $bid['package_code'] ?? null,
                        'GroupCode' => $bid['group_code'] ?? null,
                        'BidPrice' => $bid['bid_price'] ?? 0,
                        'WinningDate' => $bid['winning_date'] ?? null,
                        'ApprovalOrder' => $bid['approval_order'] ?? null,
                        'IsPriority' => $bid['is_priority'] ?? false,
                    ]);
                }
            }

            DB::commit();
            return response()->json($product);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }
}
