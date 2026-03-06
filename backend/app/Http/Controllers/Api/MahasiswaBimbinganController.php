<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\PengajuanProposal;
use App\Models\JadwalUjian;
use App\Models\CatatanBimbingan;
use App\Models\SyaratBimbingan;
use App\Models\PenugasanDosen;
use Illuminate\Http\Request;

class MahasiswaBimbinganController extends Controller
{
    /**
     * Get bimbingan detail for authenticated mahasiswa
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        // Get approved proposal
        $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'disetujui')
            ->first();

        // Get pembimbing
        $pembimbing = PenugasanDosen::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->with('dosen')
            ->get();

        $pembimbing1 = $pembimbing->firstWhere('jenis_penugasan', 'pembimbing_1');
        $pembimbing2 = $pembimbing->firstWhere('jenis_penugasan', 'pembimbing_2');

        // Get next ujian
        $nextUjian = $this->getNextUjian($mahasiswa);
        $previousUjian = $this->getPreviousUjian($mahasiswa);
        $whatUjian = $mahasiswa->tahap_ta === 'gugur' 
            ? $previousUjian 
            : $nextUjian;

        $jadwalNext = null;
        $countdown = null;

        if ($nextUjian) {
            $jadwalNext = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
                ->where('jenis_ujian', $nextUjian)
                ->first();

            if ($jadwalNext) {
                $countdown = now()->diffInDays($jadwalNext->tanggal, false);
                $countdown = (int) $countdown;
            }
        }

        // Get syarat bimbingan
        $syaratNext = SyaratBimbingan::where('jenis_ujian', $whatUjian)->first();
        $minimalBimbinganNext = $syaratNext->minimal_bimbingan ?? 1;

        // Get all catatan bimbingan
        $catatans = CatatanBimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->with([
                'dosen.penugasanDosen' => function ($q) use ($mahasiswa) {
                    $q->where('mahasiswa_id', $mahasiswa->id)
                        ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2']);
                }
            ])
            ->orderBy('tanggal_bimbingan', 'desc')
            ->get()
            ->map(function($catatan) {
                $pembimbingLabel = '-';
                if ($catatan->dosen && $catatan->dosen->penugasanDosen->isNotEmpty()) {
                    $penugasan = $catatan->dosen->penugasanDosen->first();
                    $jenisLabel = $penugasan->jenis_penugasan === 'pembimbing_1' 
                        ? 'Pembimbing 1' 
                        : 'Pembimbing 2';
                    $pembimbingLabel = "{$jenisLabel}: {$catatan->dosen->nama}";
                }
                
                $catatan->ditambahkan_oleh = $pembimbingLabel;
                return $catatan;
            });

        $bimbinganDone = CatatanBimbingan::where('mahasiswa_id', $mahasiswa->id)
            ->where('untuk_ujian', $whatUjian)
            ->count();

        return response()->json([
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'bentuk_ta' => $proposal->bentuk_ta ?? $mahasiswa->bentuk_ta,
                'judul_ta' => $proposal->judul_ta ?? '-',
                'tahap_ta' => $mahasiswa->tahap_ta,
            ],
            'pembimbing' => [
                'pembimbing_1' => $pembimbing1 ? [
                    'nama' => $pembimbing1->dosen->nama,
                    'nip' => $pembimbing1->dosen->nip,
                ] : null,
                'pembimbing_2' => $pembimbing2 ? [
                    'nama' => $pembimbing2->dosen->nama,
                    'nip' => $pembimbing2->dosen->nip,
                ] : null,
            ],
            'next_ujian' => $nextUjian ? ucwords(str_replace('_', ' ', $nextUjian)) : null,
            'countdown' => $countdown,
            'minimal_bimbingan_next' => $minimalBimbinganNext,
            'jumlah_bimbingan' => $bimbinganDone,
            'is_gugur' => $mahasiswa->tahap_ta === 'gugur',
            'catatans' => $catatans,
        ]);
    }

    /**
     * Get detail catatan
     */
    public function show($catatanId)
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        // Get approved proposal
        $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'disetujui')
            ->first();

        $catatan = CatatanBimbingan::with(['dosen'])
            ->where('mahasiswa_id', $mahasiswa->id)
            ->findOrFail($catatanId);
        
        // Get pembimbing info
        $pembimbingPenugasan = PenugasanDosen::where('dosen_id', $catatan->dosen_id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->first();

        return response()->json([
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'judul_ta' => $proposal->judul_ta ?? '-',
                'tahap_ta' => $mahasiswa->tahap_ta,
            ],
            'catatan' => [
                'id' => $catatan->id,
                'judul_bimbingan' => $catatan->judul_bimbingan,
                'deskripsi' => $catatan->deskripsi,
                'tanggal_bimbingan' => $catatan->tanggal_bimbingan,
                'untuk_ujian' => $catatan->untuk_ujian,
                'status' => $catatan->status,
                'dosen' => [
                    'nama' => $catatan->dosen->nama,
                    'nip' => $catatan->dosen->nip,
                    'jenis_penugasan' => $pembimbingPenugasan->jenis_penugasan ?? null,
                ]
            ]
        ]);
    }

    /**
     * Helper: Get next ujian
     */
    private function getNextUjian($mahasiswa)
    {
        $sequences = [
            'penelitian' => ['proposal', 'uji_kelayakan_1', 'uji_kelayakan_2', 'sidang_skripsi'],
            'penciptaan' => ['proposal', 'tes_tahap_1', 'tes_tahap_2', 'pergelaran', 'sidang_komprehensif'],
        ];

        $bentukTa = $mahasiswa->bentuk_ta;
        $currentTahap = $mahasiswa->tahap_ta;

        if (!isset($sequences[$bentukTa])) {
            return null;
        }

        $sequence = $sequences[$bentukTa];
        $currentIndex = array_search($currentTahap, $sequence);

        if ($currentIndex === false || $currentIndex === count($sequence) - 1) {
            return null;
        }

        return $sequence[$currentIndex + 1];
    }

    /**
     * Helper: Get previous ujian
     */
    private function getPreviousUjian($mahasiswa)
    {
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

        $jadwalNext = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('tanggal', 'desc')
            ->first();

        if ($jadwalNext) {
            return $previousTahapMap[$jadwalNext->jenis_ujian] ?? null;
        }

        return null;
    }
}