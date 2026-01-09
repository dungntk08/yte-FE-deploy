<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('InternalRequests', function (Blueprint $table) {
            $table->id('Id');
            $table->dateTime('RequestDate');
            $table->foreignId('FromWarehouseId')->constrained('Warehouses', 'Id')->cascadeOnDelete();
            $table->foreignId('ToWarehouseId')->constrained('Warehouses', 'Id')->cascadeOnDelete();
            $table->string('Status');
            $table->text('Note')->nullable();
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('InternalRequests');
    }
};
