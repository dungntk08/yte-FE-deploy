<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class AppUser extends Authenticatable
{
    use HasApiTokens, Notifiable;


    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $table = 'AppUsers';
    protected $primaryKey = 'Id';

    protected $guarded = [];

    protected $hidden = [
        'PasswordHash',
    ];

    public function getAuthPassword()
    {
        return $this->PasswordHash;
    }

    public function scopes()
    {
        return $this->hasMany(UserScope::class, 'UserId', 'Id');
    }

    /**
     * Check if user has a specific permission via any of their assigned roles in any scope.
     * Note: This is a global check. For scope-specific checks, logic needs to be refined.
     */
    public function hasPermission($permissionCode)
    {
        // 1. Get all roles assigned to user via UserScope
        $roles = $this->scopes()->with('role.permissions')->get()->pluck('role')->filter();

        // 2. Check each role for the permission
        foreach ($roles as $role) {
            if ($role->permissions->contains('Code', $permissionCode)) {
                return true;
            }
        }
        
        // 3. Super admin escape hatch (optional, e.g. based on a specific role code)
        // if ($this->scopes()->whereHas('role', fn($q) => $q->where('Code', 'admin'))->exists()) return true;

        return false;
    }

    /**
     * Get warehouses the user has access to via their scopes.
     * This links User -> UserScope -> HealthPost -> Warehouse
     */
    public function warehouses()
    {
        // Get all scopes for the user
        $scopes = $this->scopes;

        $healthPostIds = $scopes->pluck('HealthPostId')->filter()->unique();
        $medicalCenterIds = $scopes->pluck('MedicalCenterId')->filter()->unique();

        // Start a query on Warehouse
        return Warehouse::query()->where(function ($query) use ($healthPostIds, $medicalCenterIds) {
            if ($healthPostIds->isNotEmpty()) {
                $query->orWhereIn('HealthPostId', $healthPostIds);
            }
            if ($medicalCenterIds->isNotEmpty()) {
                // Master role: access all warehouses in the Medical Center
                $query->orWhereIn('MedicalCenterId', $medicalCenterIds);
                
                // Fallback: Access warehouses via Health Posts belonging to the Medical Center
                // This covers cases where Warehouse.MedicalCenterId might be null (old data)
                $query->orWhereHas('healthPost', function ($q) use ($medicalCenterIds) {
                    $q->whereIn('MedicalCenterId', $medicalCenterIds);
                });
            }
        });
    }
}
