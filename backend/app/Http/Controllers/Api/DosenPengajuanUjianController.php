<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\PengajuanUjian;
use App\Models\PenugasanDosen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DosenPengajuanUjianController extends Controller
{
    /**
     * Get pengajuan ujian for mahasiswa bimbingan (pembimbing_1 only)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $jenisUjian = $request->query('jenis_ujian');

        // Get mahasiswa that this dosen is pembimbing_1 for
        $mahasiswaIds = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('jenis_penugasan', 'pembimbing_1')
            ->pluck('mahasiswa_id')
            ->unique();

        // Get pengajuan for those mahasiswa
        $pengajuan = PengajuanUjian::with(['mahasiswa'])
            ->whereIn('mahasiswa_id', $mahasiswaIds)
            ->when($jenisUjian, function ($q) use ($jenisUjian) {
                $jenisArray = explode(',', $jenisUjian);
                $q->whereIn('jenis_ujian', $jenisArray);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * Approve pengajuan (pembimbing)
     */
    public function approve($id)
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $pengajuan = PengajuanUjian::with('mahasiswa')->findOrFail($id);

        // Check if dosen is pembimbing_1 for this mahasiswa
        $isPembimbing = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $pengajuan->mahasiswa_id)
            ->where('jenis_penugasan', 'pembimbing_1')
            ->exists();

        if (!$isPembimbing) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only can approve if status is diproses_pembimbing
        if ($pengajuan->status !== 'diproses_pembimbing') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat disetujui karena sudah diproses'
            ], 422);
        }

        $pengajuan->update([
            'status' => 'disetujui_pembimbing',
            'catatan_pembimbing' => null, // Clear catatan on approve
        ]);

        return response()->json([
            'message' => 'Pengajuan ujian berhasil disetujui',
            'data' => $pengajuan
        ]);
    }

    /**
     * Reject pengajuan (pembimbing)
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $request->validate([
            'catatan' => 'nullable|string|max:500'
        ]);

        $pengajuan = PengajuanUjian::with('mahasiswa')->findOrFail($id);

        // Check if dosen is pembimbing_1 for this mahasiswa
        $isPembimbing = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $pengajuan->mahasiswa_id)
            ->where('jenis_penugasan', 'pembimbing_1')
            ->exists();

        if (!$isPembimbing) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only can reject if status is diproses_pembimbing
        if ($pengajuan->status !== 'diproses_pembimbing') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat ditolak karena sudah diproses'
            ], 422);
        }

        $pengajuan->update([
            'status' => 'ditolak_pembimbing',
            'catatan_pembimbing' => $request->catatan,
        ]);

        return response()->json([
            'message' => 'Pengajuan ujian berhasil ditolak',
            'data' => $pengajuan
        ]);
    }

    /**
     * Preview bukti kelayakan file
     */
    public function previewBukti($id)
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json(['message' => 'Dosen not found'], 404);
        }

        $pengajuan = PengajuanUjian::findOrFail($id);

        // Check if dosen is pembimbing_1 for this mahasiswa
        $isPembimbing = PenugasanDosen::where('dosen_id', $dosen->id)
            ->where('mahasiswa_id', $pengajuan->mahasiswa_id)
            ->where('jenis_penugasan', 'pembimbing_1')
            ->exists();

        if (!$isPembimbing) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$pengajuan->file_bukti_kelayakan) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $path = storage_path('app/public/' . $pengajuan->file_bukti_kelayakan);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $contentType = match (strtolower($extension)) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            default => 'application/octet-stream',
        };

        return response()->file($path, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0'
        ]);
    }
}