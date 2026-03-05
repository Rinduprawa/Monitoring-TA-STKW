<?php

namespace App\Observers;

use App\Models\JadwalUjian;
use Carbon\Carbon;

class JadwalUjianObserver
{
    /**
     * Handle the JadwalUjian "created" event.
     */
    public function created(JadwalUjian $jadwal)
    {
        $this->checkAndUpdateGugur($jadwal);
    }

    /**
     * Handle the JadwalUjian "updated" event.
     */
    public function updated(JadwalUjian $jadwal)
    {
        $this->checkAndUpdateGugur($jadwal);
    }

    /**
     * Check if mahasiswa should be marked as gugur or restored
     */
    private function checkAndUpdateGugur(JadwalUjian $jadwal)
    {
        $mahasiswa = $jadwal->mahasiswa;

        if (!$mahasiswa) {
            return;
        }

        $countdown = Carbon::now()->diffInDays(Carbon::parse($jadwal->tanggal), false);
        
        /**
         * Map tahap sebelum ujian
         */
        $previousTahapMap = [
            'proposal' => 'pendaftaran',
            'uji_kelayakan_1' => 'proposal',
            'uji_kelayakan_2' => 'uji_kelayakan_1',
            'sidang_skripsi' => 'uji_kelayakan_2',
            'tes_tahap_1' => 'proposal',
            'tes_tahap_2' => 'tes_tahap_1',
            'pergelaran' => 'tes_tahap_2',
            'sidang_komprehensif' => 'pergelaran',
        ];

        /**
         * RESTORE STATUS
         * jika sebelumnya gugur dan jadwal dimundurkan
         */
        if ($countdown >= 3 && $mahasiswa->tahap_ta === 'gugur') {

            $previousTahap = $previousTahapMap[$jadwal->jenis_ujian] ?? null;

            if ($previousTahap) {
                $mahasiswa->update([
                    'tahap_ta' => $previousTahap
                ]);

                \Log::info("Mahasiswa status restored from gugur", [
                    'nim' => $mahasiswa->nim,
                    'nama' => $mahasiswa->nama,
                    'from' => 'gugur',
                    'to' => $previousTahap,
                    'jadwal_id' => $jadwal->id,
                    'jenis_ujian' => $jadwal->jenis_ujian,
                    'tanggal_ujian' => $jadwal->tanggal,
                    'countdown' => $countdown,
                ]);
            }
        }

        /**
         * MARK GUGUR
         * jika jadwal terlalu dekat (<3 hari)
         */
        elseif ($countdown < 3 && $mahasiswa->tahap_ta !== 'gugur') {

            $mahasiswa->update([
                'tahap_ta' => 'gugur'
            ]);

            \Log::info("Mahasiswa marked as gugur", [
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'jadwal_id' => $jadwal->id,
                'jenis_ujian' => $jadwal->jenis_ujian,
                'tanggal_ujian' => $jadwal->tanggal,
                'countdown' => $countdown,
            ]);
        }
    }
}