<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PengajuanProposalService;
use Illuminate\Http\Request;

class MahasiswaPengajuanProposalController extends Controller
{
    protected PengajuanProposalService $proposalService;

    public function __construct(PengajuanProposalService $proposalService)
    {
        $this->proposalService = $proposalService;
    }

    public function index(Request $request)
    {
        $mahasiswa = $this->proposalService->getMahasiswaByUser($request->user()->id);

        return response()->json([
            'data' => $this->proposalService->getByMahasiswa($mahasiswa)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'judul_ta' => 'required|string|max:500',
            'bentuk_ta' => 'required|in:penelitian,penciptaan',
            'file_proposal' => 'required|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $mahasiswa = $this->proposalService->getMahasiswaByUser($request->user()->id);

        $proposal = $this->proposalService->create(
            $mahasiswa,
            $request->only('judul_ta', 'bentuk_ta'),
            $request->file('file_proposal')
        );

        return response()->json([
            'message' => 'Pengajuan proposal berhasil dibuat',
            'data' => $proposal
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $mahasiswa = $this->proposalService->getMahasiswaByUser($request->user()->id);

        return response()->json([
            'data' => $this->proposalService->findOwned($mahasiswa, $id)
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'judul_ta' => 'required|string|max:500',
            'bentuk_ta' => 'required|in:penelitian,penciptaan',
            'file_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        $mahasiswa = $this->proposalService->getMahasiswaByUser($request->user()->id);

        $proposal = $this->proposalService->update(
            $mahasiswa,
            $id,
            $request->only('judul_ta', 'bentuk_ta'),
            $request->file('file_proposal')
        );

        return response()->json([
            'message' => 'Pengajuan proposal berhasil diperbarui',
            'data' => $proposal
        ]);
    }

    public function checkEligibility(Request $request)
    {
        $mahasiswa = $this->proposalService->getMahasiswaByUser($request->user()->id);

        return response()->json(
            $this->proposalService->checkEligibility($mahasiswa)
        );
    }

}
