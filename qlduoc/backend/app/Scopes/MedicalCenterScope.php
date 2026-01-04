<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;
use App\Models\AppUser;

class MedicalCenterScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model)
    {
        if (Auth::check()) {
            /** @var AppUser $user */
            $user = Auth::user();

            // Get user's scoped Medical Center IDs
            // optimize: eager load scopes if possible, or cache
            $medicalCenterIds = $user->scopes()->pluck('MedicalCenterId')->filter()->unique();

            if ($medicalCenterIds->isNotEmpty()) {
                $builder->whereIn($model->getTable() . '.MedicalCenterId', $medicalCenterIds);
            } else {
                // Determine behavior for users with NO scope (e.g. Super Admin or unassigned)
                // Option A: See nothing (Strict/Safe)
                // Option B: See everything
                
                // Going with Option A for safety, unless they have a specific 'admin' role check here?
                // For now, if no MC assigned, they see nothing of scoped data.
                
                // Allow empty result set
                $builder->whereRaw('1 = 0'); 
            }
        }
    }
}
