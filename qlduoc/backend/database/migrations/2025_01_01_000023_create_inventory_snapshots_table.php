<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('InventorySnapshots', function (Blueprint $table) {
            $table->id('Id');
            $table->date('SnapshotDate');
            $table->foreignId('WarehouseId')->constrained('Warehouses', 'Id')->cascadeOnDelete();
            $table->foreignId('ProductId')->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('BatchNumber')->nullable();
            
            $table->integer('Quantity');
            $table->decimal('AveragePrice', 18, 2);
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
            
            // Index for fast lookup
            $table->index(['WarehouseId', 'ProductId', 'SnapshotDate']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('InventorySnapshots');
    }
};
