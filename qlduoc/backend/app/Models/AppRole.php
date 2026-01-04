<?php

namespace App\Models;

class AppRole extends BaseModel
{
    protected $table = 'AppRoles';
    protected $primaryKey = 'Id';

    public function permissions()
    {
        return $this->belongsToMany(AppPermission::class, 'AppRolePermissions', 'RoleId', 'PermissionId');
    }
}
