<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('AppUsers', function (Blueprint $table) {
            $table->id('Id');
            $table->string('Username')->unique();
            $table->string('PasswordHash');
            $table->string('FullName');
            $table->boolean('IsSuperAdmin')->default(false);
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('AppUsers');
    }
};
