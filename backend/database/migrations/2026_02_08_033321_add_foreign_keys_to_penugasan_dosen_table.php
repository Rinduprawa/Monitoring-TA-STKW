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
        Schema::table('penugasan_dosen', function (Blueprint $table) {
            $table->foreign(['mahasiswa_id'], 'penugasan_dosen_ibfk_1')->references(['id'])->on('mahasiswa')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['dosen_id'], 'penugasan_dosen_ibfk_2')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasan_dosen', function (Blueprint $table) {
            $table->dropForeign('penugasan_dosen_ibfk_1');
            $table->dropForeign('penugasan_dosen_ibfk_2');
        });
    }
};
