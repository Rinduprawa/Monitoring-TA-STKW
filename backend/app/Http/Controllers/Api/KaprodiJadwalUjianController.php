<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalUjian;
use App\Models\Mahasiswa;
use App\Models\PengajuanProposal;
use Illuminate\Http\Request;

class KaprodiJadwalUjianController extends Controller
{
    public function index(Request $request)
    {
        $jenisUjian = $request->query('jenis_ujian');

        $jadwals = JadwalUjian::with(['mahasiswa.prodi'])
            ->when($jenisUjian, function ($q) use ($jenisUjian) {
                $jenisArray = explode(',', $jenisUjian);
                $q->whereIn('jenis_ujian', $jenisArray);
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        // Add penugasan count for each jadwal
        $jadwals->map(function ($jadwal) {
            $penugasan = \App\Models\PenugasanDosen::with('dosen')
                ->where('mahasiswa_id', $jadwal->mahasiswa_id)
                ->where('jenis_ujian', $jadwal->jenis_ujian)
                ->whereIn('jenis_penugasan', ['penguji_struktural', 'penguji_ahli', 'penguji_pembimbing', 'penguji_stakeholder'])
                ->get();

            $jadwal->penguji = $penugasan;
            $jadwal->penguji_count = $penugasan->count();

            return $jadwal;
        });

        return response()->json(['data' => $jadwals]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_ujian' => 'required|string',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'nullable',
        ]);

        $jadwal = JadwalUjian::create([
            ...$validated,
            'tanggal' => date('Y-m-d', strtotime($validated['tanggal'])),
            'status_jadwal' => $validated['status_jadwal'] ?? 'draft',
        ]);

        return response()->json(['data' => $jadwal], 201);
    }

    public function show($id)
    {
        $jadwal = JadwalUjian::with(['mahasiswa.prodi'])->findOrFail($id);

        $proposal = PengajuanProposal::where('mahasiswa_id', $jadwal->mahasiswa_id)
            ->where('status', 'disetujui')
            ->first();

        return response()->json([
            'data' => $jadwal,
            'proposal' => $proposal
        ]);
    }

    public function update(Request $request, $id)
    {
        $jadwal = JadwalUjian::findOrFail($id);

        $validated = $request->validate([
            'jenis_ujian' => 'required|string',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'nullable',
            'status_jadwal' => 'nullable|in:draft,terjadwal,selesai',
        ]);

        $jadwal->update([
            ...$validated,
            'tanggal' => date('Y-m-d', strtotime($validated['tanggal'])),
        ]);

        return response()->json(['data' => $jadwal]);
    }

    public function destroy($id)
    {
        $jadwal = JadwalUjian::findOrFail($id);
        $jadwal->delete();

        return response()->json(['message' => 'Jadwal berhasil dihapus']);
    }

    public function getMahasiswaEligible()
    {
        $mahasiswa = Mahasiswa::whereHas('pengajuanProposal', function ($q) {
            $q->where('status', 'disetujui');
        })->get();

        return response()->json(['data' => $mahasiswa]);
    }

    public function getNextUjian($mahasiswaId)
    {
        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);

        if (!$mahasiswa->bentuk_ta) {
            return response()->json([
                'data' => [
                    'next_ujian' => null,
                    'existing_jenis' => [],
                    'bentuk_ta' => null
                ]
            ]);
        }

        $existingJadwals = JadwalUjian::where('mahasiswa_id', $mahasiswaId)
            ->pluck('jenis_ujian')
            ->toArray();

        $sequence = $mahasiswa->bentuk_ta === 'penelitian'
            ? ['proposal', 'uji_kelayakan_1', 'uji_kelayakan_2', 'sidang_skripsi']
            : ['proposal', 'tes_tahap_1', 'tes_tahap_2', 'pergelaran', 'sidang_komprehensif'];

        $nextUjian = null;
        foreach ($sequence as $ujian) {
            if (!in_array($ujian, $existingJadwals)) {
                $nextUjian = $ujian;
                break;
            }
        }

        return response()->json([
            'data' => [
                'next_ujian' => $nextUjian,
                'existing_jenis' => $existingJadwals, // ← Return existing
                'bentuk_ta' => $mahasiswa->bentuk_ta
            ]
        ]);
    }

    public function checkSequence(Request $request, $mahasiswaId, $jenisUjian)
    {
        $mahasiswa = Mahasiswa::findOrFail($mahasiswaId);
        $excludeCurrent = $request->query('exclude_current'); // Current jenis ujian yang sedang di-edit

        // Get existing jadwals (exclude the one being edited)
        $existingJadwals = JadwalUjian::where('mahasiswa_id', $mahasiswaId)
            ->when($excludeCurrent, function ($q) use ($excludeCurrent) {
                $q->where('jenis_ujian', '!=', $excludeCurrent);
            })
            ->pluck('jenis_ujian')
            ->toArray();

        $sequence = $mahasiswa->bentuk_ta === 'penelitian'
            ? ['proposal', 'uji_kelayakan_1', 'uji_kelayakan_2', 'sidang_skripsi']
            : ['proposal', 'tes_tahap_1', 'tes_tahap_2', 'pergelaran', 'sidang_komprehensif'];

        $selectedIndex = array_search($jenisUjian, $sequence);

        if ($selectedIndex === false) {
            return response()->json([
                'is_valid' => false,
                'message' => 'Jenis ujian tidak sesuai dengan bentuk TA mahasiswa',
            ]);
        }

        // Find missing stages BEFORE selected jenis ujian
        $missingStages = [];
        for ($i = 0; $i < $selectedIndex; $i++) {
            if (!in_array($sequence[$i], $existingJadwals)) {
                $missingStages[] = str_replace('_', ' ', ucwords($sequence[$i], '_'));
            }
        }

        $isValid = count($missingStages) === 0;
        $message = $isValid
            ? ''
            : 'Mahasiswa belum memiliki jadwal: ' . implode(', ', $missingStages);

        return response()->json([
            'is_valid' => $isValid,
            'message' => $message,
        ]);
    }

    public function assignPenguji(Request $request, $id)
    {
        $request->validate([
            'penguji_ids' => 'required|array|min:1',
            'penguji_ids.*' => 'exists:dosen,id'
        ]);

        $jadwal = JadwalUjian::findOrFail($id);

        // Clear existing penguji
        $jadwal->penguji()->detach();

        // Attach new penguji
        $jadwal->penguji()->attach($request->penguji_ids);

        // Update status to terjadwal
        $jadwal->update(['status_jadwal' => 'terjadwal']);

        return response()->json([
            'message' => 'Penguji berhasil ditambahkan',
            'data' => $jadwal->load('penguji')
        ]);
    }

    public function getDosenPenguji()
    {
        // Get dosen yang sudah ditugaskan sebagai penguji
        // TODO: Filter by penugasan table (nanti)
        // For now, return all dosen
        $dosen = Dosen::all();

        return response()->json(['data' => $dosen]);
    }
}