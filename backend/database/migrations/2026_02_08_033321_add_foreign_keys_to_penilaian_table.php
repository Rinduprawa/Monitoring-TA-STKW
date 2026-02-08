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
        Schema::table('penilaian', function (Blueprint $table) {
            $table->foreign(['jadwal_ujian_id'], 'penilaian_ibfk_1')->references(['id'])->on('jadwal_ujian')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['dosen_id'], 'penilaian_ibfk_2')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penilaian', function (Blueprint $table) {
            $table->dropForeign('penilaian_ibfk_1');
            $table->dropForeign('penilaian_ibfk_2');
        });
    }
};
