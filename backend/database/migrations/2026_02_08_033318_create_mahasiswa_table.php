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
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id')->unique('user_id');
            $table->string('nim', 50)->unique('nim');
            $table->string('nama');
            $table->enum('jenis_kelamin', ['L', 'P']);
            $table->unsignedBigInteger('prodi_id')->index('idx_prodi');
            $table->enum('bentuk_ta', ['penelitian', 'penciptaan'])->nullable();
            $table->text('judul_ta')->nullable();
            $table->enum('tahap_ta', ['pendaftaran', 'proposal', 'uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->nullable()->index('idx_tahap_ta');
            $table->unsignedBigInteger('dospem_1_id')->nullable()->index('dospem_1_id');
            $table->unsignedBigInteger('dospem_2_id')->nullable()->index('dospem_2_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mahasiswa');
    }
};
