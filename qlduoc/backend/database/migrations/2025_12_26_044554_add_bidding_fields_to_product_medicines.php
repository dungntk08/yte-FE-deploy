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
            $table->string('ApprovalOrder')->nullable(); // STT Phê duyệt
            $table->string('BidPackageCode')->nullable(); // Mã gói thầu
            $table->string('BidGroupCode')->nullable(); // Mã nhóm thầu
            $table->string('BidDecisionNumber')->nullable(); // Số QĐ thầu
            $table->decimal('BidPrice', 18, 2)->nullable(); // Đơn giá thầu
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
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
};
