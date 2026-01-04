<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Products', function (Blueprint $table) {
            $table->id('Id');
            $table->string('Code')->unique();
            $table->string('Name');
            $table->integer('ProductTypeId'); // 1: Medicine, 2: Supply, 3: Vaccine (Simple enum/int)
            $table->integer('UnitId')->nullable(); // Could be a foreign key if we had a Units table, but specs didn't ask for Units table explicitly in the detailed list, wait.
            // Spec says "UnitId" in table Products. It doesn't explicitly list a Units table in "PHẦN 2: CHI TIẾT CẤU TRÚC DATABASE".
            // However, "UnitSeeder.php" exists in user's file list. "2025_12_24_082501_create_units_table.php" was in the deleted list. 
            // The user deleted everything ("Xoá hết tất cả"). 
            // If I don't create a Units table, I should probably just leave it as integer or string.
            // "UnitId" suggests an ID. I'll make it integer. If user wanted a Units table they should have listed it in the MASTER SPEC.
            // I will strictly follow the MASTER SPEC table list.
            $table->string('Manufacturer')->nullable();
            $table->string('CountryOfOrigin')->nullable();
            $table->string('PackingRule')->nullable();
            $table->boolean('IsActive')->default(true);
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Products');
    }
};
