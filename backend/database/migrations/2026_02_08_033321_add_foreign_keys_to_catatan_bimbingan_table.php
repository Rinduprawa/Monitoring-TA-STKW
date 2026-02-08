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
        Schema::table('catatan_bimbingan', function (Blueprint $table) {
            $table->foreign(['mahasiswa_id'], 'catatan_bimbingan_ibfk_1')->references(['id'])->on('mahasiswa')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['dosen_id'], 'catatan_bimbingan_ibfk_2')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catatan_bimbingan', function (Blueprint $table) {
            $table->dropForeign('catatan_bimbingan_ibfk_1');
            $table->dropForeign('catatan_bimbingan_ibfk_2');
        });
    }
};
