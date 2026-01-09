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
        Schema::table('AppUsers', function (Blueprint $table) {
            $table->string('IdentificationCode')->nullable()->after('FullName');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('AppUsers', function (Blueprint $table) {
            $table->dropColumn('IdentificationCode');
        });
    }
};
