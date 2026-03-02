<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PenugasanDosenService;
use Illuminate\Http\Request;

class KaprodiPenugasanDosenController extends Controller
{
    protected PenugasanDosenService $service;

    public function __construct(PenugasanDosenService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        return $this->service->getKaprodiIndex(
            $request->query('kategori', 'pembimbing')
        );
    }

    public function store(Request $request)
    {
        return $this->service->create($request);
    }

    public function show($id)
    {
        return $this->service->showPenugasan($id);
    }

    public function previewSuratTugas(Request $request, $id)
    {
        return $this->service->preview($id, $request->user());
    }

    public function update(Request $request, $id)
    {
        return $this->service->update($request, $id);
    }

    public function destroy($id)
    {
        return $this->service->delete($id);
    }

    public function getAvailableMahasiswa(Request $request)
    {
        return $this->service->getAvailableMahasiswa(
            $request->query('jenis_ujian')
        );
    }

    public function getAvailableDosen(Request $request)
    {
        return $this->service->getAvailableDosen();
    }

    public function getByMahasiswaUjian(Request $request)
    {
        return $this->service->getByMahasiswaUjian(
            $request->query('mahasiswa_id'),
            $request->query('jenis_ujian')
        );
    }
}