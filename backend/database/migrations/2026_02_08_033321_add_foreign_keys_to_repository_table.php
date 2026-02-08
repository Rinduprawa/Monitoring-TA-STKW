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
        Schema::table('repository', function (Blueprint $table) {
            $table->foreign(['mahasiswa_id'], 'repository_ibfk_1')->references(['id'])->on('mahasiswa')->onUpdate('restrict')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('repository', function (Blueprint $table) {
            $table->dropForeign('repository_ibfk_1');
        });
    }
};
