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
        Schema::create('syarat_bimbingan', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->enum('jenis_ujian', ['proposal', 'uji_kelayakan_1', 'tes_tahap_1', 'uji_kelayakan_2', 'tes_tahap_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])->unique('jenis_ujian');
            $table->integer('minimal_bimbingan');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('syarat_bimbingan');
    }
};
