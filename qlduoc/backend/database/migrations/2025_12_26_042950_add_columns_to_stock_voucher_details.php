<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('StockVoucherDetails', function (Blueprint $table) {
            $table->decimal('RequestedQuantity', 18, 2)->nullable();
            $table->decimal('ConversionRate', 18, 2)->default(1);
            $table->string('UnitName')->nullable();
            $table->string('Currency')->default('VND');
            $table->decimal('ExchangeRate', 18, 2)->default(1);
            $table->decimal('SellingPrice', 18, 2)->default(0);
            $table->decimal('VATAmount', 18, 2)->default(0);
            $table->decimal('TotalAmount', 18, 2)->default(0);
            $table->decimal('Discount', 18, 2)->default(0);
            $table->decimal('Surcharge', 18, 2)->default(0);
            $table->string('RegistrationNumber')->nullable();
            $table->string('ApprovalOrder')->nullable(); // STT Phê duyệt
            $table->string('BidPackageCode')->nullable(); // Mã gói thầu
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('StockVoucherDetails', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};
