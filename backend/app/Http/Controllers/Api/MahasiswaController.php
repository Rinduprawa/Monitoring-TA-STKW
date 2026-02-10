<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MahasiswaController extends Controller
{
    // GET /api/admin/mahasiswa
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
            ->paginate($request->per_page ?? 10);

        return response()->json($mahasiswa);
    }

    // POST /api/admin/mahasiswa
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nim' => 'required|string|unique:mahasiswa,nim',
            'nama' => 'required|string|max:255',
            'jk' => 'required|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'name' => $validated['nama'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'mahasiswa',
                'password_changed' => false,
                'is_active' => true,
            ]);

            // Create mahasiswa
            $mahasiswa = Mahasiswa::create([
                'nim' => $validated['nim'],
                'nama' => $validated['nama'],
                'jk' => $validated['jk'],
                'prodi_id' => $validated['prodi_id'],
                'user_id' => $user->id,
                'tahap_ta' => 'pendaftaran', // default
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Mahasiswa berhasil ditambahkan',
                'data' => $mahasiswa->load(['user', 'prodi'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan mahasiswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/admin/mahasiswa/{id}
    public function show($id)
    {
        $mahasiswa = Mahasiswa::with(['user', 'prodi'])->findOrFail($id);
        return response()->json($mahasiswa);
    }

    // PUT /api/admin/mahasiswa/{id}
    public function update(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $validated = $request->validate([
            'nim' => ['required', 'string', Rule::unique('mahasiswa', 'nim')->ignore($mahasiswa->id)],
            'nama' => 'required|string|max:255',
            'jk' => 'required|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($mahasiswa->user_id)],
        ]);

        DB::beginTransaction();
        try {
            // Update user
            $mahasiswa->user->update([
                'name' => $validated['nama'],
                'email' => $validated['email'],
            ]);

            // Update mahasiswa
            $mahasiswa->update([
                'nim' => $validated['nim'],
                'nama' => $validated['nama'],
                'jk' => $validated['jk'],
                'prodi_id' => $validated['prodi_id'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Mahasiswa berhasil diperbarui',
                'data' => $mahasiswa->load(['user', 'prodi'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui mahasiswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/admin/mahasiswa/{id}
    public function destroy($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        DB::beginTransaction();
        try {
            $mahasiswa->user->update([
                'is_active' => false,
                'deactivated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Mahasiswa berhasil dinonaktifkan'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menonaktifkan mahasiswa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // POST /api/admin/mahasiswa/{id}/reset-password
    public function resetPassword($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $mahasiswa->user->update([
            'password' => Hash::make('password1234'),
            'password_changed' => false,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset menjadi password1234'
        ]);
    }
}