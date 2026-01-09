<?php

namespace App\Models;

class UserScope extends BaseModel
{
    protected $table = 'UserScopes';
    protected $primaryKey = 'Id';

    public function user()
    {
        return $this->belongsTo(AppUser::class, 'UserId', 'Id');
    }

    public function role()
    {
        return $this->belongsTo(AppRole::class, 'RoleId', 'Id');
    }

    public function medicalCenter()
    {
        return $this->belongsTo(MedicalCenter::class, 'MedicalCenterId', 'Id');
    }

    public function healthPost()
    {
        return $this->belongsTo(HealthPost::class, 'HealthPostId', 'Id');
    }
}
