<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ProductMedicines', function (Blueprint $table) {
            // ProductId is PK and FK
            $table->foreignId('ProductId')->primary()->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('ActiveIngredientName')->nullable();
            $table->string('Content')->nullable();
            $table->string('RegistrationNumber')->nullable();
            $table->string('InsuranceCode')->nullable();
            $table->decimal('InsurancePaymentRate', 5, 2)->nullable(); // %
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ProductMedicines');
    }
};
