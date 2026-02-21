<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengajuanProposal;
use App\Models\Kaprodi;
use Illuminate\Http\Request;

class KaprodiPengajuanProposalController extends Controller
{
    /**
     * Get list semua pengajuan proposal mahasiswa
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $kaprodi = Kaprodi::where('user_id', $user->id)->first();

        if (!$kaprodi) {
            return response()->json(['message' => 'Kaprodi not found'], 404);
        }

        $pengajuans = PengajuanProposal::with('mahasiswa.user')
            ->whereHas('mahasiswa', function ($query) use ($kaprodi) {
                $query->where('prodi_id', $kaprodi->prodi_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pengajuans], 200);
    }

    /**
     * Get detail pengajuan untuk validasi
     */
    public function show($id)
    {
        $pengajuan = PengajuanProposal::with('mahasiswa.user')->findOrFail($id);

        return response()->json(['data' => $pengajuan], 200);
    }

    /**
     * Validasi pengajuan proposal (approve/reject)
     */
    public function validasi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan_kaprodi' => 'nullable|string',
        ]);

        $pengajuan = PengajuanProposal::findOrFail($id);

        $pengajuan->update([
            'status' => $request->status,
            'catatan_kaprodi' => $request->catatan_kaprodi,
        ]);

        return response()->json([
            'message' => 'Validasi berhasil disimpan',
            'data' => $pengajuan,
        ], 200);
    }
}
