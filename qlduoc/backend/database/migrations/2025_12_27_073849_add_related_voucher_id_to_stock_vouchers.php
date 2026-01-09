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
            $table->unsignedBigInteger('RelatedVoucherId')->nullable()->after('Status');
            // Self-referencing FK not strictly required but good for integrity, cyclic issues though?
            // Let's just index it for now or simple FK.
            // $table->foreign('RelatedVoucherId')->references('Id')->on('StockVouchers'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('StockVouchers', function (Blueprint $table) {
            $table->dropColumn('RelatedVoucherId');
        });
    }
};
