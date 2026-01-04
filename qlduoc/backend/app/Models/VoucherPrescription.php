<?php

namespace App\Models;

class VoucherPrescription extends BaseModel
{
    protected $table = 'VoucherPrescriptions';
    protected $primaryKey = 'VoucherId';
    public $incrementing = false;

    public function voucher()
    {
        return $this->belongsTo(StockVoucher::class, 'VoucherId', 'Id');
    }
}
