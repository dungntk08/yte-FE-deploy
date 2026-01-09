<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('AppPermissions', function (Blueprint $table) {
            $table->id('Id');
            $table->string('Code')->unique(); // e.g. 'user.view', 'inventory.import'
            $table->string('Name');
            $table->string('Group')->nullable(); // e.g. 'User Management', 'Inventory'
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('AppRolePermissions', function (Blueprint $table) {
            $table->id('Id');
            $table->unsignedBigInteger('RoleId');
            $table->unsignedBigInteger('PermissionId');
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('RoleId')->references('Id')->on('AppRoles')->onDelete('cascade');
            $table->foreign('PermissionId')->references('Id')->on('AppPermissions')->onDelete('cascade');
            
            $table->unique(['RoleId', 'PermissionId']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('AppRolePermissions');
        Schema::dropIfExists('AppPermissions');
    }
};
