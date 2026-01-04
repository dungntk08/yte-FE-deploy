<?php

namespace App\Models;

use App\Traits\HasMedicalCenterScope;

class Product extends BaseModel
{
    use HasMedicalCenterScope;
    
    protected $table = 'Products';
    protected $primaryKey = 'Id';
    protected $fillable = [
        'Code', 
        'Name', 
        'ProductTypeId', 
        'UnitId', 
        'Manufacturer', 
        'CountryOfOrigin', 
        'PackingRule', 
        'IsActive',
        'UnitName'
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'UnitId', 'Id');
    }

    public function medicine()
    {
        return $this->hasOne(ProductMedicine::class, 'ProductId', 'Id');
    }

    public function supply()
    {
        return $this->hasOne(ProductSupply::class, 'ProductId', 'Id');
    }

    public function vaccine()
    {
        return $this->hasOne(ProductVaccine::class, 'ProductId', 'Id');
    }
    
    public function chemical()
    {
        return $this->hasOne(ProductChemical::class, 'ProductId', 'Id');
    }

    public function bids()
    {
        return $this->hasMany(ProductBid::class, 'ProductId', 'Id');
    }
}
