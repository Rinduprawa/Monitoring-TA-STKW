<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\PendaftaranTa;
use App\Models\PengajuanProposal;
use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MahasiswaPengajuanUjianController extends Controller
{
    /**
     * Get all pengajuan ujian for authenticated mahasiswa
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * Check if mahasiswa can submit new pengajuan
     */
    public function canSubmit(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json([
                'eligible' => false,
                'message' => 'Mahasiswa tidak ditemukan.'
            ], 404);
        }

        // 1️⃣ Cek semester aktif
        $semesterAktif = Semester::where('is_active', true)->first();

        if (!$semesterAktif) {
            return response()->json([
                'eligible' => false,
                'message' => 'Tidak ada semester aktif.'
            ]);
        }

        // 2️⃣ Cek pendaftaran TA valid
        $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->where('semester_id', $semesterAktif->id)
            ->where('status_validasi', 'valid')
            ->first();

        if (!$pendaftaran) {
            return response()->json([
                'eligible' => false,
                'message' => 'Silakan melakukan pendaftaran tugas akhir terlebih dahulu.'
            ]);
        }

        // 3️⃣ Cek proposal sudah disetujui
        $proposalValid = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'disetujui')
            ->first();

        if (!$proposalValid) {
            return response()->json([
                'eligible' => false,
                'message' => 'Silakan mengajukan proposal dan menunggu hingga disetujui terlebih dahulu.'
            ]);
        }

        // 4️⃣ Cek masih ada pengajuan ujian yang diproses
        $hasPending = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotIn('status', ['ditolak_kaprodi', 'disetujui_kaprodi'])
            ->exists();

        if ($hasPending) {
            return response()->json([
                'eligible' => false,
                'message' => 'Anda masih memiliki pengajuan ujian yang sedang diproses.'
            ]);
        }

        return response()->json([
            'eligible' => true,
            'message' => 'Anda dapat mengajukan ujian.'
        ]);
    }

    /**
     * Store new pengajuan ujian
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        // 1. Cek semester aktif
        $semesterAktif = Semester::where('is_active', true)->first();

        if (!$semesterAktif) {
            throw ValidationException::withMessages([
                'semester' => ['Tidak ada semester aktif']
            ]);
        }

        // 2. Cek pendaftaran TA valid
        $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->where('semester_id', $semesterAktif->id)
            ->where('status_validasi', 'valid')
            ->first();

        if (!$pendaftaran) {
            throw ValidationException::withMessages([
                'pendaftaran' => ['Silakan melakukan pendaftaran tugas akhir terlebih dahulu.']
            ]);
        }

        // 3. Cek proposal sudah disetujui
        $proposalValid = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'disetujui')
            ->first();

        if (!$proposalValid) {
            throw ValidationException::withMessages([
                'proposal' => ['Silakan mengajukan proposal dan menunggu hingga disetujui terlebih dahulu.']
            ]);
        }

        $request->validate([
            'jenis_ujian' => 'required|in:uji_kelayakan_1,tes_tahap_1,uji_kelayakan_2,tes_tahap_2,pergelaran,sidang_skripsi,sidang_komprehensif',
            'file_bukti_kelayakan' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // ✅ VALIDATE bentuk_ta matching
        $jenisUjianMapping = [
            'penelitian' => ['uji_kelayakan_1', 'uji_kelayakan_2', 'sidang_skripsi'],
            'penciptaan' => ['tes_tahap_1', 'tes_tahap_2', 'pergelaran', 'sidang_komprehensif'],
        ];

        $allowedJenisUjian = $jenisUjianMapping[$mahasiswa->bentuk_ta] ?? [];

        if (!in_array($request->jenis_ujian, $allowedJenisUjian)) {
            $bentukLabel = $mahasiswa->bentuk_ta === 'penelitian' ? 'Penelitian' : 'Penciptaan';

            return response()->json([
                'message' => 'Jenis ujian tidak sesuai dengan bentuk TA Anda',
                'errors' => [
                    'jenis_ujian' => [
                        "Mahasiswa dengan bentuk TA {$bentukLabel} tidak dapat mengajukan ujian ini"
                    ]
                ]
            ], 422);
        }

        // Check if can submit
        $hasPending = PengajuanUjian::where('mahasiswa_id', $mahasiswa->id)
            ->whereNotIn('status', ['ditolak_kaprodi', 'disetujui_kaprodi'])
            ->exists();

        if ($hasPending) {
            return response()->json([
                'message' => 'Anda masih memiliki pengajuan yang sedang diproses'
            ], 422);
        }

        // Upload file
        $file = $request->file('file_bukti_kelayakan');
        $extension = $file->getClientOriginalExtension();
        $filename = 'bukti_kelayakan_' . $mahasiswa->nim . '_' . time() . '.' . $extension;
        $filePath = $file->storeAs('pengajuan_ujian', $filename, 'public');

        $pengajuan = PengajuanUjian::create([
            'mahasiswa_id' => $mahasiswa->id,
            'jenis_ujian' => $request->jenis_ujian,
            'file_bukti_kelayakan' => $filePath,
            'status' => 'diproses_pembimbing',
            'tanggal_pengajuan' => now(),
        ]);

        return response()->json([
            'message' => 'Pengajuan ujian berhasil diajukan',
            'data' => $pengajuan
        ], 201);
    }

    /**
     * Get detail pengajuan
     */
    public function show($id)
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanUjian::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        return response()->json(['data' => $pengajuan]);
    }

    /**
     * Update pengajuan (only if status is diproses_pembimbing)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanUjian::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        // Only allow edit if status is diproses_pembimbing
        if ($pengajuan->status !== 'diproses_pembimbing') {
            return response()->json([
                'message' => 'Pengajuan tidak dapat diubah karena sudah diproses'
            ], 422);
        }

        $request->validate([
            'jenis_ujian' => 'required|in:uji_kelayakan_1,tes_tahap_1,uji_kelayakan_2,tes_tahap_2,pergelaran,sidang_skripsi,sidang_komprehensif',
            'file_bukti_kelayakan' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // ✅ VALIDATE bentuk_ta matching
        $jenisUjianMapping = [
            'penelitian' => ['uji_kelayakan_1', 'uji_kelayakan_2', 'sidang_skripsi'],
            'penciptaan' => ['tes_tahap_1', 'tes_tahap_2', 'pergelaran', 'sidang_komprehensif'],
        ];

        $allowedJenisUjian = $jenisUjianMapping[$mahasiswa->bentuk_ta] ?? [];

        if (!in_array($request->jenis_ujian, $allowedJenisUjian)) {
            $bentukLabel = $mahasiswa->bentuk_ta === 'penelitian' ? 'Penelitian' : 'Penciptaan';

            return response()->json([
                'message' => 'Jenis ujian tidak sesuai dengan bentuk TA Anda',
                'errors' => [
                    'jenis_ujian' => [
                        "Mahasiswa dengan bentuk TA {$bentukLabel} tidak dapat mengajukan ujian ini"
                    ]
                ]
            ], 422);
        }

        // Update file if provided
        if ($request->hasFile('file_bukti_kelayakan')) {
            // Delete old file
            if ($pengajuan->file_bukti_kelayakan) {
                Storage::disk('public')->delete($pengajuan->file_bukti_kelayakan);
            }

            // Upload new file
            $file = $request->file('file_bukti_kelayakan');
            $extension = $file->getClientOriginalExtension();
            $filename = 'bukti_kelayakan_' . $mahasiswa->nim . '_' . time() . '.' . $extension;
            $filePath = $file->storeAs('pengajuan_ujian', $filename, 'public');

            $pengajuan->file_bukti_kelayakan = $filePath;
        }

        $pengajuan->update([
            'jenis_ujian' => $request->jenis_ujian,
        ]);

        return response()->json([
            'message' => 'Pengajuan ujian berhasil diperbarui',
            'data' => $pengajuan
        ]);
    }

    public function previewBukti($id)
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanUjian::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();

        if (!$pengajuan->file_bukti_kelayakan) {
            return response()->json(['message' => 'File not found'], 404);
        }

        $path = storage_path('app/public/' . $pengajuan->file_bukti_kelayakan);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Determine content type
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $contentType = match (strtolower($extension)) {
            'pdf' => 'application/pdf',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            default => 'application/octet-stream',
        };

        return response()->file($path, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline'
        ]);
    }
}