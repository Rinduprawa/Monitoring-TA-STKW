<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\PenugasanDosen;
use App\Models\PengajuanProposal;
use App\Models\CatatanBimbingan;
use App\Models\SyaratBimbingan;
use App\Models\JadwalUjian;
use Illuminate\Http\Request;

class DosenBimbinganController extends Controller
{
    private function getNextUjian($mahasiswa)
    {
        $nextUjianMap = [
            'pendaftaran' => 'proposal',
            'proposal' => $mahasiswa->bentuk_ta === 'penelitian' ? 'uji_kelayakan_1' : 'tes_tahap_1',
            'uji_kelayakan_1' => 'uji_kelayakan_2',
            'uji_kelayakan_2' => 'sidang_skripsi',
            'tes_tahap_1' => 'tes_tahap_2',
            'tes_tahap_2' => 'pergelaran',
            'pergelaran' => 'sidang_komprehensif',
        ];

        return $nextUjianMap[$mahasiswa->tahap_ta] ?? null;
    }

    private function getPreviousUjian($mahasiswa)
    {
        if ($mahasiswa->tahap_ta === 'gugur') {
            // Get the most recent jadwal to determine what they were working towards
            $lastJadwal = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
                ->orderBy('tanggal', 'desc')
                ->first();
            
            if ($lastJadwal) {
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
                
                return $previousTahapMap[$lastJadwal->jenis_ujian] ?? 'proposal';
            }
        }

    }
    
    /**
     * Get list mahasiswa bimbingan for authenticated dosen
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        // Get penugasan pembimbing
        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->with('mahasiswa.prodi')
            ->get();

        $mahasiswaList = $penugasan->map(function($p) {
            $mahasiswa = $p->mahasiswa;

            // Get proposal yang disetujui
            $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
                ->where('status', 'disetujui')
                ->first();

            $nextUjian = $this->getNextUjian($mahasiswa);
            $previousUjian = $this->getPreviousUjian($mahasiswa);
            $ujianForBimbingan = $mahasiswa->tahap_ta === 'gugur' 
                ? $previousUjian 
                : $nextUjian;

            $jumlahBimbingan = CatatanBimbingan::where('mahasiswa_id', $mahasiswa->id)
                ->where('untuk_ujian', $ujianForBimbingan) // ← Bukan tahap_ta
                ->count();

            // Minimal bimbingan untuk tahap saat ini
            $syarat = SyaratBimbingan::where('jenis_ujian', $ujianForBimbingan)->first();
            $minimalBimbingan = $syarat->minimal_bimbingan ?? 0;

            // Bimbingan terakhir
            $lastBimbingan = CatatanBimbingan::where('mahasiswa_id', $mahasiswa->id)
                ->where('untuk_ujian', $ujianForBimbingan)
                ->orderBy('tanggal_bimbingan', 'desc')
                ->first();

            return [
                'mahasiswa_id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'judul_ta' => $proposal->judul_ta ?? '-',
                'bentuk_ta' => $proposal->bentuk_ta ?? $mahasiswa->bentuk_ta,
                'sebagai' => $p->jenis_penugasan === 'pembimbing_1' ? 'Pembimbing 1' : 'Pembimbing 2',
                'bimbingan_terakhir' => $lastBimbingan ? $lastBimbingan->tanggal_bimbingan : null,
                'jumlah_bimbingan' => $jumlahBimbingan,
                'minimal_bimbingan' => $minimalBimbingan,
            ];
        });

        return response()->json(['data' => $mahasiswaList], 200);
    }

    /**
     * Get detail mahasiswa with catatan bimbingan
     */
    public function show(Request $request, $mahasiswaId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->with('mahasiswa.prodi')
            ->get();

        if (!$penugasan) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);

        // Get proposal
        $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswaId)
            ->where('status', 'disetujui')
            ->first();

        $nextUjian = $this->getNextUjian($mahasiswa);
        $previousUjian = $this->getPreviousUjian($mahasiswa);            
        $whatUjian = $mahasiswa->tahap_ta === 'gugur' 
            ? $previousUjian 
            : $nextUjian;

        $jadwalNext = null;
        $countdown = null;

        if ($nextUjian) {
            $jadwalNext = JadwalUjian::where('mahasiswa_id', $mahasiswaId)
                ->where('jenis_ujian', $nextUjian)
                ->first();

            if ($jadwalNext) {
                $countdown = now()->diffInDays($jadwalNext->tanggal, false);
                $countdown = (int) $countdown;
            }
        }


        $syaratNext = SyaratBimbingan::where('jenis_ujian', $whatUjian)->first();
        $minimalBimbinganNext = $syaratNext->minimal_bimbingan ?? 1;

        // Get catatan bimbingan untuk all tahap
        $catatans = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
            ->with([
                'dosen.penugasanDosen' => function ($q) use ($mahasiswaId) {
                    $q->where('mahasiswa_id', $mahasiswaId)
                        ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2']);
                }
            ])
            ->orderBy('tanggal_bimbingan', 'desc')
            ->get()
            ->map(function($catatan) {
            // Format label
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

        $bimbinganDone = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
            ->where('untuk_ujian', $whatUjian)
            ->count();
        
        $canMarkLayakUji = $bimbinganDone >= $minimalBimbinganNext;
        
        // Check if already ada layak_uji dari pembimbing lain
        $hasLayakUji = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
            ->where('untuk_ujian', $whatUjian)
            ->where('status', 'layak_uji')
            ->exists();


        return response()->json([
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nim' => $mahasiswa->nim,
                'nama' => $mahasiswa->nama,
                'bentuk_ta' => $proposal->bentuk_ta ?? $mahasiswa->bentuk_ta,
                'judul_ta' => $proposal->judul_ta ?? '-',
                'tahap_ta' => $mahasiswa->tahap_ta,
            ],
            'next_ujian' => $nextUjian ? ucwords(str_replace('_', ' ', $nextUjian)) : null,
            'countdown' => $countdown,
            'minimal_bimbingan_next' => $minimalBimbinganNext,
            'can_mark_layak_uji' => $canMarkLayakUji && !$hasLayakUji,
            'jumlah_bimbingan' => $bimbinganDone,
            'has_layak_uji' => $hasLayakUji,
            'is_gugur' => $mahasiswa->tahap_ta === 'gugur', // ✅ Just read status (Observer handles update)
            'catatans' => $catatans,
        ], 200);
    }
    
// DosenBimbinganController.php

public function showCatatan(Request $request, $mahasiswaId, $catatanId)
{
    $user = $request->user();
    $dosen = Dosen::where('user_id', $user->id)->first();

    if (!$dosen) {
        return response()->json(['message' => 'Dosen not found'], 404);
    }

    // Verify dosen is pembimbing
    $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
        ->where('mahasiswa_id', $mahasiswaId)
        ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
        ->first();

    if (!$penugasan) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);
    
    // Get approved proposal
    $proposal = PengajuanProposal::where('mahasiswa_id', $mahasiswaId)
        ->where('status', 'disetujui')
        ->first();

    $catatan = CatatanBimbingan::with(['dosen'])
        ->where('mahasiswa_id', $mahasiswaId)
        ->findOrFail($catatanId);
    
    // Get pembimbing info who created this catatan
    $pembimbingPenugasan = PenugasanDosen::where('dosen_id', $catatan->dosen_id)
        ->where('mahasiswa_id', $mahasiswaId)
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
     * Store new catatan bimbingan
     */
    public function store(Request $request, $mahasiswaId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        // Verify authorization & countdown
        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);
        
        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $mahasiswaId)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->first();

        if (!$penugasan) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check countdown
        $countdown = $this->getCountdown($mahasiswa);
        if ($countdown !== null && $countdown < 3) {
            return response()->json(['message' => 'Tidak dapat menambah catatan, mahasiswa dinyatakan gugur'], 403);
        }

        $validated = $request->validate([
            'judul_bimbingan' => 'required|string|max:500',
            'tanggal_bimbingan' => 'required|date',
            'status' => 'required|in:revisi,layak_uji',
            'deskripsi' => 'required|string',
        ]);

        if ($validated['status'] === 'layak_uji') {
            $nextUjian = $this->getNextUjian($mahasiswa);
            
            // Check jumlah bimbingan
            $jumlahBimbingan = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
                ->where('untuk_ujian', $nextUjian)
                ->count();
            
            $syarat = SyaratBimbingan::where('jenis_ujian', $nextUjian)->first();
            $minimalBimbingan = $syarat->minimal_bimbingan ?? 1;
            
            if ($jumlahBimbingan < $minimalBimbingan) {
                return response()->json([
                    'message' => 'Belum memenuhi syarat minimal bimbingan',
                    'errors' => [
                        'status' => ["Minimal {$minimalBimbingan} bimbingan diperlukan untuk status layak uji"]
                    ]
                ], 422);
            }
            
            // Check sudah ada layak_uji dari pembimbing lain
            $hasLayakUji = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
                ->where('untuk_ujian', $nextUjian)
                ->where('status', 'layak_uji')
                ->exists();
            
            if ($hasLayakUji) {
                return response()->json([
                    'message' => 'Sudah ada catatan layak uji dari pembimbing lain',
                    'errors' => [
                        'status' => ['Mahasiswa sudah dinyatakan layak uji oleh pembimbing lain']
                    ]
                ], 422);
            }
        }

        $nextUjian = $this->getNextUjian($mahasiswa);

        $catatan = CatatanBimbingan::create([
            'mahasiswa_id' => $mahasiswaId,
            'dosen_id' => $dosen->id,
            'judul_bimbingan' => $validated['judul_bimbingan'],
            'tanggal_bimbingan' => $validated['tanggal_bimbingan'],
            'status' => $validated['status'],
            'deskripsi' => $validated['deskripsi'],
            'untuk_ujian' => $nextUjian, // ← NEXT ujian, bukan current tahap
        ]);

        return response()->json([
            'message' => 'Catatan bimbingan berhasil ditambahkan',
            'data' => $catatan,
        ], 201);
    }

    /**
     * Update catatan bimbingan
     */
    public function update(Request $request, $mahasiswaId, $catatanId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $catatan = CatatanBimbingan::where('id', $catatanId)
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        // Check countdown
        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);
        $countdown = $this->getCountdown($mahasiswa);
        
        if ($countdown !== null && $countdown < 3) {
            return response()->json(['message' => 'Tidak dapat mengubah catatan, mahasiswa dinyatakan gugur'], 403);
        }

        $validated = $request->validate([
            'judul_bimbingan' => 'required|string|max:500',
            'tanggal_bimbingan' => 'required|date',
            'status' => 'required|in:revisi,layak_uji',
            'deskripsi' => 'required|string',
        ]);

        if ($validated['status'] === 'layak_uji') {
            $nextUjian = $this->getNextUjian($mahasiswa);
            
            // Check jumlah bimbingan
            $jumlahBimbingan = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
                ->where('untuk_ujian', $nextUjian)
                ->count();
            
            $syarat = SyaratBimbingan::where('jenis_ujian', $nextUjian)->first();
            $minimalBimbingan = $syarat->minimal_bimbingan ?? 1;
            
            if ($jumlahBimbingan < $minimalBimbingan) {
                return response()->json([
                    'message' => 'Belum memenuhi syarat minimal bimbingan',
                    'errors' => [
                        'status' => ["Minimal {$minimalBimbingan} bimbingan diperlukan untuk status layak uji"]
                    ]
                ], 422);
            }
            
            // Check sudah ada layak_uji dari pembimbing lain
            $hasLayakUji = CatatanBimbingan::where('mahasiswa_id', $mahasiswaId)
                ->where('untuk_ujian', $nextUjian)
                ->where('status', 'layak_uji')
                ->exists();
            
            if ($hasLayakUji) {
                return response()->json([
                    'message' => 'Sudah ada catatan layak uji dari pembimbing lain',
                    'errors' => [
                        'status' => ['Mahasiswa sudah dinyatakan layak uji oleh pembimbing lain']
                    ]
                ], 422);
            }
        }

        $catatan->update($validated);

        return response()->json([
            'message' => 'Catatan bimbingan berhasil diperbarui',
            'data' => $catatan,
        ], 200);
    }

    /**
     * Delete catatan bimbingan (soft delete)
     */
    public function destroy(Request $request, $mahasiswaId, $catatanId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $catatan = CatatanBimbingan::where('id', $catatanId)
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('dosen_id', $dosen->id)
            ->firstOrFail();

        $catatan->delete(); // Soft delete

        return response()->json(['message' => 'Catatan bimbingan berhasil dihapus'], 200);
    }

    /**
     * Helper: Get countdown to next ujian
     */
    private function getCountdown($mahasiswa)
    {
        $nextUjianMap = [
            'pendaftaran' => 'proposal',
            'proposal' => $mahasiswa->bentuk_ta === 'penelitian' ? 'uji_kelayakan_1' : 'tes_tahap_1',
            'uji_kelayakan_1' => 'uji_kelayakan_2',
            'uji_kelayakan_2' => 'sidang_skripsi',
            'tes_tahap_1' => 'tes_tahap_2',
            'tes_tahap_2' => 'pergelaran',
            'pergelaran' => 'sidang_komprehensif',
        ];

        $nextUjian = $nextUjianMap[$mahasiswa->tahap_ta] ?? null;
        
        if (!$nextUjian) {
            return null;
        }

        $jadwal = JadwalUjian::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis_ujian', $nextUjian)
            ->first();
        
        $countdown = now()->diffInDays($jadwal->tanggal, false);
        $countdown = (int) $countdown;

        return $jadwal ? $countdown : null;
    }
}
