<?php

namespace App\Traits;

use App\Scopes\MedicalCenterScope;
use Illuminate\Support\Facades\Auth;

trait HasMedicalCenterScope
{
    /**
     * Boot the scope.
     */
    protected static function bootHasMedicalCenterScope()
    {
        static::addGlobalScope(new MedicalCenterScope);

        static::creating(function ($model) {
            if (Auth::check() && !$model->MedicalCenterId) {
                // Auto-assign from first available scope if not set
                // Logic: Take the first Medical Center from user's scopes
                $user = Auth::user();
                $firstScope = $user->scopes()->whereNotNull('MedicalCenterId')->first();
                
                if ($firstScope) {
                    $model->MedicalCenterId = $firstScope->MedicalCenterId;
                }
            }
        });
    }
}
