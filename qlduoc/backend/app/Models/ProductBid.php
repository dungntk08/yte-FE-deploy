<?php

namespace App\Models;

class ProductBid extends BaseModel
{
    protected $table = 'ProductBids';
    protected $primaryKey = 'Id';

    protected $fillable = [
        'ProductId',
        'DecisionNumber',
        'PackageCode',
        'GroupCode',
        'BidPrice',
        'Quantity',
        'RemainingQuantity',
        'WinningDate',
        'ApprovalOrder',
        'InsuranceName',
        'ActiveIngredientCode',
        'IsPriority',
    ];

    protected $casts = [
        'IsPriority' => 'boolean',
        'WinningDate' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
