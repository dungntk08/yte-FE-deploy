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
        Schema::table('Products', function (Blueprint $table) {
            $table->unsignedBigInteger('HealthPostId')->nullable()->after('Id');
            $table->foreign('HealthPostId')->references('Id')->on('HealthPosts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Products', function (Blueprint $table) {
            $table->dropForeign(['HealthPostId']);
            $table->dropColumn('HealthPostId');
        });
    }
};
