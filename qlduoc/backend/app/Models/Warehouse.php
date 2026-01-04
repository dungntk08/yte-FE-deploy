<?php

namespace App\Models;

use App\Traits\HasMedicalCenterScope;

class Warehouse extends BaseModel
{
    use HasMedicalCenterScope;
    
    protected $table = 'Warehouses';
    protected $primaryKey = 'Id';

    public function healthPost()
    {
        return $this->belongsTo(HealthPost::class, 'HealthPostId', 'Id');
    }

    public function medicalCenter()
    {
        return $this->belongsTo(MedicalCenter::class, 'MedicalCenterId', 'Id');
    }
}
