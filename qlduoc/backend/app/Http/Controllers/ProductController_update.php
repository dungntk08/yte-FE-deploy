
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

                    // Update Bids - sync approach (delete all and recreate) or update?
                    // Sync is easier for now given simple UI
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
                    break;
                // Add other cases as needed
            }

            DB::commit();
            return response()->json($product);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Update failed', 'error' => $e->getMessage()], 500);
        }
    }
