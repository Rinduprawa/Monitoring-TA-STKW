<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kaprodi;
use App\Models\Dosen;
use App\Services\Admin\KaprodiService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KaprodiController extends Controller
{
    protected KaprodiService $kaprodiService;

    public function __construct(KaprodiService $kaprodiService)
    {
        $this->kaprodiService = $kaprodiService;
    }

    public function index()
    {
        $kaprodi = Kaprodi::with(['prodi', 'dosen.user', 'user'])->get();

        return response()->json($kaprodi);
    }

    public function show($id)
    {
        $kaprodi = Kaprodi::with(['prodi', 'dosen.user', 'user'])
            ->findOrFail($id);

        return response()->json($kaprodi);
    }

    public function update(Request $request, $id)
    {
        $kaprodi = Kaprodi::findOrFail($id);

        $data = $request->validate([
            'dosen_id' => [
                'required',
                'exists:dosen,id',
                Rule::unique('kaprodi', 'dosen_id')->ignore($kaprodi->id)
            ],
        ]);

        $updated = $this->kaprodiService->assign(
            $kaprodi,
            $data['dosen_id']
        );

        return response()->json([
            'message' => 'Kaprodi berhasil diperbarui',
            'data' => $updated
        ]);
    }

    public function resetPassword($id)
    {
        $kaprodi = Kaprodi::findOrFail($id);

        $this->kaprodiService->resetPassword($kaprodi);

        return response()->json([
            'message' => 'Password berhasil direset'
        ]);
    }

    public function getAvailableDosen($prodi_id)
    {
        $dosen = Dosen::where('prodi_id', $prodi_id)
            ->whereDoesntHave('kaprodi', function ($query) use ($prodi_id) {
                $query->where('prodi_id', '!=', $prodi_id);
            })
            ->with('user')
            ->get();

        return response()->json($dosen);
    }
}