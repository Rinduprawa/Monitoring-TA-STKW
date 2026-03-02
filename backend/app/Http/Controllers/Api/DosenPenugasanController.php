<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PenugasanDosenService;
use Illuminate\Http\Request;

class DosenPenugasanController extends Controller
{
    protected PenugasanDosenService $service;

    public function __construct(PenugasanDosenService $service)
    {
        $this->service = $service;
    }

    public function pembimbing()
    {
        return $this->service->getDosenPembimbing();
    }

    public function penguji()
    {
        return $this->service->getDosenPenguji();
    }

    public function previewSuratTugas(Request $request, $id)
    {
        return $this->service->preview($id, $request->user());
    }
}