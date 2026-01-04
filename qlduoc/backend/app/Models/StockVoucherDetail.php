<?php

namespace App\Models;

class StockVoucherDetail extends BaseModel
{
    protected $table = 'StockVoucherDetails';
    protected $primaryKey = 'Id';

    public function voucher()
    {
        return $this->belongsTo(StockVoucher::class, 'VoucherId', 'Id');
    }

    protected $fillable = [
        'VoucherId',
        'ProductId',
        'BatchNumber',
        'ExpiryDate',
        'Quantity',
        'Price',
        'VATRate',
        'BidDecision',
        'BidGroup',
        
        // New columns
        'RequestedQuantity',
        'ConversionRate',
        'UnitName',
        'Currency',
        'ExchangeRate',
        'SellingPrice',
        'VATAmount',
        'TotalAmount',
        'Discount',
        'Surcharge',
        'RegistrationNumber',
        'ApprovalOrder',
        'BidPackageCode'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
