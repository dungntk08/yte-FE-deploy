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
        Schema::table('StockVouchers', function (Blueprint $table) {
            $table->unsignedBigInteger('CreatedBy')->nullable()->after('Description');
            $table->unsignedBigInteger('UpdatedBy')->nullable()->after('CreatedBy');
        });
    }

    public function down(): void
    {
        Schema::table('StockVouchers', function (Blueprint $table) {
            $table->dropColumn(['CreatedBy', 'UpdatedBy']);
        });
    }
};
