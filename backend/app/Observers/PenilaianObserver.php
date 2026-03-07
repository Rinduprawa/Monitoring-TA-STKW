<?php

namespace App\Observers;

use App\Models\Penilaian;
use App\Models\Mahasiswa;
use App\Models\ThresholdNilai;
use App\Helpers\PenilaianHelper;

class PenilaianObserver
{
    /**
     * Handle the Penilaian "updated" event.
     */
    public function updated(Penilaian $penilaian)
    {
        // Check if locked_at just changed (nilai baru locked)
        if ($penilaian->wasChanged('locked_at') && $penilaian->locked_at) {
            $this->checkAndUpdateMahasiswaStatus($penilaian);
        }
    }

    /**
     * Check if all penilaian locked, then update mahasiswa status
     */
    private function checkAndUpdateMahasiswaStatus(Penilaian $penilaian)
    {
        $jadwal = $penilaian->jadwalUjian;

        if (!$jadwal) {
            return;
        }

        // Check apakah semua penilaian di ujian ini sudah locked
        $allLocked = PenilaianHelper::isAllPenilaianLocked($jadwal->id);

        if (!$allLocked) {
            return; // Belum semua locked, skip
        }

        // Hitung rata-rata ujian ini
        $rataRata = PenilaianHelper::hitungRataRataPerUjian($jadwal->mahasiswa_id, $jadwal->jenis_ujian);

        if ($rataRata === null) {
            return;
        }

        // Get threshold
        $threshold = ThresholdNilai::where('jenis_ujian', $jadwal->jenis_ujian)->first();
        $nilaiMinimum = $threshold->nilai_minimum ?? 65;

        $mahasiswa = Mahasiswa::find($jadwal->mahasiswa_id);

        if (!$mahasiswa) {
            return;
        }

        // Update status mahasiswa
        if ($rataRata < $nilaiMinimum) {
            // Tidak lulus, gugur
            $mahasiswa->update(['tahap_ta' => 'gugur']);

            \Log::info("Mahasiswa marked as gugur (ujian failed)", [
                'mahasiswa_id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'jenis_ujian' => $jadwal->jenis_ujian,
                'rata_rata' => $rataRata,
                'threshold' => $nilaiMinimum,
            ]);
        } else {
            // Lulus, update ke tahap berikutnya
            $nextTahap = PenilaianHelper::getNextTahap($mahasiswa, $jadwal->jenis_ujian);
            $mahasiswa->update(['tahap_ta' => $nextTahap]);

            \Log::info("Mahasiswa status updated (ujian passed)", [
                'mahasiswa_id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'jenis_ujian' => $jadwal->jenis_ujian,
                'rata_rata' => $rataRata,
                'from' => $mahasiswa->tahap_ta,
                'to' => $nextTahap,
            ]);
        }
    }
}
