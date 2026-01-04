<?php

namespace App\Models;

class ProductVaccine extends BaseModel
{
    protected $table = 'ProductVaccines';
    protected $primaryKey = 'ProductId';
    public $incrementing = false;

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
