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
        Schema::create('penugasan_dosen', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->unsignedBigInteger('dosen_id')->index('idx_dosen');
            $table->enum('jenis_penugasan', ['pembimbing_1', 'pembimbing_2', 'penguji_struktural', 'penguji_pembimbing', 'penguji_ahli', 'penguji_stakeholder'])->index('idx_jenis_penugasan');
            $table->enum('jenis_ujian', ['proposal', 'uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->index('idx_jenis_ujian')->nullable();
            $table->string('file_surat_tugas', 500);
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penugasan_dosen');
    }
};
