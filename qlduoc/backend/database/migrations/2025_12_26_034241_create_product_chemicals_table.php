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
        Schema::create('ProductChemicals', function (Blueprint $table) {
            $table->foreignId('ProductId')->primary()->constrained('Products', 'Id')->cascadeOnDelete();
            $table->string('ReferenceCode')->nullable(); // Mã tham chiếu (CAS?)
            $table->string('ChemicalFormula')->nullable(); // Công thức hóa học
            $table->string('Concentration')->nullable(); // Nồng độ/Hàm lượng
            $table->string('RegistrationNumber')->nullable(); // Số đăng ký
            $table->string('Standard')->nullable(); // Tiêu chuẩn
            
            $table->timestamp('CreatedAt')->useCurrent();
            $table->timestamp('UpdatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ProductChemicals');
    }
};
