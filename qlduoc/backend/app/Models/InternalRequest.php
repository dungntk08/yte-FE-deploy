<?php

namespace App\Models;

class InternalRequest extends BaseModel
{
    protected $table = 'InternalRequests';
    protected $primaryKey = 'Id';

    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'FromWarehouseId', 'Id');
    }

    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'ToWarehouseId', 'Id');
    }
}
