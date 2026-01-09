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
        Schema::create('ProductBids', function (Blueprint $table) {
            $table->id('Id');
            $table->foreignId('ProductId')->constrained('Products', 'Id')->cascadeOnDelete();
            
            $table->string('DecisionNumber')->nullable(); // Số QĐ thầu
            $table->string('PackageCode')->nullable(); // Gói thầu
            $table->string('GroupCode')->nullable(); // Nhóm thầu
            $table->decimal('BidPrice', 18, 2)->nullable(); // Đơn giá thầu
            $table->decimal('Quantity', 18, 2)->nullable(); // Số lượng thầu
            $table->decimal('RemainingQuantity', 18, 2)->nullable(); // SL còn lại
            $table->date('WinningDate')->nullable(); // Ngày trúng thầu
            $table->string('ApprovalOrder')->nullable(); // Số TT P.Duyệt
            $table->string('InsuranceName')->nullable(); // Tên BHYT
            $table->string('ActiveIngredientCode')->nullable(); // Mã hoạt chất
            $table->boolean('IsPriority')->default(false); // Ưu tiên

            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ProductBids');
    }
};
