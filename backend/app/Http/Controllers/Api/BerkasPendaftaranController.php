<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TA\PendaftaranTAService;
use Illuminate\Http\Request;

class BerkasPendaftaranController extends Controller
{
    protected PendaftaranTAService $pendaftaranTAService;

    public function __construct(PendaftaranTAService $pendaftaranTAService)
    {
        $this->pendaftaranTAService = $pendaftaranTAService;
    }

    public function show(Request $request, $id)
    {
        return $this->pendaftaranTAService->serveBerkas($id, $request->user());
    }
}