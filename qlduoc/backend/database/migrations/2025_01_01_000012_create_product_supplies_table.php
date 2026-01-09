<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ProductSupplies', function (Blueprint $table) {
            $table->foreignId('ProductId')->primary()->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('ModelCode')->nullable();
            $table->string('TechnicalStandard')->nullable();
            $table->boolean('IsReusable')->default(false);
            $table->string('MaterialType')->nullable();

            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ProductSupplies');
    }
};
