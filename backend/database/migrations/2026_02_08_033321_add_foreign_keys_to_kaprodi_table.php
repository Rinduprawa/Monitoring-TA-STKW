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
        Schema::table('kaprodi', function (Blueprint $table) {
            $table->foreign(['user_id'], 'kaprodi_ibfk_1')->references(['id'])->on('users')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['dosen_id'], 'kaprodi_ibfk_2')->references(['id'])->on('dosen')->onUpdate('restrict')->onDelete('set null');
            $table->foreign(['prodi_id'], 'kaprodi_ibfk_3')->references(['id'])->on('prodi')->onUpdate('restrict')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kaprodi', function (Blueprint $table) {
            $table->dropForeign('kaprodi_ibfk_1');
            $table->dropForeign('kaprodi_ibfk_2');
            $table->dropForeign('kaprodi_ibfk_3');
        });
    }
};
