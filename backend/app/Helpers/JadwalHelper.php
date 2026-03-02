<?php

namespace App\Helpers;

use App\Models\JadwalUjian;
use App\Models\PengujiUjian;

class JadwalHelper
{
    /**
     * Update jadwal status based on penguji count
     */
    public static function updateJadwalStatus($jadwalId)
    {
        $jadwal = JadwalUjian::find($jadwalId);

        if (!$jadwal) {
            return;
        }

        // Count penguji for this jadwal
        $pengujiCount = PengujiUjian::where('jadwal_ujian_id', $jadwalId)->count();

        // Update status
        if ($pengujiCount >= 4) {
            $jadwal->status_jadwal = 'terjadwal';
        } else {
            $jadwal->status_jadwal = 'draft';
        }

        $jadwal->save();

        \Log::info('Jadwal status updated', [
            'jadwal_id' => $jadwalId,
            'penguji_count' => $pengujiCount,
            'status' => $jadwal->status_jadwal
        ]);
    }
}