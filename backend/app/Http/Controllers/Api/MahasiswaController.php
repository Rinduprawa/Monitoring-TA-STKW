<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Services\Admin\MahasiswaService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MahasiswaController extends Controller
{
    protected MahasiswaService $mahasiswaService;

    public function __construct(MahasiswaService $mahasiswaService)
    {
        $this->mahasiswaService = $mahasiswaService;
    }

    public function index(Request $request)
    {
        $mahasiswa = Mahasiswa::with(['user', 'prodi'])
            ->when($request->search, function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            })
            ->when($request->prodi_id, function ($query, $prodi) {
                $query->where('prodi_id', $prodi);
            })
            ->paginate($request->per_page ?? 22);

        return response()->json($mahasiswa);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nim' => 'required|string|unique:mahasiswa,nim',
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $mahasiswa = $this->mahasiswaService->create($data);

        return response()->json([
            'message' => 'Mahasiswa berhasil ditambahkan',
            'data' => $mahasiswa
        ], 201);
    }

    public function show($id)
    {
        $mahasiswa = Mahasiswa::with(['user', 'prodi'])->findOrFail($id);
        return response()->json($mahasiswa);
    }

    public function update(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $data = $request->validate([
            'nim' => ['required', 'string', Rule::unique('mahasiswa', 'nim')->ignore($mahasiswa->id)],
            'nama' => 'required|string|max:255',
            'jenis_kelamin' => 'required|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($mahasiswa->user_id)],
        ]);

        $updated = $this->mahasiswaService->update($mahasiswa, $data);

        return response()->json([
            'message' => 'Mahasiswa berhasil diperbarui',
            'data' => $updated
        ]);
    }

    public function destroy($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $this->mahasiswaService->deactivate($mahasiswa);

        return response()->json([
            'message' => 'Mahasiswa berhasil dinonaktifkan'
        ]);
    }

    public function activate($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $this->mahasiswaService->activate($mahasiswa);

        return response()->json([
            'message' => 'Mahasiswa berhasil diaktifkan'
        ]);
    }

    public function resetPassword($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $this->mahasiswaService->resetPassword($mahasiswa);

        return response()->json([
            'message' => 'Password berhasil direset'
        ]);
    }
}