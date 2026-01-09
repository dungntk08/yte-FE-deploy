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
        Schema::table('Warehouses', function (Blueprint $table) {
            $table->foreignId('MedicalCenterId')->nullable()->after('Id')->constrained('MedicalCenters', 'Id')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Warehouses', function (Blueprint $table) {
            $table->dropForeign(['MedicalCenterId']);
            $table->dropColumn('MedicalCenterId');
        });
    }
};
