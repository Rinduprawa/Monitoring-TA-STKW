<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\PendaftaranTa;
use App\Models\PengajuanProposal;
use App\Models\JadwalUjian;
use App\Models\Penilaian;
use App\Models\CatatanBimbingan;
use App\Models\ThresholdNilai;
use Illuminate\Http\Request;

class DashboardMahasiswaController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $mahasiswa = Mahasiswa::where('user_id', $user->id)
                ->with([
                    'dosenPembimbing1',
                    'dosenPembimbing2',
                    'prodi'
                ])
                ->first();

            if (!$mahasiswa) {
                return response()->json(['message' => 'Mahasiswa not found'], 404);
            }

            // Status pendaftaran TA
            $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
                ->where('is_active', true)
                ->first();
            $statusPendaftaran = $pendaftaran ? $pendaftaran->status_validasi : null;

            // Status proposal
            $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
                ->orderBy('created_at', 'desc')
                ->first();
            $statusProposal = $proposal ? $proposal->status : null;

            // Nilai rata-rata ujian proposal
            $nilaiProposal = Penilaian::where('mahasiswa_id', $mahasiswa->id)
                ->where('jenis_ujian', 'proposal')
                ->avg('nilai_akhir');

            // Threshold proposal
            $threshold = ThresholdNilai::where('jenis_ujian', 'proposal')->first();
            $thresholdProposal = $threshold ? $threshold->nilai_minimum : 65;

            // Jadwal ujian proposal (jika ada)
            $jadwalProposal = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
                ->where('jenis_ujian', 'proposal')
                ->with('pengujiUjian.penugasanDosen.dosen')
                ->first();

            // Format jadwal dengan penguji
            $jadwalFormatted = null;
            if ($jadwalProposal) {
                $pengujiList = [];
                if ($jadwalProposal->pengujiUjian && $jadwalProposal->pengujiUjian->count() > 0) {
                    $pengujiList = $jadwalProposal->pengujiUjian->map(function ($p) {
                        return [
                            'nama' => $p->penugasanDosen->dosen->nama,
                            'nip' => $p->penugasanDosen->dosen->nip,
                        ];
                    })->toArray();
                }

                $jadwalFormatted = [
                    'tanggal_ujian' => $jadwalProposal->tanggal,
                    'waktu_mulai' => $jadwalProposal->jam_mulai,
                    'waktu_selesai' => $jadwalProposal->jam_selesai,
                    'penguji' => $pengujiList
                ];
            }

            // Tenggat (jadwal ujian berikutnya)
            $tenggat = $this->getNextUjianTenggat($mahasiswa);

            // Recent bimbingan
            $bimbingans = CatatanBimbingan::where('mahasiswa_id', $mahasiswa->id)
                ->orderBy('tanggal_bimbingan', 'desc')
                ->limit(4)
                ->get();

            return response()->json([
                'mahasiswa' => $mahasiswa,
                'status_pendaftaran' => $statusPendaftaran,
                'status_proposal' => $statusProposal,
                'nilai_proposal' => $nilaiProposal ?? 0,
                'threshold_proposal' => $thresholdProposal,
                'jadwal_proposal' => $jadwalFormatted,
                'tenggat' => $tenggat,
                'bimbingans' => $bimbingans,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error loading dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getNextUjianTenggat($mahasiswa)
    {
        $nextUjianMap = [
            'proposal' => $mahasiswa->bentuk_ta === 'penelitian' ? 'uji_kelayakan_1' : 'tes_tahap_1',
            'uji_kelayakan_1' => 'uji_kelayakan_2',
            'uji_kelayakan_2' => 'sidang_skripsi',
            'tes_tahap_1' => 'tes_tahap_2',
            'tes_tahap_2' => 'pergelaran',
            'pergelaran' => 'sidang_komprehensif',
        ];

        $currentTahap = $mahasiswa->tahap_ta;
        $nextJenisUjian = $nextUjianMap[$currentTahap] ?? null;

        if (!$nextJenisUjian) {
            return null;
        }

        $jadwal = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis_ujian', $nextJenisUjian)
            ->where('status_jadwal', '!=', 'selesai')
            ->orderBy('tanggal', 'asc')
            ->first();

        return $jadwal ? $jadwal->tanggal : null;
    }
}
