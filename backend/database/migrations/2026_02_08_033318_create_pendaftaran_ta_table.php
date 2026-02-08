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
        Schema::create('pendaftaran_ta', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('mahasiswa_id')->index('idx_mahasiswa');
            $table->enum('status_validasi', ['menunggu', 'valid', 'tidak_valid'])->nullable()->default('menunggu')->index('idx_status');
            $table->text('catatan_kaprodi')->nullable();
            $table->boolean('is_active')->nullable()->default(true);
            $table->timestamps();
            $table->softDeletes()->index('idx_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_ta');
    }
};
