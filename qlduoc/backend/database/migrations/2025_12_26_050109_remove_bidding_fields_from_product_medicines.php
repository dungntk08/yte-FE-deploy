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
        Schema::table('ProductMedicines', function (Blueprint $table) {
            $table->dropColumn([
                'ApprovalOrder',
                'BidPackageCode',
                'BidGroupCode',
                'BidDecisionNumber',
                'BidPrice'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ProductMedicines', function (Blueprint $table) {
            $table->string('ApprovalOrder')->nullable();
            $table->string('BidPackageCode')->nullable();
            $table->string('BidGroupCode')->nullable();
            $table->string('BidDecisionNumber')->nullable();
            $table->decimal('BidPrice', 18, 2)->nullable();
        });
    }
};
