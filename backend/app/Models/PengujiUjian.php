<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengujiUjian extends Model
{
    use HasFactory;

    protected $table = 'penguji_ujian';

    protected $fillable = [
        'jadwal_ujian_id',
        'penugasan_dosen_id',
    ];

    // Relationships
    public function jadwalUjian()
    {
        return $this->belongsTo(JadwalUjian::class);
    }

    public function penugasanDosen()
    {
        return $this->belongsTo(PenugasanDosen::class);
    }

    public function dosen()
    {
        return $this->hasOneThrough(
            Dosen::class,
            PenugasanDosen::class,
            'id', // Foreign key on penugasan_dosen
            'id', // Foreign key on dosen
            'penugasan_dosen_id', // Local key on penguji_ujian
            'dosen_id' // Local key on penugasan_dosen
        );
    }
}
