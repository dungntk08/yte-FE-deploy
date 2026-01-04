<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('MedicalCenters', function (Blueprint $table) {
            $table->id('Id');
            $table->string('Code')->unique();
            $table->string('Name');
            $table->string('Address')->nullable();
            $table->boolean('IsActive')->default(true);
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('MedicalCenters');
    }
};
