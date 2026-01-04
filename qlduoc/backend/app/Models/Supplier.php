<?php

namespace App\Models;

use App\Traits\HasMedicalCenterScope;

class Supplier extends BaseModel
{
    use HasMedicalCenterScope;
    
    protected $table = 'Suppliers';
    protected $primaryKey = 'Id';

    protected $fillable = [
        'Code',
        'Name',
        'Address',
        'Phone',
        'Email',
        'TaxCode',
        'IsActive',
        'MedicalCenterId'
    ];



    /**
     * Scope to get suppliers for a specific user, including shared ones (MedicalCenterId is NULL).
     */
    public function scopeForUser($query, $user)
    {
        // Bypass the global MedicalCenterScope to handle logic manually
        $query->withoutGlobalScope(\App\Scopes\MedicalCenterScope::class);

        if (!$user) {
            return $query;
        }

        // Get user's medical center IDs
        $medicalCenterIds = $user->scopes()->pluck('MedicalCenterId')->filter()->unique();

        return $query->where(function ($q) use ($medicalCenterIds) {
            $q->whereNull('MedicalCenterId'); // Shared suppliers
            
            if ($medicalCenterIds->isNotEmpty()) {
                $q->orWhereIn('MedicalCenterId', $medicalCenterIds);
            }
        });
    }
}
