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
        Schema::create('penugasan_dosen', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->unsignedBigInteger('dosen_id')->index('idx_dosen');
            $table->enum('jenis', ['pembimbing_1', 'pembimbing_2', 'penguji'])->index('idx_jenis');
            $table->string('file_surat_tugas', 500)->nullable();
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');

            $table->unique(['mahasiswa_id', 'dosen_id', 'jenis'], 'unique_penugasan');
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
