<?php

namespace App\Models;

class HealthPost extends BaseModel
{
    protected $table = 'HealthPosts';
    protected $primaryKey = 'Id';

    public function medicalCenter()
    {
        return $this->belongsTo(MedicalCenter::class, 'MedicalCenterId', 'Id');
    }

    public function warehouses()
    {
        return $this->hasMany(Warehouse::class, 'HealthPostId', 'Id');
    }
}
