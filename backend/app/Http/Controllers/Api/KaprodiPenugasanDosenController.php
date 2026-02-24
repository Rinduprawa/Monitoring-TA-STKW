<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PenugasanDosen;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;

class KaprodiPenugasanDosenController extends Controller
{
    /**
     * Get penugasan grouped by dosen
     */
    public function index(Request $request)
    {
        $kategori = $request->query('kategori', 'pembimbing');

        $query = PenugasanDosen::with([
            'dosen' => function ($q) {
                $q->whereHas('user', function ($userQuery) {
                    $userQuery->where('is_active', true);
                });
            },
            'mahasiswa.prodi'
        ]);

        if ($kategori === 'pembimbing') {
            $query->pembimbing();
        } else {
            $query->penguji();
        }

        $penugasan = $query->orderBy('dosen_id')->get();

        // Filter out penugasan with inactive dosen
        $penugasan = $penugasan->filter(function ($item) {
            return $item->dosen !== null;
        });

        // Group by dosen
        $grouped = $penugasan->groupBy('dosen_id')->map(function ($items, $dosenId) {
            $dosen = $items->first()->dosen;

            return [
                'dosen_id' => $dosenId,
                'dosen_nama' => $dosen->nama,
                'dosen_nip' => $dosen->nip,
                'penugasan' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'mahasiswa_nama' => $item->mahasiswa->nama,
                        'mahasiswa_nim' => $item->mahasiswa->nim,
                        'bentuk_ta' => $item->mahasiswa->bentuk_ta,
                        'jenis_penugasan' => $item->jenis_penugasan,
                        'jenis_ujian' => $item->jenis_ujian,
                        'surat_tugas' => $item->file_surat_tugas,
                    ];
                })->values()
            ];
        })->values();

        return response()->json(['data' => $grouped]);
    }

    /**
     * Store new penugasan
     */
    public function store(Request $request)
    {
        $request->validate([
            'kategori' => 'required|in:pembimbing,penguji',
            'jenis_penugasan' => 'required|in:pembimbing_1,pembimbing_2,penguji_struktural,penguji_ahli,penguji_pembimbing,penguji_stakeholder',
            'jenis_ujian' => 'required_if:kategori,penguji|nullable|in:proposal,uji_kelayakan_1,tes_tahap_1,uji_kelayakan_2,tes_tahap_2,pergelaran,sidang_skripsi,sidang_komprehensif',
            'dosen_id' => 'required|exists:dosen,id',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'surat_tugas' => 'required|file|mimes:pdf|max:2048',
        ]);

        // ✅ RULE 1: Check exact duplicate (excluding soft deleted)
        $exactDuplicate = PenugasanDosen::where('dosen_id', $request->dosen_id)
            ->where('mahasiswa_id', $request->mahasiswa_id)
            ->where('jenis_penugasan', $request->jenis_penugasan)
            ->when($request->jenis_ujian, fn($q) => $q->where('jenis_ujian', $request->jenis_ujian))
            ->whereNull('deleted_at')
            ->exists();

        if ($exactDuplicate) {
            return response()->json([
                'message' => 'Penugasan ini sudah ada',
                'errors' => ['jenis_penugasan' => ['Dosen sudah ditugaskan dengan role yang sama untuk mahasiswa ini']]
            ], 422);
        }

        // ✅ RULE 2: Pembimbing mutual exclusion (1 dosen can't be both pembimbing 1 & 2)
        if (in_array($request->jenis_penugasan, ['pembimbing_1', 'pembimbing_2'])) {
            $hasPembimbing = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
                ->whereNull('deleted_at')
                ->exists();

            if ($hasPembimbing) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi pembimbing mahasiswa ini',
                    'errors' => ['mahasiswa_id' => ['Dosen sudah ditugaskan sebagai pembimbing untuk mahasiswa ini']]
                ], 422);
            }
        }

        // ✅ RULE 3: Penguji (non-pembimbing) - One role per ujian
        if (in_array($request->jenis_penugasan, ['penguji_struktural', 'penguji_ahli', 'penguji_stakeholder'])) {
            // Check if already penguji (any role) at this ujian
            $alreadyPenguji = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'])
                ->where('jenis_ujian', $request->jenis_ujian)
                ->whereNull('deleted_at')
                ->exists();

            if ($alreadyPenguji) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi penguji di ujian ini',
                    'errors' => ['jenis_penugasan' => ['Dosen sudah ditugaskan sebagai penguji di ujian ini untuk mahasiswa ini']]
                ], 422);
            }

            // Check if dosen is pembimbing (can only be penguji_pembimbing)
            $isPembimbing = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
                ->whereNull('deleted_at')
                ->exists();

            if ($isPembimbing) {
                return response()->json([
                    'message' => 'Dosen pembimbing hanya bisa menjadi penguji pembimbing',
                    'errors' => ['jenis_penugasan' => ['Dosen ini adalah pembimbing mahasiswa, hanya bisa ditugaskan sebagai Penguji Pembimbing']]
                ], 422);
            }
        }

        // ✅ RULE 4: Penguji Pembimbing - One role per ujian
        if ($request->jenis_penugasan === 'penguji_pembimbing') {
            $alreadyPenguji = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'])
                ->where('jenis_ujian', $request->jenis_ujian)
                ->whereNull('deleted_at')
                ->exists();

            if ($alreadyPenguji) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi penguji di ujian ini',
                    'errors' => ['jenis_penugasan' => ['Dosen sudah ditugaskan sebagai penguji di ujian ini']]
                ], 422);
            }
        }

        // ✅ All validations passed - Create
        $suratTugasPath = null;
        if ($request->hasFile('surat_tugas')) {
            $file = $request->file('surat_tugas');
            $filename = time() . '_surat_tugas.pdf';
            $suratTugasPath = $file->storeAs('surat_tugas', $filename, 'public');
        }

        $penugasan = PenugasanDosen::create([
            'dosen_id' => $request->dosen_id,
            'mahasiswa_id' => $request->mahasiswa_id,
            'jenis_penugasan' => $request->jenis_penugasan,
            'jenis_ujian' => $request->jenis_ujian,
            'surat_tugas' => $suratTugasPath,
        ]);

        return response()->json([
            'message' => 'Penugasan berhasil ditambahkan',
            'data' => $penugasan->load(['dosen', 'mahasiswa'])
        ], 201);
    }

    /**
     * Show single data
     */
    public function show($id)
    {
        $penugasan = PenugasanDosen::with([
            'dosen',
            'mahasiswa.prodi',
        ])->findOrFail($id);


        // Get the latest approved proposal for this mahasiswa (kaprodi may have approved multiple over time)
        $approvedProposal = \App\Models\PengajuanProposal::where('mahasiswa_id', $penugasan->mahasiswa_id)
            ->where('status', 'disetujui')
            ->orderBy('id', 'desc') // pick most recent in case there are multiple
            ->first();

        // Get jadwal ujian if penguji
        $jadwalUjian = null;
        if (in_array($penugasan->jenis_penugasan, ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'])) {
            $jadwalUjian = \App\Models\JadwalUjian::where('mahasiswa_id', $penugasan->mahasiswa_id)
                ->where('jenis_ujian', $penugasan->jenis_ujian)
                ->first();
        }

        return response()->json([
            'data' => [
                'penugasan' => $penugasan,
                'proposal' => $approvedProposal,
                'jadwal_ujian' => $jadwalUjian
            ]
        ]);
    }

    /**
     * Preview surat tugas file for kaprodi (and other authorized roles if needed)
     */
    public function previewSuratTugas($id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);
        $user = auth()->user();

        // only kaprodi should access, but you can add extra checks if desired
        if ($user->role !== 'kaprodi') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = storage_path('app/public/' . $penugasan->file_surat_tugas);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($path);
    }

    /**
     * Update penugasan
     */
    public function update(Request $request, $id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);

        $request->validate([
            'kategori' => 'required|in:pembimbing,penguji',
            'jenis_penugasan' => 'required|in:pembimbing_1,pembimbing_2,penguji_struktural,penguji_ahli,penguji_pembimbing,penguji_stakeholder',
            'jenis_ujian' => 'required_if:kategori,penguji|nullable|in:proposal,uji_kelayakan_1,tes_tahap_1,uji_kelayakan_2,tes_tahap_2,pergelaran,sidang_skripsi,sidang_komprehensif',
            'dosen_id' => 'required|exists:dosen,id',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'surat_tugas' => 'nullable|file|mimes:pdf|max:2048',
        ]);

        // ✅ RULE 1: Exact duplicate (exclude current)
        $exactDuplicate = PenugasanDosen::where('id', '!=', $id)
            ->where('dosen_id', $request->dosen_id)
            ->where('mahasiswa_id', $request->mahasiswa_id)
            ->where('jenis_penugasan', $request->jenis_penugasan)
            ->when($request->jenis_ujian, fn($q) => $q->where('jenis_ujian', $request->jenis_ujian))
            ->whereNull('deleted_at')
            ->exists();

        if ($exactDuplicate) {
            return response()->json([
                'message' => 'Penugasan ini sudah ada',
                'errors' => ['jenis_penugasan' => ['Dosen sudah ditugaskan dengan role yang sama']]
            ], 422);
        }

        // ✅ RULE 2: Pembimbing mutual exclusion (exclude current)
        if (in_array($request->jenis_penugasan, ['pembimbing_1', 'pembimbing_2'])) {
            $hasPembimbing = PenugasanDosen::where('id', '!=', $id)
                ->where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
                ->whereNull('deleted_at')
                ->exists();

            if ($hasPembimbing) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi pembimbing mahasiswa ini',
                    'errors' => ['mahasiswa_id' => ['Dosen sudah pembimbing untuk mahasiswa ini']]
                ], 422);
            }
        }

        // Check duplicate (exclude current)
        $exists = PenugasanDosen::where('id', '!=', $id)
            ->where('dosen_id', $request->dosen_id)
            ->where('mahasiswa_id', $request->mahasiswa_id)
            ->where('jenis_penugasan', $request->jenis_penugasan)
            ->when($request->jenis_ujian, fn($q) => $q->where('jenis_ujian', $request->jenis_ujian))
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Penugasan sudah ada'], 400);
        }

        // Upload new surat tugas if provided
        if ($request->hasFile('surat_tugas')) {
            // Delete old file
            if ($penugasan->file_surat_tugas) {
                \Storage::disk('public')->delete($penugasan->file_surat_tugas);
            }

            $file = $request->file('surat_tugas');
            $filename = time() . '_surat_tugas.pdf';
            $suratTugasPath = $file->storeAs('surat_tugas', $filename, 'public');

            $penugasan->file_surat_tugas = $suratTugasPath;
        }

        $penugasan->update([
            'dosen_id' => $request->dosen_id,
            'mahasiswa_id' => $request->mahasiswa_id,
            'jenis_penugasan' => $request->jenis_penugasan,
            'jenis_ujian' => $request->jenis_ujian,
        ]);

        return response()->json([
            'message' => 'Penugasan berhasil diperbarui',
            'data' => $penugasan->load(['dosen', 'mahasiswa'])
        ]);
    }

    /**
     * Delete penugasan
     */
    public function destroy($id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);

        if ($penugasan->file_surat_tugas) {
            \Storage::disk('public')->delete($penugasan->file_surat_tugas);
        }

        $penugasan->delete();

        return response()->json(['message' => 'Penugasan berhasil dihapus']);
    }

    /**
     * Get available mahasiswa (disabled if already assigned)
     */
    public function getAvailableMahasiswa(Request $request)
    {
        $jenisUjian = $request->query('jenis_ujian');

        $mahasiswa = Mahasiswa::whereHas('pengajuanProposal', function ($q) {
            $q->where('status', 'disetujui');
        })->with('prodi')->get();

        // Filter by bentuk_ta matching jenis_ujian (KEEP THIS)
        $jenisUjianToBentukTA = [
            'proposal' => ['penelitian', 'penciptaan'],
            'uji_kelayakan_1' => ['penelitian'],
            'uji_kelayakan_2' => ['penelitian'],
            'sidang_skripsi' => ['penelitian'],
            'tes_tahap_1' => ['penciptaan'],
            'tes_tahap_2' => ['penciptaan'],
            'pergelaran' => ['penciptaan'],
            'sidang_komprehensif' => ['penciptaan'],
        ];

        $allowedBentukTA = $jenisUjianToBentukTA[$jenisUjian] ?? [];

        $result = $mahasiswa->map(function ($mhs) use ($allowedBentukTA, $jenisUjian) {
            $wrongBentukTA = !empty($allowedBentukTA) && !in_array($mhs->bentuk_ta, $allowedBentukTA);

            $disabled = $wrongBentukTA; // ONLY disable wrong bentuk_ta
            $reason = '';

            if ($wrongBentukTA) {
                $ujianLabel = [
                    'uji_kelayakan_1' => 'Kelayakan (untuk penelitian)',
                    'uji_kelayakan_2' => 'Kelayakan (untuk penelitian)',
                    'sidang_skripsi' => 'Sidang Skripsi (untuk penelitian)',
                    'tes_tahap_1' => 'Tes Tahap (untuk penciptaan)',
                    'tes_tahap_2' => 'Tes Tahap (untuk penciptaan)',
                    'pergelaran' => 'Pergelaran (untuk penciptaan)',
                    'sidang_komprehensif' => 'Sidang Komprehensif (untuk penciptaan)',
                ];
                $reason = " ({$ujianLabel[$jenisUjian]})";
            }

            return [
                'value' => $mhs->id,
                'label' => "{$mhs->nama} - {$mhs->nim}{$reason}",
                'bentuk_ta' => $mhs->bentuk_ta,
                'disabled' => $disabled
            ];
        });

        return response()->json(['data' => $result]);
    }

    /**
     * Get available dosen
     */
    public function getAvailableDosen(Request $request)
    {
        $user = $request->user();

        // Get kaprodi's prodi_id
        $kaprodi = \App\Models\Kaprodi::where('user_id', $user->id)->first();

        if (!$kaprodi) {
            return response()->json(['message' => 'Kaprodi not found'], 404);
        }

        // Get dosen with same prodi, and user is active
        $dosen = Dosen::where('prodi_id', $kaprodi->prodi_id)
            ->whereHas('user', function ($q) {
                $q->where('is_active', true); // ← Check user.is_active
            })
            ->orderBy('nama')
            ->get()
            ->map(function ($d) {
                return [
                    'value' => $d->id,
                    'label' => "{$d->nama} - {$d->nip}"
                ];
            });

        return response()->json(['data' => $dosen]);
    }
}