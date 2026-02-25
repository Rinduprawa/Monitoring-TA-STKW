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
     * Get penugasan for authenticated dosen, grouped by mahasiswa
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        // Get all penugasan for this dosen
        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->with([
                'mahasiswa.prodi',
                'mahasiswa.user'
            ])
            ->get();

        // Group by mahasiswa_id
        $grouped = $penugasan->groupBy('mahasiswa_id')->map(function ($items, $mahasiswaId) {
            $firstItem = $items->first();

            return [
                'mahasiswa_id' => $mahasiswaId,
                'mahasiswa_nama' => $firstItem->mahasiswa->nama,
                'mahasiswa_nim' => $firstItem->mahasiswa->nim,
                'mahasiswa_judul_ta' => $firstItem->mahasiswa->judul_ta,
                'bentuk_ta' => $firstItem->mahasiswa->bentuk_ta,
                'penugasan' => $items->map(function ($item) {
                    // Get jadwal ujian untuk penguji (jika ada)
                    $jadwalUjian = null;
                    if (str_starts_with($item->jenis_penugasan, 'penguji_')) {
                        $jadwalUjian = DB::table('jadwal_ujian')
                            ->join('penguji_ujian', 'jadwal_ujian.id', '=', 'penguji_ujian.jadwal_ujian_id')
                            ->where('penguji_ujian.penugasan_dosen_id', $item->id)
                            ->select('jadwal_ujian.tanggal_ujian', 'jadwal_ujian.waktu_mulai', 'jadwal_ujian.waktu_selesai')
                            ->first();
                    }

                    return [
                        'id' => $item->id,
                        'jenis_penugasan' => $item->jenis_penugasan,
                        'jenis_ujian' => $item->jenis_ujian,
                        'surat_tugas' => $item->file_surat_tugas,
                        'jadwal_ujian' => $jadwalUjian ? [
                            'tanggal_ujian' => $jadwalUjian->tanggal_ujian,
                            'waktu_mulai' => $jadwalUjian->waktu_mulai,
                            'waktu_selesai' => $jadwalUjian->waktu_selesai,
                        ] : null,
                    ];
                })->values()
            ];
        })->values();

        return response()->json(['data' => $grouped], 200);
    }

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
            ->with([
                'mahasiswa.prodi',
                'mahasiswa.user'
            ])
            ->get();

        $grouped = $penugasan->groupBy('mahasiswa_id')->map(function ($items, $mahasiswaId) {
            $firstItem = $items->first();

            return [
                'mahasiswa_id' => $mahasiswaId,
                'mahasiswa_nama' => $firstItem->mahasiswa->nama,
                'mahasiswa_nim' => $firstItem->mahasiswa->nim,
                'mahasiswa_judul_ta' => $firstItem->mahasiswa->judul_ta,
                'bentuk_ta' => $firstItem->mahasiswa->bentuk_ta,
                'penugasan' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'jenis_penugasan' => $item->jenis_penugasan,
                        'surat_tugas' => $item->file_surat_tugas,
                    ];
                })->values()
            ];
        })->values();

        return response()->json(['data' => $grouped], 200);
    }

    /**
     * Get penguji penugasan only
     */
    public function penguji(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penugasan = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('jenis_penugasan', 'like', 'penguji_%')
            ->with([
                'mahasiswa.prodi',
                'mahasiswa.user'
            ])
            ->get();

        $grouped = $penugasan->groupBy('mahasiswa_id')->map(function ($items, $mahasiswaId) {
            $firstItem = $items->first();

            return [
                'mahasiswa_id' => $mahasiswaId,
                'mahasiswa_nama' => $firstItem->mahasiswa->nama,
                'mahasiswa_nim' => $firstItem->mahasiswa->nim,
                'bentuk_ta' => $firstItem->mahasiswa->bentuk_ta,
                'penugasan' => $items->map(function ($item) {
                    // Get jadwal ujian
                    $jadwalUjian = DB::table('jadwal_ujian')
                        ->join('penguji_ujian', 'jadwal_ujian.id', '=', 'penguji_ujian.jadwal_ujian_id')
                        ->where('penguji_ujian.penugasan_dosen_id', $item->id)
                        ->select('jadwal_ujian.tanggal_ujian', 'jadwal_ujian.waktu_mulai', 'jadwal_ujian.waktu_selesai')
                        ->first();

                    return [
                        'id' => $item->id,
                        'jenis_penugasan' => $item->jenis_penugasan,
                        'jenis_ujian' => $item->jenis_ujian,
                        'surat_tugas' => $item->file_surat_tugas,
                        'jadwal_ujian' => $jadwalUjian ? [
                            'tanggal_ujian' => $jadwalUjian->tanggal_ujian,
                            'waktu_mulai' => $jadwalUjian->waktu_mulai,
                            'waktu_selesai' => $jadwalUjian->waktu_selesai,
                        ] : null,
                    ];
                })->values()
            ];
        })->values();

        return response()->json(['data' => $grouped], 200);
    }

    /**
     * Preview surat tugas file
     */
    public function previewSurat(Request $request, $id)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $penugasan = PenugasanDosen::where('id', $id)
            ->where('dosen_id', $dosen->id)
            ->first();

        if (!$penugasan) {
            return response()->json(['message' => 'Penugasan not found'], 404);
        }

        if (!$penugasan->file_surat_tugas) {
            return response()->json(['message' => 'Surat tugas not found'], 404);
        }

        $path = storage_path('app/public/' . $penugasan->file_surat_tugas);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Support token via query string for iframe
        if ($request->has('token')) {
            $token = $request->query('token');
            $tokenUser = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;

            if ($tokenUser) {
                auth()->setUser($tokenUser);
            }
        }

        return response()->file($path);
    }
}
