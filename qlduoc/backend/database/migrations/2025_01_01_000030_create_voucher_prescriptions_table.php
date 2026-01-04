<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('VoucherPrescriptions', function (Blueprint $table) {
            $table->foreignId('VoucherId')->primary()->constrained('StockVouchers', 'Id')->cascadeOnDelete();
            
            $table->string('PatientName');
            $table->integer('YearOfBirth')->nullable();
            $table->string('Gender')->nullable(); // 'Nam'/'Nu' or M/F
            $table->string('InsuranceCardNumber')->nullable();
            $table->text('Diagnosis')->nullable();
            $table->string('DoctorName')->nullable();
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('VoucherPrescriptions');
    }
};
