<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kaprodi;
use Illuminate\Http\Request;
use App\Services\TA\PengajuanUjianService;

class KaprodiPengajuanUjianController extends Controller
{
    protected $service;

    public function __construct(PengajuanUjianService $service)
    {
        $this->service = $service;
    }

    private function getKaprodi($request)
    {
        return Kaprodi::where('user_id', $request->user()->id)->firstOrFail();
    }

    public function index(Request $request)
    {
        $kaprodi = $this->getKaprodi($request);

        $data = $this->service->list($kaprodi);

        return response()->json(['data' => $data]);
    }

    public function show(Request $request, $id)
    {
        $kaprodi = $this->getKaprodi($request);

        $data = $this->service->detail($kaprodi, $id);

        return response()->json(['data' => $data]);
    }

    public function previewBukti(Request $request, $id)
    {
        $kaprodi = $this->getKaprodi($request);

        return $this->service->previewBukti($kaprodi, $id);
    }

    public function validasi(Request $request, $id)
    {
        $kaprodi = $this->getKaprodi($request);

        $request->validate([
            'status' => 'required|in:disetujui_kaprodi,ditolak_kaprodi',
            'catatan_kaprodi' => 'nullable|string'
        ]);

        $data = $this->service->validasi(
            $kaprodi,
            $id,
            $request->status,
            $request->catatan_kaprodi
        );

        return response()->json([
            'message' => 'Validasi berhasil',
            'data' => $data
        ]);
    }
}