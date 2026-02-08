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
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->foreign(['user_id'], 'mahasiswa_ibfk_1')->references(['id'])->on('users')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['prodi_id'], 'mahasiswa_ibfk_2')->references(['id'])->on('prodi')->onUpdate('restrict')->onDelete('restrict');
            $table->foreign(['dospem_1_id'], 'mahasiswa_ibfk_3')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('set null');
            $table->foreign(['dospem_2_id'], 'mahasiswa_ibfk_4')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropForeign('mahasiswa_ibfk_1');
            $table->dropForeign('mahasiswa_ibfk_2');
            $table->dropForeign('mahasiswa_ibfk_3');
            $table->dropForeign('mahasiswa_ibfk_4');
        });
    }
};
