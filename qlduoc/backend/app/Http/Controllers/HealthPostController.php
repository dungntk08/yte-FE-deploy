<?php

namespace App\Http\Controllers;

use App\Models\HealthPost;
use App\Models\Warehouse;
use App\Models\UserScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class HealthPostController extends Controller
{
    public function index(Request $request)
    {
        // Admin mode: if 'all' or specific filter is requested without scope restrictions
        // For now, let's allow filtering by MedicalCenterId
        $query = HealthPost::with('medicalCenter');

        if ($request->has('medical_center_id')) {
            $query->where('MedicalCenterId', $request->medical_center_id);
        }

        // If not explicit admin request, apply user scope logic? 
        // The requirement implies this is for "Admin" management.
        // Let's keep it simple: return all if no filter, or filter by MC.
        // We might need to protect this route with 'admin' middleware later.
        
        $posts = $query->orderBy('Name')->get();
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Name' => 'required|string|max:255',
            'Code' => 'required|string|unique:HealthPosts,Code',
            'MedicalCenterId' => 'required|exists:MedicalCenters,Id',
            'Address' => 'nullable|string',
        ]);

        $post = HealthPost::create($request->all());
        return response()->json($post, 201);
    }

    public function show($id)
    {
        $post = HealthPost::with('medicalCenter')->findOrFail($id);
        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $post = HealthPost::findOrFail($id);
        
        $request->validate([
            'Name' => 'sometimes|required|string|max:255',
            'Code' => 'sometimes|required|string|unique:HealthPosts,Code,' . $id . ',Id',
            'MedicalCenterId' => 'sometimes|required|exists:MedicalCenters,Id',
            'Address' => 'nullable|string',
        ]);

        $oldMedicalCenterId = $post->MedicalCenterId;
        $newMedicalCenterId = $request->input('MedicalCenterId');

        DB::transaction(function () use ($post, $request, $oldMedicalCenterId, $newMedicalCenterId) {
            $post->update($request->all());

            // Cascade Update Logic
            if ($newMedicalCenterId && $oldMedicalCenterId != $newMedicalCenterId) {
                // Update Warehouses
                Warehouse::where('HealthPostId', $post->Id)
                         ->update(['MedicalCenterId' => $newMedicalCenterId]);
                
                // Update UserScopes
                UserScope::where('HealthPostId', $post->Id)
                         ->update(['MedicalCenterId' => $newMedicalCenterId]);
            }
        });

        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = HealthPost::findOrFail($id);
        
        if ($post->warehouses()->exists()) {
             return response()->json(['message' => 'Cannot delete Health Post with existing Warehouses.'], 400);
        }

        $post->delete();
        return response()->json(null, 204);
    }
}
