<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PendaftaranTAService;
use Illuminate\Http\Request;

class MahasiswaPendaftaranTAController extends Controller
{
    protected PendaftaranTAService $pendaftaranTAService;

    public function __construct(PendaftaranTAService $pendaftaranTAService)
    {
        $this->pendaftaranTAService = $pendaftaranTAService;
    }

    public function index(Request $request)
    {
        $mahasiswa = $this->pendaftaranTAService->getMahasiswaByUser($request->user()->id);

        return response()->json([
            'data' => $this->pendaftaranTAService->listByMahasiswa($mahasiswa)
        ]);
    }

    public function show(Request $request, $id)
    {
        $mahasiswa = $this->pendaftaranTAService->getMahasiswaByUser($request->user()->id);

        $pendaftaran = $this->pendaftaranTAService->findForMahasiswa($id, $mahasiswa);

        return response()->json($pendaftaran);
    }

    public function store(Request $request)
    {
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

        $mahasiswa = $this->pendaftaranTAService->getMahasiswaByUser($request->user()->id);

        $pendaftaran = $this->pendaftaranTAService->create($mahasiswa, $request->allFiles());

        return response()->json([
            'message' => 'Pendaftaran TA berhasil dibuat',
            'data' => $pendaftaran
        ], 201);
    }

    public function update(Request $request, $id)
    {
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

        $mahasiswa = $this->pendaftaranTAService
            ->getMahasiswaByUser($request->user()->id);

        $pendaftaran = $this->pendaftaranTAService
            ->update($mahasiswa, $id, $request->allFiles());

        return response()->json([
            'message' => 'Pendaftaran TA berhasil diperbarui',
            'data' => $pendaftaran
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $mahasiswa = $this->pendaftaranTAService
            ->getMahasiswaByUser($request->user()->id);

        $this->pendaftaranTAService
            ->delete($mahasiswa, $id);

        return response()->json([
            'message' => 'Pendaftaran TA berhasil dihapus'
        ]);
    }
}