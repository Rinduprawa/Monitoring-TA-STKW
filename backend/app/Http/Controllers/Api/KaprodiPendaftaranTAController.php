<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranTa;
use App\Models\BerkasPendaftaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KaprodiPendaftaranTAController extends Controller
{
    /**
     * Get list semua pendaftaran mahasiswa (untuk kaprodi)
     */
    public function index(Request $request)
    {
        $pendaftarans = PendaftaranTa::with([
            'mahasiswa.user',
            'mahasiswa.prodi',
            'berkasPendaftaran'
        ])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $pendaftarans], 200);
    }

    /**
     * Get detail pendaftaran untuk validasi
     */
    public function show($id)
    {
        $pendaftaran = PendaftaranTa::with([
            'mahasiswa.user',
            'mahasiswa.prodi',
            'berkasPendaftaran'
        ])->findOrFail($id);

        return response()->json(['data' => $pendaftaran], 200);
    }

    /**
     * Validasi pendaftaran (approve/reject)
     */
    public function validasi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:valid,tidak_valid',
            'berkas' => 'required|array',
            'berkas.*.id' => 'required|exists:berkas_pendaftaran,id',
            'berkas.*.is_valid' => 'required|boolean',
            'berkas.*.catatan' => 'nullable|string',
        ]);

        $pendaftaran = PendaftaranTa::findOrFail($id);

        DB::beginTransaction();
        try {
            // Update status setiap berkas
            foreach ($request->berkas as $berkasData) {
                $berkas = BerkasPendaftaran::find($berkasData['id']);

                if ($berkas && $berkas->pendaftaran_ta_id == $pendaftaran->id) {
                    $berkas->update([
                        'status' => $berkasData['is_valid'] ? 'valid' : 'tidak_valid',
                        'catatan' => $berkasData['catatan'] ?? null,
                    ]);
                }
            }

            // Update status pendaftaran keseluruhan
            $pendaftaran->update([
                'status_validasi' => $request->status,
                'catatan_kaprodi' => $request->status === 'tidak_valid'
                    ? 'Terdapat berkas yang tidak valid, silakan periksa catatan pada setiap berkas.'
                    : null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Validasi berhasil disimpan',
                'data' => $pendaftaran->load('berkasPendaftaran'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menyimpan validasi: ' . $e->getMessage()
            ], 500);
        }
    }
}
