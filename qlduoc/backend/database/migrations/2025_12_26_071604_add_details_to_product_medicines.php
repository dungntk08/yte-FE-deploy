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
            $table->string('PharmacyType')->nullable(); // Loại thuốc
            $table->string('PharmacyName')->nullable(); // Tên dược
            $table->string('ActiveIngredientCode')->nullable(); // Mã hoạt chất
            $table->string('UsageRoute')->nullable(); // Đường dùng
            $table->string('Dosage')->nullable(); // Liều dùng
            $table->string('PharmacyCategory')->nullable(); // Loại dược
            $table->string('GroupClassification')->nullable(); // Phân nhóm dược
            $table->string('PharmacyGroup')->nullable(); // Nhóm dược
            $table->string('ServiceGroupInsurance')->nullable(); // Nhóm DVKT BHYT
            $table->string('MaterialCode')->nullable(); // Mã DMDC
            $table->string('HealthMinistryDecision')->nullable(); // Tên QĐ BYT
            $table->string('Usage')->nullable(); // Công dụng
            $table->string('PrescriptionUnit')->nullable(); // ĐVT đơn thuốc
            $table->string('ProductCodeDecision130')->nullable(); // Mã hiệu sản phẩm QĐ130
            $table->string('Program')->nullable(); // Chương trình
            $table->string('FundingSource')->nullable(); // Nguồn tài trợ
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ProductMedicines', function (Blueprint $table) {
            $table->dropColumn([
                'PharmacyType',
                'PharmacyName',
                'ActiveIngredientCode',
                'UsageRoute',
                'Dosage',
                'PharmacyCategory',
                'GroupClassification',
                'PharmacyGroup',
                'ServiceGroupInsurance',
                'MaterialCode',
                'HealthMinistryDecision',
                'Usage',
                'PrescriptionUnit',
                'ProductCodeDecision130',
                'Program',
                'FundingSource',
            ]);
        });
    }
};
