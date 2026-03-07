<?php

namespace App\Helpers;

use App\Models\Penilaian;
use App\Models\JadwalUjian;
use App\Models\PengujiUjian;

class PenilaianHelper
{
    /**
     * Hitung rata-rata nilai per ujian (hanya yang sudah locked)
     * 
     * @param int $mahasiswaId
     * @param string $jenisUjian
     * @return float|null
     */
    public static function hitungRataRataPerUjian($mahasiswaId, $jenisUjian)
    {
        $jadwal = JadwalUjian::where('mahasiswa_id', $mahasiswaId)
            ->where('jenis_ujian', $jenisUjian)
            ->first();

        if (!$jadwal) {
            return null;
        }

        // Get all penguji_ujian for this jadwal
        $pengujiUjianIds = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)->pluck('id');

        // Hitung rata-rata dari penilaian yang sudah locked
        $rataRata = Penilaian::whereIn('penguji_ujian_id', $pengujiUjianIds)
            ->whereNotNull('locked_at')
            ->avg('nilai');

        return $rataRata ? round($rataRata, 2) : null;
    }

    /**
     * Hitung rata-rata keseluruhan (semua ujian yang sudah locked)
     * 
     * @param int $mahasiswaId
     * @return float|null
     */
    public static function hitungRataRataKeseluruhan($mahasiswaId)
    {
        // Get semua jadwal ujian mahasiswa
        $jadwalIds = JadwalUjian::where('mahasiswa_id', $mahasiswaId)
            ->pluck('id');

        if ($jadwalIds->isEmpty()) {
            return null;
        }

        // Get all penguji_ujian for these jadwals
        $pengujiUjianIds = PengujiUjian::whereIn('jadwal_ujian_id', $jadwalIds)->pluck('id');

        // Hitung rata-rata dari semua penilaian yang locked
        $rataRata = Penilaian::whereIn('penguji_ujian_id', $pengujiUjianIds)
            ->whereNotNull('locked_at')
            ->avg('nilai');

        return $rataRata ? round($rataRata, 2) : null;
    }

    /**
     * Check apakah semua penilaian di ujian ini sudah locked
     * 
     * @param int $jadwalUjianId
     * @return bool
     */
    public static function isAllPenilaianLocked($jadwalUjianId)
    {
        // Get all penguji_ujian for this jadwal
        $pengujiUjianIds = PengujiUjian::where('jadwal_ujian_id', $jadwalUjianId)->pluck('id');

        if ($pengujiUjianIds->isEmpty()) {
            return false;
        }

        $totalPenilaian = Penilaian::whereIn('penguji_ujian_id', $pengujiUjianIds)->count();

        if ($totalPenilaian === 0) {
            return false;
        }

        $lockedCount = Penilaian::whereIn('penguji_ujian_id', $pengujiUjianIds)
            ->whereNotNull('locked_at')
            ->count();

        return $totalPenilaian === $lockedCount;
    }

    /**
     * Get next tahap after passing ujian
     * 
     * @param \App\Models\Mahasiswa $mahasiswa
     * @param string $currentJenisUjian
     * @return string
     */
    public static function getNextTahap($mahasiswa, $currentJenisUjian)
    {
        $nextTahapMap = [
            'proposal' => $mahasiswa->bentuk_ta === 'penelitian' ? 'uji_kelayakan_1' : 'tes_tahap_1',
            'uji_kelayakan_1' => 'uji_kelayakan_2',
            'uji_kelayakan_2' => 'sidang_skripsi',
            'sidang_skripsi' => 'lulus',
            'tes_tahap_1' => 'tes_tahap_2',
            'tes_tahap_2' => 'pergelaran',
            'pergelaran' => 'sidang_komprehensif',
            'sidang_komprehensif' => 'lulus',
        ];

        return $nextTahapMap[$currentJenisUjian] ?? 'lulus';
    }
}