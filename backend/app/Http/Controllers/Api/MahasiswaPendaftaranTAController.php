<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranTa;
use App\Models\BerkasPendaftaran;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MahasiswaPendaftaranTAController extends Controller
{
    /**
     * Get list pendaftaran TA mahasiswa yang sedang login
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pendaftarans = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->with('berkasPendaftaran')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pendaftarans], 200);
    }

    /**
     * Store pendaftaran TA baru
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $request->validate([
            'surat_permohonan' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bukti_uang_gedung' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'kuitansi_spp' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'kuitansi_biaya_ta' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'khs' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'krs' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'transkrip' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'proyeksi_ta' => 'required|file|mimes:doc,docx,pdf|max:2048',
        ]);

        DB::beginTransaction();
        try {
            // Create pendaftaran
            $pendaftaran = PendaftaranTa::create([
                'mahasiswa_id' => $mahasiswa->id,
                'status_validasi' => 'menunggu',
                'is_active' => true,
            ]);

            // Upload & create berkas
            $jenisBerkas = [
                'surat_permohonan',
                'bukti_uang_gedung',
                'kuitansi_spp',
                'kuitansi_biaya_ta',
                'khs',
                'krs',
                'transkrip',
                'proyeksi_ta',
            ];

            foreach ($jenisBerkas as $jenis) {
                if ($request->hasFile($jenis)) {
                    $file = $request->file($jenis);
                    $filename = time() . '_' . $jenis . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('berkas_pendaftaran/' . $mahasiswa->nim, $filename, 'public');

                    BerkasPendaftaran::create([
                        'pendaftaran_ta_id' => $pendaftaran->id,
                        'jenis_berkas' => $jenis,
                        'file_path' => $path,
                        'status' => 'menunggu_validasi',
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Pendaftaran TA berhasil dibuat',
                'data' => $pendaftaran->load('berkasPendaftaran'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat pendaftaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update pendaftaran TA (hanya jika belum divalidasi)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pendaftaran = PendaftaranTa::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pendaftaran) {
            return response()->json(['message' => 'Pendaftaran not found'], 404);
        }

        // Check apakah sudah divalidasi
        if ($pendaftaran->status_validasi !== 'menunggu') {
            return response()->json(['message' => 'Tidak dapat mengubah pendaftaran yang sudah divalidasi'], 403);
        }

        $request->validate([
            'surat_permohonan' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'bukti_uang_gedung' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'kuitansi_spp' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'kuitansi_biaya_ta' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'khs' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'krs' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'transkrip' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'proyeksi_ta' => 'nullable|file|mimes:doc,docx,pdf|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $jenisBerkas = [
                'surat_permohonan',
                'bukti_uang_gedung',
                'kuitansi_spp',
                'kuitansi_biaya_ta',
                'khs',
                'krs',
                'transkrip',
                'proyeksi_ta',
            ];

            foreach ($jenisBerkas as $jenis) {
                if ($request->hasFile($jenis)) {
                    $berkas = BerkasPendaftaran::where('pendaftaran_ta_id', $pendaftaran->id)
                        ->where('jenis_berkas', $jenis)
                        ->first();

                    if ($berkas) {
                        // Delete old file
                        Storage::disk('public')->delete($berkas->file_path);

                        // Upload new file
                        $file = $request->file($jenis);
                        $filename = time() . '_' . $jenis . '.' . $file->getClientOriginalExtension();
                        $path = $file->storeAs('berkas_pendaftaran/' . $mahasiswa->nim, $filename, 'public');

                        $berkas->update([
                            'file_path' => $path,
                            'status' => 'menunggu_validasi',
                            'catatan' => null,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Pendaftaran TA berhasil diperbarui',
                'data' => $pendaftaran->load('berkasPendaftaran'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui pendaftaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete pendaftaran TA (hanya jika belum divalidasi)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pendaftaran = PendaftaranTa::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pendaftaran) {
            return response()->json(['message' => 'Pendaftaran not found'], 404);
        }

        // Check apakah sudah divalidasi
        if ($pendaftaran->status_validasi !== 'menunggu') {
            return response()->json(['message' => 'Tidak dapat menghapus pendaftaran yang sudah divalidasi'], 403);
        }

        DB::beginTransaction();
        try {
            // Delete files
            foreach ($pendaftaran->berkasPendaftaran as $berkas) {
                Storage::disk('public')->delete($berkas->file_path);
                $berkas->forceDelete();
            }

            // Delete pendaftaran
            $pendaftaran->forceDelete();

            DB::commit();

            return response()->json(['message' => 'Pendaftaran TA berhasil dihapus'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus pendaftaran: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get detail pendaftaran TA
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pendaftaran = PendaftaranTa::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->with('berkasPendaftaran')
            ->first();

        if (!$pendaftaran) {
            return response()->json(['message' => 'Pendaftaran not found'], 404);
        }

        return response()->json($pendaftaran, 200); // tanpa wrapper 'data'
    }

    /**
     * Serve berkas untuk preview (mahasiswa & kaprodi)
     */
    public function serveBerkas(Request $request, $id)
    {
        try {
            // Support auth via header OR query string (untuk iframe)
            if ($request->has('token')) {
                $token = $request->query('token');

                // Manual auth dengan token
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;

                if (!$user) {
                    return response()->json(['message' => 'Invalid token'], 401);
                }

                auth()->setUser($user);
            }

            $berkas = BerkasPendaftaran::findOrFail($id);
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Check authorization
            if ($user->role === 'mahasiswa') {
                $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
                if (!$mahasiswa || $berkas->pendaftaranTa->mahasiswa_id !== $mahasiswa->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'kaprodi') {
                // Kaprodi bisa akses semua file
            } else {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $path = storage_path('app/public/' . $berkas->file_path);

            if (!file_exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->file($path);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download berkas file
     */
    public function downloadBerkas(Request $request, $id)
    {
        try {
            // Support auth via header OR query string
            if ($request->has('token')) {
                $token = $request->query('token');
                $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
                if (!$user) {
                    return response()->json(['message' => 'Invalid token'], 401);
                }
                auth()->setUser($user);
            }

            $berkas = BerkasPendaftaran::findOrFail($id);
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Check authorization
            if ($user->role === 'mahasiswa') {
                $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
                if (!$mahasiswa || $berkas->pendaftaranTa->mahasiswa_id !== $mahasiswa->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'kaprodi') {
                // Kaprodi bisa download semua file
            } else {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $path = storage_path('app/public/' . $berkas->file_path);

            if (!file_exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            $filename = basename($berkas->file_path);
            return response()->download($path, $filename);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
