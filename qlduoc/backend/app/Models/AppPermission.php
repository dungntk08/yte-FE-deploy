<?php

namespace App\Models;

class AppPermission extends BaseModel
{
    protected $table = 'AppPermissions';
    protected $primaryKey = 'Id';

    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';
    
    protected $fillable = ['Code', 'Name', 'Group'];

    public function roles()
    {
        return $this->belongsToMany(AppRole::class, 'AppRolePermissions', 'PermissionId', 'RoleId');
    }
}
