<?php

namespace App\Models;

class ProductMedicine extends BaseModel
{
    protected $table = 'ProductMedicines';
    protected $primaryKey = 'ProductId';
    public $incrementing = false;

    protected $fillable = [
        'ProductId',
        'ActiveIngredientName',
        'Content',
        'RegistrationNumber',
        'InsuranceCode',
        'InsurancePaymentRate',

        'PharmacyType',
        'PharmacyName',
        'ActiveIngredientCode',
        'UsageRoute',
        'Dosage',
        'PharmacyCategory',
        'GroupClassification',
        'PharmacyGroup',
        'ServiceGroupInsurance',
        'MaterialCode',
        'HealthMinistryDecision',
        'Usage',
        'PrescriptionUnit',
        'ProductCodeDecision130',
        'Program',
        'FundingSource',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductId', 'Id');
    }
}
