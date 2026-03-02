<?php

namespace App\Services\TA;

use App\Models\PenugasanDosen;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Kaprodi;
use App\Models\JadwalUjian;
use App\Models\PengujiUjian;
use App\Models\PengajuanProposal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PenugasanDosenService
{
    public function getKaprodiByUser(int $userId): Kaprodi
    {
        $kaprodi = Kaprodi::where('user_id', $userId)->first();

        if (!$kaprodi) {
            throw ValidationException::withMessages([
                'user' => ['Kaprodi tidak ditemukan']
            ]);
        }

        return $kaprodi;
    }

    public function getDosenByUser(int $userId): Dosen
    {
        $dosen = Dosen::where('user_id', $userId)->first();

        if (!$dosen) {
            throw ValidationException::withMessages([
                'user' => ['Dosen tidak ditemukan']
            ]);
        }

        return $dosen;
    }

    public function getAvailableDosen()
    {
        $user = auth()->user();

        $kaprodi = $this->getKaprodiByUser($user->id);

        $dosen = Dosen::where('prodi_id', $kaprodi->prodi_id)
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
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

    public function getAvailableMahasiswa($jenisUjian)
    {
        $mahasiswa = Mahasiswa::whereHas('pengajuanProposal', function ($q) {
            $q->where('status', 'disetujui');
        })->with('prodi')->get();

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

            $wrongBentukTA = !empty($allowedBentukTA)
                && !in_array($mhs->bentuk_ta, $allowedBentukTA);

            $disabled = $wrongBentukTA;
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

    public function getKaprodiIndex($kategori = 'pembimbing')
    {
        $query = PenugasanDosen::with([
            'dosen' => function ($q) {
                $q->whereHas('user', function ($userQuery) {
                    $userQuery->where('is_active', true);
                });
            },
            'mahasiswa.prodi'
        ]);

        if ($kategori === 'pembimbing') {
            $query->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2']);
        } else {
            $query->whereIn('jenis_penugasan', [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ]);
        }

        $penugasan = $query->orderBy('dosen_id')->get();

        $penugasan = $penugasan->filter(function ($item) {
            return $item->dosen !== null;
        });

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

    public function getDosenPembimbing()
    {
        $user = auth()->user();

        $dosen = $this->getDosenByUser($user->id);

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->with(['mahasiswa'])
            ->get();

        $result = $penugasan->map(function ($item) {

            $proposal = DB::table('pengajuan_proposal')
                ->where('mahasiswa_id', $item->mahasiswa_id)
                ->where('status', 'disetujui')
                ->first();

            return [
                'id' => $item->id,
                'mahasiswa_nama' => $item->mahasiswa->nama,
                'mahasiswa_nim' => $item->mahasiswa->nim,
                'mahasiswa_judul_ta' => $proposal->judul_ta ?? null,
                'bentuk_ta' => $item->mahasiswa->bentuk_ta,
                'jenis_penugasan' => $item->jenis_penugasan,
                'surat_tugas' => $item->file_surat_tugas,
            ];
        });

        return response()->json(['data' => $result], 200);
    }

    public function getDosenPenguji()
    {
        $user = auth()->user();

        $dosen = $this->getDosenByUser($user->id);

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ])
            ->with(['mahasiswa'])
            ->get();

        $grouped = $penugasan->groupBy('mahasiswa_id')->map(function ($items, $mahasiswaId) {

            $firstItem = $items->first();

            return [
                'mahasiswa_id' => $mahasiswaId,
                'mahasiswa_nama' => $firstItem->mahasiswa->nama,
                'mahasiswa_nim' => $firstItem->mahasiswa->nim,
                'bentuk_ta' => $firstItem->mahasiswa->bentuk_ta,
                'penugasan' => $items->map(function ($item) {

                    $jadwalUjian = DB::table('jadwal_ujian')
                        ->join('penguji_ujian', 'jadwal_ujian.id', '=', 'penguji_ujian.jadwal_ujian_id')
                        ->where('penguji_ujian.penugasan_dosen_id', $item->id)
                        ->select('jadwal_ujian.*')
                        ->first();

                    return [
                        'id' => $item->id,
                        'jenis_penugasan' => $item->jenis_penugasan,
                        'jenis_ujian' => $item->jenis_ujian,
                        'surat_tugas' => $item->file_surat_tugas,
                        'jadwal_ujian' => $jadwalUjian,
                    ];
                })->values()
            ];
        })->values();

        return response()->json(['data' => $grouped], 200);
    }

    public function create($request)
    {
        // RULE 1: Exact duplicate (excluding soft deleted)
        $exactDuplicate = PenugasanDosen::where('dosen_id', $request->dosen_id)
            ->where('mahasiswa_id', $request->mahasiswa_id)
            ->where('jenis_penugasan', $request->jenis_penugasan)
            ->when($request->jenis_ujian, fn($q) =>
                $q->where('jenis_ujian', $request->jenis_ujian))
            ->whereNull('deleted_at')
            ->exists();

        if ($exactDuplicate) {
            return response()->json([
                'message' => 'Penugasan ini sudah ada',
                'errors' => [
                    'jenis_penugasan' => [
                        'Dosen sudah ditugaskan dengan role yang sama untuk mahasiswa ini'
                    ]
                ]
            ], 422);
        }

        // RULE 2: Pembimbing mutual exclusion
        if (in_array($request->jenis_penugasan, ['pembimbing_1', 'pembimbing_2'])) {

            $hasPembimbing = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
                ->whereNull('deleted_at')
                ->exists();

            if ($hasPembimbing) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi pembimbing mahasiswa ini',
                    'errors' => [
                        'mahasiswa_id' => [
                            'Dosen sudah ditugaskan sebagai pembimbing untuk mahasiswa ini'
                        ]
                    ]
                ], 422);
            }
        }

        // RULE 3: Penguji non pembimbing - one role per ujian
        if (
            in_array($request->jenis_penugasan, [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_stakeholder'
            ])
        ) {

            $alreadyPenguji = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', [
                    'penguji_struktural',
                    'penguji_ahli',
                    'penguji_pembimbing',
                    'penguji_stakeholder'
                ])
                ->where('jenis_ujian', $request->jenis_ujian)
                ->whereNull('deleted_at')
                ->exists();

            if ($alreadyPenguji) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi penguji di ujian ini',
                    'errors' => [
                        'jenis_penugasan' => [
                            'Dosen sudah ditugaskan sebagai penguji di ujian ini untuk mahasiswa ini'
                        ]
                    ]
                ], 422);
            }

            $isPembimbing = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
                ->whereNull('deleted_at')
                ->exists();

            if ($isPembimbing) {
                return response()->json([
                    'message' => 'Dosen pembimbing hanya bisa menjadi penguji pembimbing',
                    'errors' => [
                        'jenis_penugasan' => [
                            'Dosen ini adalah pembimbing mahasiswa, hanya bisa ditugaskan sebagai Penguji Pembimbing'
                        ]
                    ]
                ], 422);
            }
        }

        // RULE 4: Penguji pembimbing
        if ($request->jenis_penugasan === 'penguji_pembimbing') {

            $alreadyPenguji = PenugasanDosen::where('dosen_id', $request->dosen_id)
                ->where('mahasiswa_id', $request->mahasiswa_id)
                ->whereIn('jenis_penugasan', [
                    'penguji_struktural',
                    'penguji_ahli',
                    'penguji_pembimbing',
                    'penguji_stakeholder'
                ])
                ->where('jenis_ujian', $request->jenis_ujian)
                ->whereNull('deleted_at')
                ->exists();

            if ($alreadyPenguji) {
                return response()->json([
                    'message' => 'Dosen sudah menjadi penguji di ujian ini',
                    'errors' => [
                        'jenis_penugasan' => [
                            'Dosen sudah ditugaskan sebagai penguji di ujian ini'
                        ]
                    ]
                ], 422);
            }
        }

        // Upload file
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
            'file_surat_tugas' => $suratTugasPath,
        ]);

        // Sync penguji_ujian if jadwal exists
        if ($request->kategori === 'penguji' && $request->jenis_ujian) {

            $jadwal = JadwalUjian::where('mahasiswa_id', $penugasan->mahasiswa_id)
                ->where('jenis_ujian', $penugasan->jenis_ujian)
                ->first();

            if ($jadwal) {
                PengujiUjian::firstOrCreate([
                    'jadwal_ujian_id' => $jadwal->id,
                    'penugasan_dosen_id' => $penugasan->id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Penugasan berhasil ditambahkan',
            'data' => $penugasan->load(['dosen', 'mahasiswa'])
        ], 201);
    }

    public function update($request, $id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);

        // RULE 1: Exact duplicate (exclude current)
        $exactDuplicate = PenugasanDosen::where('id', '!=', $id)
            ->where('dosen_id', $request->dosen_id)
            ->where('mahasiswa_id', $request->mahasiswa_id)
            ->where('jenis_penugasan', $request->jenis_penugasan)
            ->when($request->jenis_ujian, fn($q) =>
                $q->where('jenis_ujian', $request->jenis_ujian))
            ->whereNull('deleted_at')
            ->exists();

        if ($exactDuplicate) {
            return response()->json([
                'message' => 'Penugasan ini sudah ada',
                'errors' => [
                    'jenis_penugasan' => ['Dosen sudah ditugaskan dengan role yang sama']
                ]
            ], 422);
        }

        // RULE 2: Pembimbing mutual exclusion
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
                    'errors' => [
                        'mahasiswa_id' => ['Dosen sudah pembimbing untuk mahasiswa ini']
                    ]
                ], 422);
            }
        }

        // Upload new file if provided
        if ($request->hasFile('surat_tugas')) {

            if ($penugasan->file_surat_tugas) {
                \Illuminate\Support\Facades\Storage::disk('public')
                    ->delete($penugasan->file_surat_tugas);
            }

            $file = $request->file('surat_tugas');
            $filename = time() . '_surat_tugas.pdf';

            $path = $file->storeAs('surat_tugas', $filename, 'public');

            $penugasan->file_surat_tugas = $path;
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

    public function delete($id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);

        if ($penugasan->file_surat_tugas) {
            Storage::disk('public')
                ->delete($penugasan->file_surat_tugas);
        }

        $penugasan->delete();

        return response()->json([
            'message' => 'Penugasan berhasil dihapus'
        ]);
    }

    public function showPenugasan($id)
    {
        $penugasan = PenugasanDosen::with([
            'dosen',
            'mahasiswa.prodi',
        ])->findOrFail($id);

        // Latest approved proposal
        $approvedProposal = PengajuanProposal::where('mahasiswa_id', $penugasan->mahasiswa_id)
            ->where('status', 'disetujui')
            ->orderBy('id', 'desc')
            ->first();

        // Jadwal ujian if penguji
        $jadwalUjian = null;

        if (
            in_array($penugasan->jenis_penugasan, [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ])
        ) {
            $jadwalUjian = JadwalUjian::where('mahasiswa_id', $penugasan->mahasiswa_id)
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

    public function getByMahasiswaUjian($mahasiswaId, $jenisUjian)
    {
        $penugasan = PenugasanDosen::with('dosen')
            ->where('mahasiswa_id', $mahasiswaId)
            ->where('jenis_ujian', $jenisUjian)
            ->whereIn('jenis_penugasan', [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ])
            ->whereNull('deleted_at')
            ->get();

        return response()->json(['data' => $penugasan]);
    }

    public function getByProdi(Kaprodi $kaprodi, string $kategori)
    {
        $query = PenugasanDosen::with(['dosen', 'mahasiswa.prodi'])
            ->whereHas('dosen', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id)
                    ->whereHas('user', fn($u) => $u->where('is_active', true));
            });

        if ($kategori === 'pembimbing') {
            $query->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2']);
        } else {
            $query->whereIn('jenis_penugasan', [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ]);
        }

        return $query->orderBy('dosen_id')->get();
    }

    public function preview(int $id, $user)
    {
        $penugasan = PenugasanDosen::with('dosen')->findOrFail($id);

        if ($user->role === 'kaprodi') {
            $kaprodi = $this->getKaprodiByUser($user->id);
            $this->authorizeProdi($kaprodi, $penugasan->dosen_id);
        } elseif ($user->role === 'dosen') {
            $dosen = $this->getDosenByUser($user->id);
            if ($penugasan->dosen_id !== $dosen->id) {
                throw ValidationException::withMessages([
                    'authorization' => ['Tidak berhak mengakses surat tugas ini.']
                ]);
            }
        } else {
            throw ValidationException::withMessages([
                'authorization' => ['Role tidak diizinkan.']
            ]);
        }

        $path = storage_path('app/public/' . $penugasan->file_surat_tugas);

        if (!file_exists($path)) {
            throw new ModelNotFoundException('File not found');
        }

        return response()->file($path);
    }

    private function authorizeProdi(Kaprodi $kaprodi, int $dosenId): void
    {
        $dosen = Dosen::findOrFail($dosenId);

        if ($dosen->prodi_id !== $kaprodi->prodi_id) {
            throw ValidationException::withMessages([
                'authorization' => ['Tidak boleh mengakses dosen luar prodi.']
            ]);
        }
    }
}