<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ItemBatches', function (Blueprint $table) {
            $table->id('Id');
            $table->foreignId('ProductId')->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('BatchNumber');
            $table->date('ExpiryDate')->nullable();
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
            
            // Unique constraint on ProductId + BatchNumber might be useful
            $table->unique(['ProductId', 'BatchNumber']); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ItemBatches');
    }
};
