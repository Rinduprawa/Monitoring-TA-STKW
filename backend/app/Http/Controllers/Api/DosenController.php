<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Services\Admin\DosenService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DosenController extends Controller
{
    protected DosenService $dosenService;

    public function __construct(DosenService $dosenService)
    {
        $this->dosenService = $dosenService;
    }

    public function index(Request $request)
    {
        $dosen = Dosen::with(['user', 'prodi', 'kaprodi'])
            ->when($request->search, function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%");
            })
            ->when($request->prodi_id, function ($query, $prodi) {
                $query->where('prodi_id', $prodi);
            })
            ->paginate($request->per_page ?? 15);

        $dosen->getCollection()->transform(function ($item) {
            $item->is_kaprodi = $item->kaprodi()->exists();
            return $item;
        });

        return response()->json($dosen);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nip' => 'required|string|unique:dosen,nip',
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $dosen = $this->dosenService->create($data);

        return response()->json([
            'message' => 'Dosen berhasil ditambahkan',
            'data' => $dosen
        ], 201);
    }

    public function show($id)
    {
        $dosen = Dosen::with(['user', 'prodi', 'kaprodi'])->findOrFail($id);
        $dosen->is_kaprodi = $dosen->kaprodi()->exists();

        return response()->json($dosen);
    }

    public function update(Request $request, $id)
    {
        $dosen = Dosen::findOrFail($id);

        $data = $request->validate([
            'nip' => ['required', 'string', Rule::unique('dosen', 'nip')->ignore($dosen->id)],
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($dosen->user_id)],
        ]);

        $updated = $this->dosenService->update($dosen, $data);

        return response()->json([
            'message' => 'Dosen berhasil diperbarui',
            'data' => $updated
        ]);
    }

    public function destroy($id)
    {
        $dosen = Dosen::findOrFail($id);

        $this->dosenService->deactivate($dosen);

        return response()->json([
            'message' => 'Dosen berhasil dinonaktifkan'
        ]);
    }

    public function activate($id)
    {
        $dosen = Dosen::findOrFail($id);

        $this->dosenService->activate($dosen);

        return response()->json([
            'message' => 'Dosen berhasil diaktifkan'
        ]);
    }

    public function resetPassword($id)
    {
        $dosen = Dosen::findOrFail($id);

        $this->dosenService->resetPassword($dosen);

        return response()->json([
            'message' => 'Password berhasil direset'
        ]);
    }
}