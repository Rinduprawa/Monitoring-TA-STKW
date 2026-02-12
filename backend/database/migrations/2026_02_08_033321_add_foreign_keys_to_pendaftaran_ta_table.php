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
        Schema::table('pendaftaran_ta', function (Blueprint $table) {
            $table->foreign(['mahasiswa_id'], 'pendaftaran_ta_ibfk_1')->references(['id'])->on('mahasiswa')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['semester_id'], 'pendaftaran_ta_ibfk_2')->references(['id'])->on('semester')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pendaftaran_ta', function (Blueprint $table) {
            $table->dropForeign('pendaftaran_ta_ibfk_1');
            $table->dropForeign('pendaftaran_ta_ibfk_2');
        });
    }
};
