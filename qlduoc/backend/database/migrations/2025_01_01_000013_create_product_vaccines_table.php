<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ProductVaccines', function (Blueprint $table) {
            $table->foreignId('ProductId')->primary()->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('TargetDisease')->nullable();
            $table->string('StorageCondition')->nullable();
            $table->string('SourceType')->nullable(); // TCMR/Service

            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ProductVaccines');
    }
};
