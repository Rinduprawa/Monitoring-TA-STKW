<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('penilaian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('penguji_ujian_id')->index('idx_penguji_ujian');
            $table->decimal('nilai', 5)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');

            $table->unique(['penguji_ujian_id'], 'unique_penilaian');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian');
    }
};
