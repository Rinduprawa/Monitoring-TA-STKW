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
        Schema::create('penilaian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('jadwal_ujian_id')->index('idx_jadwal');
            $table->unsignedBigInteger('dosen_id')->index('idx_dosen');
            $table->decimal('nilai', 5)->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');

            $table->unique(['jadwal_ujian_id', 'dosen_id'], 'unique_penilaian');
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
