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
        Schema::create('jadwal_ujian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->enum('jenis_ujian', ['proposal', 'uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->index('idx_jenis_ujian');
            $table->date('tanggal')->index('idx_tanggal');
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->enum('status_jadwal', ['draft', 'terjadwal', 'selesai'])->nullable()->default('draft')->index('idx_status_jadwal');
            $table->enum('status_kelulusan', ['lulus', 'tidak_lulus'])->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_ujian');
    }
};
