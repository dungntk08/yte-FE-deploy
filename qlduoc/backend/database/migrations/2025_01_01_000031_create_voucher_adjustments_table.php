<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('VoucherAdjustments', function (Blueprint $table) {
            $table->foreignId('VoucherId')->primary()->constrained('StockVouchers', 'Id')->cascadeOnDelete();
            
            $table->string('AdjustmentType'); // Damaged, Lost, Expired
            $table->string('ReasonDetail')->nullable();
            $table->text('CouncilMinutes')->nullable(); // Biên bản hội đồng
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('VoucherAdjustments');
    }
};
