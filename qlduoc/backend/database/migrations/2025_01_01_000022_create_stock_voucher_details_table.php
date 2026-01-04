<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('StockVoucherDetails', function (Blueprint $table) {
            $table->id('Id');
            $table->foreignId('VoucherId')->constrained('StockVouchers', 'Id')->cascadeOnDelete();
            $table->foreignId('ProductId')->constrained('Products', 'Id');
            
            $table->string('BatchNumber')->nullable();
            $table->date('ExpiryDate')->nullable();
            
            $table->integer('Quantity'); // Can be negative? Spec says "Tồn kho = Nhập - Xuất". Usually details are separate by VoucherType. 
            // If Import, Qty > 0. If Export, Qty > 0 but Logic treats as minus.
            // I'll keep it simple: Quantity.
            
            $table->decimal('Price', 18, 2); // Giá vốn
            $table->decimal('VATRate', 5, 2)->default(0);
            
            $table->string('BidDecision')->nullable(); // QĐ Thầu
            $table->string('BidGroup')->nullable(); // Nhóm thầu
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('StockVoucherDetails');
    }
};
