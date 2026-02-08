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
        Schema::create('berkas_pendaftaran', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('pendaftaran_ta_id')->index('idx_pendaftaran');
            $table->enum('jenis_berkas', ['surat_permohonan', 'bukti_uang_gedung', 'kuitansi_spp', 'kuitansi_biaya_ta', 'khs', 'krs', 'transkrip', 'proyeksi_ta']);
            $table->string('file_path', 500);
            $table->enum('status', ['menunggu_validasi', 'valid', 'tidak_valid'])->nullable()->default('menunggu_validasi');
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');

            $table->unique(['pendaftaran_ta_id', 'jenis_berkas'], 'unique_berkas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berkas_pendaftaran');
    }
};
