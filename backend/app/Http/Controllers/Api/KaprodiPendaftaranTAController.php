<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranTa;
use App\Services\TA\PendaftaranTAService;
use Illuminate\Http\Request;

class KaprodiPendaftaranTAController extends Controller
{
    protected PendaftaranTAService $pendaftaranTAService;

    public function index(Request $request)
    {
        $kaprodi = $this->pendaftaranTAService->getKaprodiByUser($request->user()->id);

        return response()->json([
            'data' => $this->pendaftaranTAService->listByKaprodi($kaprodi)
        ]);
    }

    public function show(Request $request, $id)
    {
        $kaprodi = $this->pendaftaranTAService->getKaprodiByUser($request->user()->id);

        $pendaftaran = $this->pendaftaranTAService->findForKaprodi($id, $kaprodi);

        return response()->json([
            'data' => $pendaftaran
        ]);
    }

    public function validasi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:valid,tidak_valid',
            'berkas' => 'required|array',
        ]);

        $pendaftaran = PendaftaranTa::findOrFail($id);

        $result = $this->pendaftaranTAService->validasi(
            $pendaftaran,
            $request->berkas,
            $request->status
        );

        return response()->json([
            'message' => 'Validasi berhasil disimpan',
            'data' => $result
        ]);
    }
}