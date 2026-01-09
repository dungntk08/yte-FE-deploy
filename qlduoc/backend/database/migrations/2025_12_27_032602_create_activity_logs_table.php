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
        Schema::create('ActivityLogs', function (Blueprint $table) {
            $table->id('Id');
            $table->string('SubjectType')->nullable(); // e.g. 'StockVoucher'
            $table->unsignedBigInteger('SubjectId')->nullable();
            $table->string('Action'); // 'Create', 'Update', 'Approve', 'Revert', 'Cancel'
            $table->text('Description')->nullable();
            $table->unsignedBigInteger('CauserId')->nullable(); // User who performed action
            $table->json('Properties')->nullable(); // Old/New values
            $table->datetime('CreatedAt')->useCurrent();

            $table->index(['SubjectType', 'SubjectId']);
            $table->index('CauserId');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
