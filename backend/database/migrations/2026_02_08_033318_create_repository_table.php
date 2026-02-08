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
        Schema::create('repository', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->enum('jenis_dokumen', ['naskah_skripsi', 'deskripsi_karya_seni', 'dokumentasi_pergelaran'])->index('idx_jenis_dokumen');
            $table->string('file_path', 500);
            $table->date('tanggal_unggah');
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repository');
    }
};
