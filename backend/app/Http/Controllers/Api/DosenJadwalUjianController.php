<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\JadwalUjian;
use App\Models\PengujiUjian;
use Illuminate\Http\Request;

class DosenJadwalUjianController extends Controller
{
    /**
     * Get jadwal ujian where dosen is assigned as penguji
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $jenisUjian = $request->query('jenis_ujian');

        // Get jadwal where dosen is assigned as penguji (only terjadwal status)
        $jadwals = JadwalUjian::with(['mahasiswa.prodi'])
            ->whereHas('pengujiUjian.penugasanDosen', function ($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->where('status_jadwal', 'terjadwal') // Only terjadwal
            ->when($jenisUjian, function ($q) use ($jenisUjian) {
                $jenisArray = explode(',', $jenisUjian);
                $q->whereIn('jenis_ujian', $jenisArray);
            })
            ->orderBy('tanggal', 'asc') // Upcoming first
            ->get();

        // Add all penguji info for each jadwal
        $jadwals->map(function ($jadwal) {
            $pengujiList = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)
                ->with('penugasanDosen.dosen')
                ->get()
                ->map(function ($pu) {
                    return [
                        'nama' => $pu->penugasanDosen->dosen->nama ?? '-',
                        'jenis_penugasan' => $pu->penugasanDosen->jenis_penugasan ?? '-',
                    ];
                });

            $jadwal->penguji = $pengujiList;
            $jadwal->penguji_count = $pengujiList->count();

            return $jadwal;
        });

        return response()->json(['data' => $jadwals]);
    }
}