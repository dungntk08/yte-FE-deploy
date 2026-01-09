<?php

namespace App\Models;

class VoucherAdjustment extends BaseModel
{
    protected $table = 'VoucherAdjustments';
    protected $primaryKey = 'VoucherId';
    public $incrementing = false;

    public function voucher()
    {
        return $this->belongsTo(StockVoucher::class, 'VoucherId', 'Id');
    }
}
