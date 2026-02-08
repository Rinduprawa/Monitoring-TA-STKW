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
        Schema::create('penguji_ujian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('jadwal_ujian_id')->index('idx_jadwal');
            $table->unsignedBigInteger('penugasan_dosen_id')->nullable()->index('idx_penugasan');
            $table->timestamps();

            $table->unique(['jadwal_ujian_id', 'penugasan_dosen_id'], 'unique_penguji');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penguji_ujian');
    }
};
