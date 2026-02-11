<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengajuanProposal;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MahasiswaPengajuanProposalController extends Controller
{
    /**
     * Get list pengajuan proposal mahasiswa yang sedang login
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuans = PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pengajuans], 200);
    }

    /**
     * Store pengajuan proposal baru
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $request->validate([
            'judul_ta' => 'required|string|max:500',
            'bentuk_ta' => 'required|in:penelitian,penciptaan',
            'file_proposal' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        DB::beginTransaction();
        try {
            // Upload file
            $file = $request->file('file_proposal');
            $filename = time() . '_proposal.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('proposal/' . $mahasiswa->nim, $filename, 'public');

            // Create pengajuan
            $pengajuan = PengajuanProposal::create([
                'mahasiswa_id' => $mahasiswa->id,
                'judul_ta' => $request->judul_ta,
                'bentuk_ta' => $request->bentuk_ta,
                'file_proposal' => $path,
                'tanggal_pengajuan' => now(),
                'status' => 'diproses',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pengajuan proposal berhasil dibuat',
                'data' => $pengajuan,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat pengajuan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Show detail pengajuan
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanProposal::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan not found'], 404);
        }

        return response()->json(['data' => $pengajuan], 200);
    }

    /**
     * Update pengajuan proposal (hanya jika status = diproses)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanProposal::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan not found'], 404);
        }

        // Check apakah masih bisa diubah
        if ($pengajuan->status !== 'diproses') {
            return response()->json(['message' => 'Tidak dapat mengubah pengajuan yang sudah divalidasi'], 403);
        }

        $request->validate([
            'judul_ta' => 'required|string|max:500',
            'bentuk_ta' => 'required|in:penelitian,penciptaan',
            'file_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        DB::beginTransaction();
        try {
            $data = [
                'judul_ta' => $request->judul_ta,
                'bentuk_ta' => $request->bentuk_ta,
            ];

            // Upload new file if provided
            if ($request->hasFile('file_proposal')) {
                // Delete old file
                Storage::disk('public')->delete($pengajuan->file_proposal);

                // Upload new file
                $file = $request->file('file_proposal');
                $filename = time() . '_proposal.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('proposal/' . $mahasiswa->nim, $filename, 'public');

                $data['file_proposal'] = $path;
            }

            $pengajuan->update($data);

            DB::commit();

            return response()->json([
                'message' => 'Pengajuan proposal berhasil diperbarui',
                'data' => $pengajuan,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal memperbarui pengajuan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete pengajuan proposal (hanya jika status = diproses)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $pengajuan = PengajuanProposal::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan not found'], 404);
        }

        // Check apakah masih bisa dihapus
        if ($pengajuan->status !== 'diproses') {
            return response()->json(['message' => 'Tidak dapat menghapus pengajuan yang sudah divalidasi'], 403);
        }

        DB::beginTransaction();
        try {
            // Delete file
            Storage::disk('public')->delete($pengajuan->file_proposal);

            // Delete pengajuan
            $pengajuan->delete();

            DB::commit();

            return response()->json(['message' => 'Pengajuan proposal berhasil dihapus'], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menghapus pengajuan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download file proposal
     */
    public function downloadProposal($id)
    {
        try {
            $pengajuan = PengajuanProposal::findOrFail($id);
            $user = auth()->user();

            // Check ownership (mahasiswa atau kaprodi)
            if ($user->role === 'mahasiswa') {
                $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
                if (!$mahasiswa || $pengajuan->mahasiswa_id !== $mahasiswa->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role !== 'kaprodi') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $path = storage_path('app/public/' . $pengajuan->file_proposal);

            if (!file_exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->download($path);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Preview file proposal untuk mahasiswa & kaprodi
     */
    public function previewProposal(Request $request, $id)
    {
        try {
            $pengajuan = PengajuanProposal::findOrFail($id);
            $user = auth()->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Check authorization
            if ($user->role === 'mahasiswa') {
                $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
                if (!$mahasiswa || $pengajuan->mahasiswa_id !== $mahasiswa->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
            } elseif ($user->role === 'kaprodi') {
                // Kaprodi bisa akses semua file
            } else {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $path = storage_path('app/public/' . $pengajuan->file_proposal);

            if (!file_exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->file($path);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
