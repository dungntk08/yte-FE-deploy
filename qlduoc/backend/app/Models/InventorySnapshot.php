<?php

namespace App\Models;

class InventorySnapshot extends BaseModel
{
    protected $table = 'InventorySnapshots';
    protected $primaryKey = 'Id';

    protected $fillable = [
        'WarehouseId',
        'ProductId',
        'BatchNumber',
        'Quantity',
        'AveragePrice',
        'SnapshotDate'
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'WarehouseId', 'Id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
