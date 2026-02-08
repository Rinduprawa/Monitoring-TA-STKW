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
        Schema::table('penguji_ujian', function (Blueprint $table) {
            $table->foreign(['jadwal_ujian_id'], 'penguji_ujian_ibfk_1')->references(['id'])->on('jadwal_ujian')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['penugasan_dosen_id'], 'penguji_ujian_ibfk_2')->references(['id'])->on('penugasan_dosen')->onUpdate('restrict')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penguji_ujian', function (Blueprint $table) {
            $table->dropForeign('penguji_ujian_ibfk_1');
            $table->dropForeign('penguji_ujian_ibfk_2');
        });
    }
};
