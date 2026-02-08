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
        Schema::create('catatan_bimbingan', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->unsignedBigInteger('dosen_id')->index('idx_dosen');
            $table->enum('untuk_ujian', ['proposal', 'uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->index('idx_untuk_ujian');
            $table->date('tanggal_bimbingan');
            $table->string('judul_bimbingan');
            $table->text('deskripsi');
            $table->enum('status', ['revisi', 'layak_uji'])->index('idx_status');
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catatan_bimbingan');
    }
};
