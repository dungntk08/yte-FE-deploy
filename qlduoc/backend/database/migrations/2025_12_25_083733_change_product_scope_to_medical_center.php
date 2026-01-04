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
        Schema::table('Products', function (Blueprint $table) {
            // Drop Foreign Key first (if exists)
            // Note: In previous step we added it with constraint name `products_healthpostid_foreign` usually
            // but for safety we just drop column which usually drops FK too in recent Laravel/MySQL but cleaner to be explicit if known.
            // Since we know we just added it, we can try to drop the column directly.
            
            // Check if column exists first to be safe or just try drop.
            // But standard is:
            if (Schema::hasColumn('Products', 'HealthPostId')) {
                // We need to drop FK first usually
                $table->dropForeign(['HealthPostId']);
                $table->dropColumn('HealthPostId');
            }

            // Add MedicalCenterId
            $table->unsignedBigInteger('MedicalCenterId')->nullable()->after('Id');
            $table->foreign('MedicalCenterId')->references('Id')->on('MedicalCenters')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Products', function (Blueprint $table) {
             if (Schema::hasColumn('Products', 'MedicalCenterId')) {
                $table->dropForeign(['MedicalCenterId']);
                $table->dropColumn('MedicalCenterId');
            }

            $table->unsignedBigInteger('HealthPostId')->nullable()->after('Id');
            $table->foreign('HealthPostId')->references('Id')->on('HealthPosts')->onDelete('set null');
        });
    }
};
