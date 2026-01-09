<?php

namespace App\Models;

class ProductChemical extends BaseModel
{
    protected $table = 'ProductChemicals';
    protected $primaryKey = 'ProductId';
    public $incrementing = false;
    
    protected $fillable = [
        'ProductId',
        'ReferenceCode',
        'ChemicalFormula',
        'Concentration',
        'RegistrationNumber',
        'Standard'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
