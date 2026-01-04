<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('StockVouchers', function (Blueprint $table) {
            $table->id('Id');
            $table->string('Code')->unique();
            $table->dateTime('VoucherDate');
            $table->string('VoucherType'); // Import, Export, Prescription, InternalTransfer
            
            $table->foreignId('SourceWarehouseId')->nullable()->constrained('Warehouses', 'Id');
            $table->foreignId('TargetWarehouseId')->nullable()->constrained('Warehouses', 'Id');
            
            $table->unsignedBigInteger('PartnerId')->nullable(); // Supplier
            
            $table->string('InvoiceNo')->nullable();
            $table->string('Status'); // Pending, Approved, Cancelled
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('StockVouchers');
    }
};
