<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('Products', 'UnitName')) {
            Schema::table('Products', function (Blueprint $table) {
                $table->string('UnitName')->nullable()->after('Name');
            });
        }

        // Migrate Data
        DB::statement("UPDATE Products p JOIN Units u ON p.UnitId = u.Id SET p.UnitName = u.Name");

        // Drop UnitId and FK
        if (Schema::hasColumn('Products', 'UnitId')) {
            Schema::table('Products', function (Blueprint $table) {
                // Try dropping FK. If it fails (doesn't exist), we catch it ideally, 
                // but Blueprint doesn't catch. 
                // We use raw SQL to drop FK if we suspect it exists, or just skip to dropColumn which might throw if FK exists.
                // Best effort: Try dropping column. If it fails due to FK, we are stuck. 
                // BUT the previous error said "Can't DROP ... foreign ... check that it exists". 
                // This means valid FK drop command on NON-EXISTENT FK failed. 
                // So the FK likely DOES NOT exist.
                // So we just don't call dropForeign.
                 
                // Just drop the column.
                $table->dropColumn('UnitId');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Products', function (Blueprint $table) {
            $table->unsignedBigInteger('UnitId')->nullable()->after('Name');
            //$table->foreign('UnitId')->references('Id')->on('Units'); // Re-add constraint if strict
            $table->dropColumn('UnitName');
        });
    }
};
