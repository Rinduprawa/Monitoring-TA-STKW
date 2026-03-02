<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PengajuanProposalService;
use Illuminate\Http\Request;

class KaprodiPengajuanProposalController extends Controller
{
    protected PengajuanProposalService $proposalService;

    public function __construct(PengajuanProposalService $proposalService)
    {
        $this->proposalService = $proposalService;
    }

    public function index(Request $request)
    {
        $kaprodi = $this->proposalService->getKaprodiByUser($request->user()->id);

        return response()->json([
            'data' => $this->proposalService->getByProdi($kaprodi)
        ]);
    }

    public function show(Request $request, $id)
    {
        $kaprodi = $this->proposalService->getKaprodiByUser($request->user()->id);

        return response()->json([
            'data' => $this->proposalService->findForKaprodi($kaprodi, $id)
        ]);
    }

    public function validasi(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:disetujui,ditolak',
            'catatan_kaprodi' => 'nullable|string',
        ]);

        $kaprodi = $this->proposalService->getKaprodiByUser($request->user()->id);

        $proposal = $this->proposalService->validateByKaprodi(
            $kaprodi,
            $id,
            $request->status,
            $request->catatan_kaprodi
        );

        return response()->json([
            'message' => 'Validasi berhasil disimpan',
            'data' => $proposal
        ]);
    }
}
