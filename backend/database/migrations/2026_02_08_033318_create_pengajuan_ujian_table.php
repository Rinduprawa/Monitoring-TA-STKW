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
        Schema::create('pengajuan_ujian', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->enum('jenis_ujian', ['uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->index('idx_jenis_ujian');
            $table->date('tanggal_pengajuan');
            $table->string('file_bukti_kelayakan', 500);
            $table->enum('status', ['diproses_pembimbing', 'ditolak_pembimbing', 'disetujui_pembimbing', 'ditolak_kaprodi', 'disetujui_kaprodi'])->nullable()->default('diproses_pembimbing')->index('idx_status');
            $table->text('catatan_pembimbing')->nullable();
            $table->text('catatan_kaprodi')->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_ujian');
    }
};
