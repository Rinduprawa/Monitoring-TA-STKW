<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\JadwalUjian;
use App\Models\Penilaian;
use App\Models\PenugasanDosen;
use App\Models\PengujiUjian;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DosenPengujianController extends Controller
{
    /**
     * Get list ujian for authenticated dosen (by jenis_ujian)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $jenisUjian = $request->query('jenis_ujian'); // Filter by tab

        // Get jadwal where dosen is assigned as penguji
        $jadwals = JadwalUjian::with(['mahasiswa.prodi'])
            ->whereHas('pengujiUjian.penugasanDosen', function ($q) use ($dosen) {
                $q->where('dosen_id', $dosen->id);
            })
            ->where('status_jadwal', 'terjadwal')
            ->when($jenisUjian, function ($q) use ($jenisUjian) {
                $jenisArray = explode(',', $jenisUjian); // ← ADD THIS
                $q->whereIn('jenis_ujian', $jenisArray);  // ← CHANGE THIS
            })
            ->orderBy('tanggal', 'asc')
            ->get();

        // Check and lock penilaian (auto-lock mechanism)
        $this->checkAndLockPenilaian($jadwals);

        // Add penilaian info for each jadwal
        $jadwals->map(function ($jadwal) use ($dosen) {
            // Get penguji_ujian record untuk dosen ini
            $pengujiUjian = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)
                ->whereHas('penugasanDosen', function ($q) use ($dosen) {
                    $q->where('dosen_id', $dosen->id);
                })
                ->with('penugasanDosen')
                ->first();

            $sebagaiPenguji = '-';
            if ($pengujiUjian && $pengujiUjian->penugasanDosen) {
                $jenis = $pengujiUjian->penugasanDosen->jenis_penugasan;
                $labels = [
                    'penguji_struktural' => 'Struktural',
                    'penguji_ahli' => 'Ahli',
                    'penguji_pembimbing' => 'Pembimbing',
                    'penguji_stakeholder' => 'Stakeholder',
                ];
                $sebagaiPenguji = $labels[$jenis] ?? $jenis;
            }

            // Get penilaian via penguji_ujian_id
            $penilaian = null;
            if ($pengujiUjian) {
                $penilaian = Penilaian::where('penguji_ujian_id', $pengujiUjian->id)->first();
            }

            $jadwal->sebagai_penguji = $sebagaiPenguji;
            $jadwal->penilaian = $penilaian;
            $jadwal->penguji_ujian_id = $pengujiUjian->id ?? null; // ← ADD THIS for frontend
            $jadwal->is_locked = $penilaian ? ($penilaian->locked_at !== null) : false;
            $jadwal->has_penilaian = $penilaian !== null;

            return $jadwal;
        });

        return response()->json(['data' => $jadwals]);
    }

    /**
     * Get detail penilaian
     */
    public function show(Request $request, $pengujiUjianId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $pengujiUjian = PengujiUjian::with(['jadwalUjian.mahasiswa', 'penugasanDosen'])
            ->findOrFail($pengujiUjianId);

        // Verify dosen is owner of this penguji_ujian
        if ($pengujiUjian->penugasanDosen->dosen_id !== $dosen->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get penilaian
        $penilaian = Penilaian::where('penguji_ujian_id', $pengujiUjianId)->first();

        return response()->json([
            'jadwal' => $pengujiUjian->jadwalUjian,
            'penilaian' => $penilaian,
            'is_locked' => $penilaian ? ($penilaian->locked_at !== null) : false,
        ]);
    }

    /**
     * Store penilaian
     */
    public function store(Request $request, $pengujiUjianId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $pengujiUjian = PengujiUjian::with(['jadwalUjian', 'penugasanDosen'])
            ->findOrFail($pengujiUjianId);

        // Verify dosen is owner
        if ($pengujiUjian->penugasanDosen->dosen_id !== $dosen->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if already exists
        $existing = Penilaian::where('penguji_ujian_id', $pengujiUjianId)->first();

        if ($existing) {
            return response()->json([
                'message' => 'Penilaian sudah ada, gunakan endpoint update'
            ], 422);
        }

        $validated = $request->validate([
            'nilai' => 'required|numeric|min:0|max:100',
            'catatan' => 'nullable|string',
        ]);

        // Check if lewat 3 hari dari jadwal
        $jadwal = $pengujiUjian->jadwalUjian;
        $daysSinceJadwal = Carbon::now()->diffInDays(Carbon::parse($jadwal->tanggal), false);
        $lockedAt = null;

        if ($daysSinceJadwal < -3) {
            // Lewat 3 hari, lock immediately
            $lockedAt = now();
        }

        $penilaian = Penilaian::create([
            'penguji_ujian_id' => $pengujiUjianId,
            'nilai' => $validated['nilai'],
            'catatan' => $validated['catatan'],
            'locked_at' => $lockedAt,
        ]);

        return response()->json([
            'message' => $lockedAt
                ? 'Penilaian berhasil ditambahkan dan langsung di-lock (lewat 3 hari dari jadwal)'
                : 'Penilaian berhasil ditambahkan',
            'data' => $penilaian,
        ], 201);
    }

    /**
     * Update penilaian
     */
    public function update(Request $request, $pengujiUjianId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penilaian = Penilaian::where('penguji_ujian_id', $pengujiUjianId)
            ->with('pengujiUjian.penugasanDosen')
            ->firstOrFail();

        // Verify ownership
        if ($penilaian->pengujiUjian->penugasanDosen->dosen_id !== $dosen->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if locked
        if ($penilaian->locked_at) {
            return response()->json([
                'message' => 'Penilaian sudah di-lock dan tidak dapat diubah'
            ], 403);
        }

        $validated = $request->validate([
            'nilai' => 'required|numeric|min:0|max:100',
            'catatan' => 'nullable|string',
        ]);

        $penilaian->update($validated);

        return response()->json([
            'message' => 'Penilaian berhasil diperbarui',
            'data' => $penilaian,
        ]);
    }

    /**
     * Delete catatan (nilai tetap)
     */
    public function deleteCatatan(Request $request, $pengujiUjianId)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penilaian = Penilaian::where('penguji_ujian_id', $pengujiUjianId)
            ->with('pengujiUjian.penugasanDosen')
            ->firstOrFail();

        // Verify ownership
        if ($penilaian->pengujiUjian->penugasanDosen->dosen_id !== $dosen->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if locked
        if ($penilaian->locked_at) {
            return response()->json([
                'message' => 'Penilaian sudah di-lock dan tidak dapat diubah'
            ], 403);
        }

        // Delete catatan only (nilai tetap)
        $penilaian->update(['catatan' => null]);

        return response()->json([
            'message' => 'Catatan berhasil dihapus'
        ]);
    }

    /**
     * Check and lock penilaian (auto-lock after 3 days)
     */
    private function checkAndLockPenilaian($jadwals)
    {
        foreach ($jadwals as $jadwal) {
            $daysSinceJadwal = Carbon::now()->diffInDays(Carbon::parse($jadwal->tanggal), false);

            // Jika sudah lewat 3 hari, lock semua penilaian yang belum locked
            if ($daysSinceJadwal < -3) {
                // Get all penguji_ujian for this jadwal
                $pengujiUjianIds = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)->pluck('id');

                // Lock penilaian via penguji_ujian_id
                Penilaian::whereIn('penguji_ujian_id', $pengujiUjianIds)
                    ->whereNull('locked_at')
                    ->update(['locked_at' => now()]);
            }
        }
    }
}