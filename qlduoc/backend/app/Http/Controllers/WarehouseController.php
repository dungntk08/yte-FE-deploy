<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Warehouse;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        // Return warehouses the user belongs to, OR all if admin? 
        // For strict permission as requested "Người dùng cần có phân quyền từng kho",
        // we should return only assigned warehouses.
        // But the creator needs to see them to manage?
        // Let's assume:
        // 1. If user has 'warehouse.view_all', see all.
        // 2. Otherwise see assigned warehouses.
        
        // For simplicity now: users see assigned warehouses.
        // But for the initial creation, the Admin needs to see the list.
        // If the admin creates a warehouse, they get assigned. So they see it.
        
        $warehouses = $user->warehouses()
            ->with(['healthPost:Id,Name']) // Eager load HealthPost with only Id and Name
            ->orderBy('CreatedAt', 'desc')
            ->get();
            
        return response()->json($warehouses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:Warehouses,Code', // Case-sensitive table/column check usually irrelevant for MySQL on Mac but ensuring table name is PascalCase
            'name' => 'required|string',
            'type' => 'nullable|string',
            'department' => 'nullable|string',
            'is_pharmacy' => 'boolean',
            'active' => 'boolean',
            'health_post_id' => 'nullable|exists:HealthPosts,Id',
        ]);

        $user = Auth::user();

        // Note: New schema uses PascalCase for attributes. 
        // We'll map request snake_case to PascalCase for now, or assume request matches.
        // Assuming request sends snake_case from frontend.
        
        // We need to determine HealthPostId. 
        // If current user is Manager of a HP, we can assign that. 
        // Or passed in request? 
        // For now, let's just create it. But wait, HealthPostId is REQUIRED in DB.
        // We need to get it from User Scope.
        // Check for User Scope
        $scope = $user->scopes()->first();
        if (!$scope) {
             return response()->json(['message' => 'User does not belong to any scope'], 400);
        }

        $targetHealthPostId = null;
        $targetMedicalCenterId = null;

        if ($request->has('health_post_id')) {
            $requestPostId = $request->health_post_id;
            
            // Validate user access to this requestPostId
            // 1. If User has specific HealthPostId in scope, must match.
            if ($scope->HealthPostId && $scope->HealthPostId != $requestPostId) {
                return response()->json(['message' => 'User cannot create warehouse for this Health Post'], 403);
            }

            // 2. If User is Master (MedicalCenterId set, HealthPostId might be null or different?)
            // If scope has MedicalCenterId, verify the requested post belongs to it.
            if ($scope->MedicalCenterId) {
                $checkPost = \App\Models\HealthPost::where('Id', $requestPostId)
                    ->where('MedicalCenterId', $scope->MedicalCenterId)
                    ->exists();
                if (!$checkPost) {
                    return response()->json(['message' => 'Health Post does not belong to your Medical Center'], 403);
                }
                $targetMedicalCenterId = $scope->MedicalCenterId;
            }
            
            $targetHealthPostId = $requestPostId;
        } else {
            // No input, try to infer default
            if ($scope->HealthPostId) {
                $targetHealthPostId = $scope->HealthPostId;
            } else {
                return response()->json(['message' => 'health_post_id is required for your account type'], 400);
            }
        }

        // Final check
        if (!$targetHealthPostId) {
             return response()->json(['message' => 'Unable to determine Health Post'], 400);
        }

        // Fetch HealthPost to get/confirm MedicalCenterId if not set
        if (!$targetMedicalCenterId) {
            $healthPost = \App\Models\HealthPost::find($targetHealthPostId);
            $targetMedicalCenterId = $healthPost ? $healthPost->MedicalCenterId : null;
        }

        $warehouse = Warehouse::create([
            'HealthPostId' => $targetHealthPostId,
            'MedicalCenterId' => $targetMedicalCenterId,
            'Code' => $request->code, 
            'Name' => $request->name,
            'Type' => $request->type ?? 'Main',
            'IsActive' => $request->active ?? true,
        ]);

        return response()->json($warehouse, 201);
    }

    public function show(string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        return response()->json($warehouse);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);

        $request->validate([
            'code' => 'sometimes|string|unique:Warehouses,Code,' . $id,
            'name' => 'sometimes|string',
            'type' => 'nullable|string',
            'is_pharmacy' => 'boolean',
            'active' => 'boolean',
            'health_post_id' => 'nullable|exists:HealthPosts,Id',
        ]);
        
        $data = [];
        if ($request->has('code')) $data['Code'] = $request->code;
        if ($request->has('name')) $data['Name'] = $request->name;
        if ($request->has('type')) $data['Type'] = $request->type;
        // if ($request->has('is_pharmacy')) $data['IsPharmacy'] = $request->is_pharmacy; // Column not in DB
        if ($request->has('active')) $data['IsActive'] = $request->active;
        
        // Handle HealthPost change if permitted? For now allowing it if they have access.
        // But changing HealthPost might affect permissions. 
        // If they are Master, they can move it. If Point user, they can't change it outside their scope.
        // Re-using logic from store mostly.
        if ($request->has('health_post_id')) {
             $user = Auth::user();
             $scope = $user->scopes()->first();
             $requestPostId = $request->health_post_id;

             // Validate access to new Post
            if ($scope->HealthPostId && $scope->HealthPostId != $requestPostId) {
                return response()->json(['message' => 'User cannot move warehouse to this Health Post'], 403);
            }
            if ($scope->MedicalCenterId) {
                $checkPost = \App\Models\HealthPost::where('Id', $requestPostId)
                    ->where('MedicalCenterId', $scope->MedicalCenterId)
                    ->exists();
                if (!$checkPost) {
                    return response()->json(['message' => 'Health Post does not belong to your Medical Center'], 403);
                }
            }
            
            $data['HealthPostId'] = $requestPostId;
            // Also update MedicalCenterId if HealthPost changes
            $healthPost = \App\Models\HealthPost::find($requestPostId);
            $data['MedicalCenterId'] = $healthPost ? $healthPost->MedicalCenterId : null;
        }

        $warehouse->update($data);

        return response()->json($warehouse);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        $warehouse->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Permission Management
    // With the new scope-based permission system:
    // - Users belong to Health Posts via UserScopes.
    // - Warehouses belong to Health Posts.
    // - Users have access to all warehouses in their Health Post (for Managers/Staff as defined).
    // Therefore, direct assignment of users to warehouses (WarehouseUsers pivot) is no longer primary.
    // We strictly use Scopes.

    public function getUsers(string $id)
    {
        // Get users who have scope for the Health Post of this Warehouse
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        
        // Find users with Scope.HealthPostId == $warehouse->HealthPostId
        $users = \App\Models\AppUser::whereHas('scopes', function($q) use ($warehouse) {
            $q->where('HealthPostId', $warehouse->HealthPostId);
        })->get();

        return response()->json($users);
    }

    public function assignUser(Request $request, string $id)
    {
        return response()->json(['message' => 'User assignment is now managed via Health Post Scopes.'], 400);
    }

    public function removeUser(string $id, string $userId)
    {
        return response()->json(['message' => 'User assignment is now managed via Health Post Scopes.'], 400);
    }
}
