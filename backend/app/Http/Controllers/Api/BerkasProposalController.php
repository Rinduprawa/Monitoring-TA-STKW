<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PengajuanProposalService;
use Illuminate\Http\Request;

class BerkasProposalController extends Controller
{
    protected PengajuanProposalService $pengajuanProposalService;

    public function __construct(PengajuanProposalService $pengajuanProposalService)
    {
        $this->pengajuanProposalService = $pengajuanProposalService;
    }

    public function show(Request $request, $id)
    {
        return $this->pengajuanProposalService->preview($id, $request->user());
    }
}