<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('HealthPosts', function (Blueprint $table) {
            $table->id('Id');
            $table->foreignId('MedicalCenterId')->constrained('MedicalCenters', 'Id')->cascadeOnDelete();
            $table->string('Code')->unique();
            $table->string('Name');
            $table->string('Address')->nullable();
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('HealthPosts');
    }
};
