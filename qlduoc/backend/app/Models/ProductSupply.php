<?php

namespace App\Models;

class ProductSupply extends BaseModel
{
    protected $table = 'ProductSupplies';
    protected $primaryKey = 'ProductId';
    public $incrementing = false;

    protected $fillable = [
        'ProductId',
        'ModelCode',
        'TechnicalStandard',
        'DeclarationNumber',
        'SupplyGroup',
        'GroupCode',
        'GroupName',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
