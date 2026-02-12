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
        Schema::create('pengajuan_proposal', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->unsignedBigInteger('pendaftaran_ta_id')->index('idx_pendaftaran');
            $table->text('judul_ta');
            $table->enum('bentuk_ta', ['penelitian', 'penciptaan']);
            $table->string('file_proposal', 500);
            $table->date('tanggal_pengajuan');
            $table->enum('status', ['diproses', 'ditolak', 'disetujui'])->nullable()->default('diproses')->index('idx_status');
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
        Schema::dropIfExists('pengajuan_proposal');
    }
};
