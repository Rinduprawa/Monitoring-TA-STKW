<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PenugasanDosen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DosenPenugasanController extends Controller
{
    /**
     * Get pembimbing penugasan only
     */
    public function pembimbing(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', ['pembimbing_1', 'pembimbing_2'])
            ->with(['mahasiswa'])
            ->get();

        // Flat list - no grouping for pembimbing
        $result = $penugasan->map(function ($item) {
            // Get approved proposal
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

    /**
     * Get penguji penugasan grouped by mahasiswa
     */
    public function penguji(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->whereIn('jenis_penugasan', [
                'penguji_struktural',
                'penguji_ahli',
                'penguji_pembimbing',
                'penguji_stakeholder'
            ])
            ->with(['mahasiswa'])
            ->get();

        // Group by mahasiswa
        $grouped = $penugasan->groupBy('mahasiswa_id')->map(function ($items, $mahasiswaId) {
            $firstItem = $items->first();

            return [
                'mahasiswa_id' => $mahasiswaId,
                'mahasiswa_nama' => $firstItem->mahasiswa->nama,
                'mahasiswa_nim' => $firstItem->mahasiswa->nim,
                'bentuk_ta' => $firstItem->mahasiswa->bentuk_ta,
                'penugasan' => $items->map(function ($item) {
                    // Get jadwal ujian via penguji_ujian
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

    /**
     * Preview surat tugas file for kaprodi (and other authorized roles if needed)
     */
    public function previewSuratTugas($id)
    {
        $penugasan = PenugasanDosen::findOrFail($id);
        $user = auth()->user();

        // only kaprodi should access, but you can add extra checks if desired
        if ($user->role !== 'dosen') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $path = storage_path('app/public/' . $penugasan->file_surat_tugas);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($path);
    }
}