<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JadwalUjian;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;

class KaprodiJadwalUjianController extends Controller
{
    public function index(Request $request)
    {
        $jenisUjian = $request->query('jenis_ujian');

        $jadwals = JadwalUjian::with(['mahasiswa'])
            ->when($jenisUjian, fn($q) => $q->where('jenis_ujian', $jenisUjian))
            ->orderBy('tanggal_ujian', 'desc')
            ->get();

        return response()->json(['data' => $jadwals]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_ujian' => 'required|string',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'tanggal_ujian' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'nullable',
        ]);

        $jadwal = JadwalUjian::create([
            ...$validated,
            'hari' => date('l', strtotime($validated['tanggal_ujian'])),
            'status_jadwal' => 'draft', // default draft
        ]);

        return response()->json(['data' => $jadwal], 201);
    }

    public function show($id)
    {
        $jadwal = JadwalUjian::with('mahasiswa')->findOrFail($id);
        return response()->json(['data' => $jadwal]);
    }

    public function update(Request $request, $id)
    {
        $jadwal = JadwalUjian::findOrFail($id);

        $validated = $request->validate([
            'jenis_ujian' => 'required|string',
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'tanggal_ujian' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'nullable',
        ]);

        $jadwal->update([
            ...$validated,
            'hari' => date('l', strtotime($validated['tanggal_ujian'])),
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