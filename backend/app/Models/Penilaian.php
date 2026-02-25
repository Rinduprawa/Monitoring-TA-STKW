<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penilaian extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'penilaian';

    protected $fillable = [
        'penguji_ujian_id',
        'nilai',
        'catatan',
    ];

    protected $casts = [
        'nilai' => 'decimal:2',
    ];

    // Relationships
    public function pengujiUjian()
    {
        return $this->belongsTo(PengujiUjian::class, 'penguji_ujian_id');
    }

    // Scopes
    public function scopeByJadwal($query, $jadwalId)
    {
        return $query->where('jadwal_ujian_id', $jadwalId);
    }

    public function scopeByDosen($query, $dosenId)
    {
        return $query->where('dosen_id', $dosenId);
    }

    // Helper: Check if all penguji sudah input nilai
    public static function allPengujiSudahInputNilai($jadwalUjianId)
    {
        $jadwal = JadwalUjian::with('pengujiUjian', 'penilaian')->find($jadwalUjianId);

        if (!$jadwal) {
            return false;
        }

        $jumlahPenguji = $jadwal->pengujiUjian()->count();
        $jumlahNilai = $jadwal->penilaian()->whereNotNull('nilai')->count();

        return $jumlahPenguji > 0 && $jumlahPenguji === $jumlahNilai;
    }

    // Helper: Hitung rata-rata nilai
    public static function hitungRataRataNilai($jadwalUjianId)
    {
        return self::where('jadwal_ujian_id', $jadwalUjianId)
            ->whereNotNull('nilai')
            ->avg('nilai');
    }
}
