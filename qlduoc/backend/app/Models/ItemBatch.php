<?php

namespace App\Models;

class ItemBatch extends BaseModel
{
    protected $table = 'ItemBatches';
    protected $primaryKey = 'Id';

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
