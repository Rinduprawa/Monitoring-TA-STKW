<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\JadwalUjian;
use App\Models\PengujiUjian;
use App\Models\Penilaian;
use Illuminate\Http\Request;

class MahasiswaJadwalUjianController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        // Get all jadwal for this mahasiswa (only terjadwal status)
        $jadwals = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('status_jadwal', 'terjadwal')
            ->orderBy('tanggal', 'asc')
            ->get();

        // Add penguji and status info for each jadwal
        $jadwals->map(function ($jadwal) {
            // ✅ Get only active penguji (not soft deleted)
            $pengujiList = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)
                ->with([
                    'penugasanDosen' => function ($query) {
                        $query->whereNull('deleted_at'); // ← Filter soft deleted
                    }
                ])
                ->get()
                ->filter(function ($pu) {
                    return $pu->penugasanDosen !== null; // ← Remove null penugasan
                })
                ->map(function ($pu) {
                    return [
                        'nama' => $pu->penugasanDosen->dosen->nama ?? '-',
                        'jenis_penugasan' => $pu->penugasanDosen->jenis_penugasan ?? '-',
                    ];
                });

            $jadwal->penguji = $pengujiList->values(); // Re-index array

            // Calculate status based on nilai
            $jadwal->status_ujian = $this->calculateStatus($jadwal);

            return $jadwal;
        });

        return response()->json(['data' => $jadwals]);
    }

    private function calculateStatus($jadwal)
    {
        $threshold = 70; // Passing grade

        // Check if exam date has passed
        $today = new \DateTime();
        $today->setTime(0, 0, 0);

        $examDate = new \DateTime($jadwal->tanggal);
        $examDate->setTime(0, 0, 0);

        if ($examDate > $today) {
            // Future exam - return countdown
            $diff = $today->diff($examDate);
            $daysLeft = $diff->days;

            if ($daysLeft === 0) {
                return [
                    'type' => 'today',
                    'label' => 'Hari ini',
                    'color' => 'bg-red-50 border-red-600 text-red-600'
                ];
            } else if ($daysLeft === 1) {
                return [
                    'type' => 'tomorrow',
                    'label' => 'Besok',
                    'color' => 'bg-orange-50 border-orange-600 text-orange-600'
                ];
            } else if ($daysLeft <= 7) {
                return [
                    'type' => 'soon',
                    'label' => "{$daysLeft} hari lagi",
                    'color' => 'bg-yellow-50 border-yellow-600 text-yellow-600'
                ];
            } else {
                return [
                    'type' => 'upcoming',
                    'label' => "{$daysLeft} hari lagi",
                    'color' => 'bg-blue-50 border-blue-600 text-blue-600'
                ];
            }
        }

        // ✅ Past exam - check nilai (only active penguji)
        $pengujiIds = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)
            ->whereHas('penugasanDosen', function ($q) {
                $q->whereNull('deleted_at'); // ← Filter soft deleted
            })
            ->pluck('id');

        if ($pengujiIds->isEmpty()) {
            return [
                'type' => 'no_penguji',
                'label' => 'Belum ada penguji',
                'color' => 'bg-gray-50 border-gray-600 text-gray-600'
            ];
        }

        // Get all nilai for this jadwal
        $nilaiList = Penilaian::whereIn('penguji_ujian_id', $pengujiIds)
            ->pluck('nilai');

        if ($nilaiList->isEmpty()) {
            return [
                'type' => 'waiting',
                'label' => 'Menunggu Penilaian',
                'color' => 'bg-gray-50 border-gray-600 text-gray-600'
            ];
        }

        // Calculate average
        $avgNilai = $nilaiList->avg();

        if ($avgNilai >= $threshold) {
            return [
                'type' => 'lulus',
                'label' => 'Lulus',
                'nilai' => round($avgNilai, 2),
                'color' => 'bg-green-50 border-green-600 text-green-600'
            ];
        } else {
            return [
                'type' => 'gugur',
                'label' => 'Gugur',
                'nilai' => round($avgNilai, 2),
                'color' => 'bg-red-50 border-red-600 text-red-600'
            ];
        }
    }
}