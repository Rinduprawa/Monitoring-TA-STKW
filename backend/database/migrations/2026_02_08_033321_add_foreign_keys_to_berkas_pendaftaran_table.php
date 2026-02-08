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
        Schema::table('berkas_pendaftaran', function (Blueprint $table) {
            $table->foreign(['pendaftaran_ta_id'], 'berkas_pendaftaran_ibfk_1')->references(['id'])->on('pendaftaran_ta')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('berkas_pendaftaran', function (Blueprint $table) {
            $table->dropForeign('berkas_pendaftaran_ibfk_1');
        });
    }
};
