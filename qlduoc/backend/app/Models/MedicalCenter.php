<?php

namespace App\Models;

class MedicalCenter extends BaseModel
{
    protected $table = 'MedicalCenters';
    protected $primaryKey = 'Id';

    public function healthPosts()
    {
        return $this->hasMany(HealthPost::class, 'MedicalCenterId', 'Id');
    }
}
