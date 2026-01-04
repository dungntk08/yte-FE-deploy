<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('Suppliers', function (Blueprint $table) {
            $table->unsignedBigInteger('HealthPostId')->nullable()->after('IsActive');
            // Assuming HealthPosts table uses 'Id' as primary key based on previous conventions
            // If foreign key constraint fails, we can skip strict foreign key for now or ensure HealthPosts table created first.
            // Given MasterSeeder created HealthPosts, it should be fine.
            // $table->foreign('HealthPostId')->references('Id')->on('HealthPosts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Suppliers', function (Blueprint $table) {
            $table->dropColumn('HealthPostId');
            // $table->dropForeign(['HealthPostId']);
        });
    }
};
