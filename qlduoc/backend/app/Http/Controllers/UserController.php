<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        /** @var \App\Models\AppUser $currentUser */
        $currentUser = Auth::user();

        if (!$currentUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // If Super Admin, return all users
        if ($currentUser->IsSuperAdmin) {
             $users = \App\Models\AppUser::select('Id', 'Username', 'FullName')
                ->get();
             return response()->json($users);
        }

        // Get the current user's HealthPostIds
        $userScopes = $currentUser->scopes;
        $healthPostIds = $userScopes->pluck('HealthPostId')->filter()->unique();
        
        // Also get MedicalCenterIds to allow managers to see users in their center
        $medicalCenterIds = $userScopes->pluck('MedicalCenterId')->filter()->unique();

        if ($healthPostIds->isEmpty() && $medicalCenterIds->isEmpty()) {
            return response()->json([]);
        }

        // Find all users that have a scope in these HealthPosts OR MedicalCenters
        $users = \App\Models\AppUser::whereHas('scopes', function ($query) use ($healthPostIds, $medicalCenterIds) {
            $query->where(function($q) use ($healthPostIds, $medicalCenterIds) {
                 if ($healthPostIds->isNotEmpty()) {
                     $q->whereIn('HealthPostId', $healthPostIds);
                 }
                 if ($medicalCenterIds->isNotEmpty()) {
                     $q->orWhereIn('MedicalCenterId', $medicalCenterIds);
                 }
            });
        })
        ->select('Id', 'Username', 'FullName')
        ->get();

        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
