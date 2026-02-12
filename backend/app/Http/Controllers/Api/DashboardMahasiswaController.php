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
            $jadwalProposal = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
                ->where('jenis_ujian', 'proposal')
                ->first();

            $nilaiProposal = $jadwalProposal
                ? Penilaian::hitungRataRataNilai($jadwalProposal->id)
                : 0;

            // Threshold proposal
            $threshold = ThresholdNilai::where('jenis_ujian', 'proposal')->first();
            $thresholdProposal = $threshold ? $threshold->nilai_minimum : 65;

            // Jadwal ujian proposal (jika ada) dengan penguji
            $jadwalProposalWithPenguji = null;
            if ($jadwalProposal) {
                $jadwalProposal->load('pengujiUjian.dosen');
                $jadwalProposalWithPenguji = [
                    'tanggal_ujian' => $jadwalProposal->tanggal,
                    'waktu_mulai' => $jadwalProposal->waktu_mulai,
                    'waktu_selesai' => $jadwalProposal->waktu_selesai,
                    'ruangan' => $jadwalProposal->ruangan,
                    'penguji' => $jadwalProposal->pengujiUjian->map(function ($p) {
                        return [
                            'nama' => $p->dosen->nama,
                            'nip' => $p->dosen->nip,
                        ];
                    })
                ];
            }

            // Tanggal ujian terdekat (> today, paling dekat)
            $tanggalUjianTerdekat = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
                ->where('tanggal', '>', now())
                ->orderBy('tanggal', 'asc')
                ->value('tanggal');

            // Tenggat (sama dengan tanggal ujian terdekat)
            $tenggat = $tanggalUjianTerdekat;

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
                'jadwal_proposal' => $jadwalProposalWithPenguji,
                'tanggal_ujian_terdekat' => $tanggalUjianTerdekat,
                'tenggat' => $tenggat,
                'bimbingans' => $bimbingans,
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Dashboard error: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());

            return response()->json([
                'message' => 'Error loading dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}