<?php

namespace App\Models;

class StockVoucher extends BaseModel
{
    protected $table = 'StockVouchers';
    protected $primaryKey = 'Id';
    protected $fillable = [
        'Code',
        'VoucherDate',
        'VoucherType',
        'SourceWarehouseId',
        'TargetWarehouseId',
        'PartnerId',
        'InvoiceNo',
        'SerialNo',
        'InvoiceDate',
        'FundingSource',
        'Status',
        'Description',
        'DelivererName',
        'ReceiverName',
        'CreatedBy',
        'UpdatedBy',
        'RelatedVoucherId'
    ];

    public function details()
    {
        return $this->hasMany(StockVoucherDetail::class, 'VoucherId', 'Id');
    }

    public function sourceWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'SourceWarehouseId', 'Id');
    }

    public function targetWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'TargetWarehouseId', 'Id');
    }
    
    // Extensions
    public function prescription()
    {
        return $this->hasOne(VoucherPrescription::class, 'VoucherId', 'Id');
    }
    
    public function adjustment()
    {
        return $this->hasOne(VoucherAdjustment::class, 'VoucherId', 'Id');
    }

    public function partner()
    {
        return $this->belongsTo(Supplier::class, 'PartnerId', 'Id');
    }

    public function supplier()
    {
        return $this->partner();
    }

    public function creator()
    {
        return $this->belongsTo(AppUser::class, 'CreatedBy', 'Id');
    }

    public function logs()
    {
        return $this->hasMany(ActivityLog::class, 'SubjectId', 'Id')
                    ->where('SubjectType', 'StockVoucher')
                    ->orderByDesc('CreatedAt');
    }

    public function relatedVoucher()
    {
        return $this->belongsTo(StockVoucher::class, 'RelatedVoucherId', 'Id');
    }
}
