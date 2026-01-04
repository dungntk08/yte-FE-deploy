<?php

namespace App\Http\Controllers;

use App\Models\MedicalCenter;
use Illuminate\Http\Request;

class MedicalCenterController extends Controller
{
    public function index()
    {
        $centers = MedicalCenter::withCount('healthPosts')->get();
        return response()->json($centers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'Name' => 'required|string|max:255',
            'Address' => 'nullable|string',
            'Code' => 'nullable|string|unique:MedicalCenters,Code',
        ]);

        $center = MedicalCenter::create($request->only(['Name', 'Code', 'Address']));
        return response()->json($center, 201);
    }

    public function show($id)
    {
        $center = MedicalCenter::with('healthPosts')->findOrFail($id);
        return response()->json($center);
    }

    public function update(Request $request, $id)
    {
        $center = MedicalCenter::findOrFail($id);
        
        $request->validate([
            'Name' => 'sometimes|required|string|max:255',
            'Address' => 'nullable|string',
            'Code' => 'nullable|string|unique:MedicalCenters,Code,' . $id . ',Id',
        ]);

        $center->update($request->only(['Name', 'Code', 'Address']));
        return response()->json($center);
    }

    public function destroy($id)
    {
        $center = MedicalCenter::findOrFail($id);
        
        // Check for dependencies if needed, or let DB foreign keys handle it
        if ($center->healthPosts()->exists()) {
            return response()->json(['message' => 'Cannot delete Medical Center with existing Health Posts.'], 400);
        }

        $center->delete();
        return response()->json(null, 204);
    }
}
