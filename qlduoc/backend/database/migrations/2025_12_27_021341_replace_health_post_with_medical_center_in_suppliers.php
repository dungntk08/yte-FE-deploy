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
            $table->dropColumn('HealthPostId');
            $table->unsignedBigInteger('MedicalCenterId')->nullable()->after('IsActive');
            // $table->foreign('MedicalCenterId')->references('Id')->on('MedicalCenters')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Suppliers', function (Blueprint $table) {
            $table->dropColumn('MedicalCenterId');
            $table->unsignedBigInteger('HealthPostId')->nullable()->after('IsActive');
        });
    }
};
