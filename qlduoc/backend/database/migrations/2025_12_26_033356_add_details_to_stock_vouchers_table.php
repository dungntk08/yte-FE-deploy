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
            $table->string('SerialNo')->nullable()->after('InvoiceNo');
            $table->date('InvoiceDate')->nullable()->after('SerialNo');
            $table->string('FundingSource')->nullable()->after('PartnerId');
            // Description already exists
            $table->string('DelivererName')->nullable()->after('Status'); // Moved after Status/Description
            $table->string('ReceiverName')->nullable()->after('DelivererName');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('StockVouchers', function (Blueprint $table) {
            $table->dropColumn(['SerialNo', 'InvoiceDate', 'FundingSource', 'DelivererName', 'ReceiverName']);
        });
    }
};
