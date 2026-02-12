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
        Schema::table('pengajuan_proposal', function (Blueprint $table) {
            $table->foreign(['mahasiswa_id'], 'pengajuan_proposal_ibfk_1')->references(['id'])->on('mahasiswa')->onUpdate('restrict')->onDelete('cascade');
            $table->foreign(['pendaftaran_ta_id'], 'pengajuan_proposal_ibfk_2')->references(['id'])->on('pendaftaran_ta')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengajuan_proposal', function (Blueprint $table) {
            $table->dropForeign('pengajuan_proposal_ibfk_1');
            $table->dropForeign('pengajuan_proposal_ibfk_2');
        });
    }
};
