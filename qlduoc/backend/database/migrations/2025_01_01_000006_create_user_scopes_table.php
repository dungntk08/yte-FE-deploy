<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('UserScopes', function (Blueprint $table) {
            $table->id('Id');
            $table->foreignId('UserId')->constrained('AppUsers', 'Id')->cascadeOnDelete();
            $table->foreignId('RoleId')->constrained('AppRoles', 'Id')->cascadeOnDelete();
            $table->foreignId('MedicalCenterId')->nullable()->constrained('MedicalCenters', 'Id')->cascadeOnDelete();
            $table->foreignId('HealthPostId')->nullable()->constrained('HealthPosts', 'Id')->cascadeOnDelete();
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('UserScopes');
    }
};
