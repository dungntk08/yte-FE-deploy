<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\AppUser $user */
        $user = auth()->user();

        // Use the scope implemented in Supplier model
        $query = Supplier::query()->forUser($user);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('Name', 'like', "%{$search}%")
                  ->orWhere('Code', 'like', "%{$search}%")
                  ->orWhere('Phone', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->latest('CreatedAt')->paginate(20);
        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Name' => 'required|string|max:200',
            'Code' => 'required|string|unique:Suppliers,Code',
            'Phone' => 'nullable|string',
            'Address' => 'nullable|string',
            'Email' => 'nullable|email',
            'TaxCode' => 'nullable|string'
        ]);

        /** @var \App\Models\AppUser $user */
        $user = auth()->user();
        
        // If not super admin, assign to first Medical Center
        if (!$user->IsSuperAdmin) {
             $medicalCenterId = $user->scopes->pluck('MedicalCenterId')->filter()->first();
             if ($medicalCenterId) {
                 $validated['MedicalCenterId'] = $medicalCenterId;
             }
        }

        $supplier = Supplier::create($validated);
        return response()->json($supplier, 201);
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        return response()->json($supplier);
    }
}
