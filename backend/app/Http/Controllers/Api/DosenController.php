<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DosenController extends Controller
{
    // GET /api/admin/dosen
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
            ->paginate($request->per_page ?? 10);

        // Add is_kaprodi flag
        $dosen->getCollection()->transform(function ($item) {
            $item->is_kaprodi = $item->kaprodi()->exists();
            return $item;
        });

        return response()->json($dosen);
    }

    // POST /api/admin/dosen
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:dosen,nip',
            'nama' => 'required|string|max:255',
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
                'role' => 'dosen',
                'password_changed' => false,
                'is_active' => true,
            ]);

            // Create dosen
            $dosen = Dosen::create([
                'nip' => $validated['nip'],
                'nama' => $validated['nama'],
                'prodi_id' => $validated['prodi_id'],
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Dosen berhasil ditambahkan',
                'data' => $dosen->load(['user', 'prodi'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menambahkan dosen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // GET /api/admin/dosen/{id}
    public function show($id)
    {
        $dosen = Dosen::with(['user', 'prodi', 'kaprodi'])->findOrFail($id);
        $dosen->is_kaprodi = $dosen->kaprodi()->exists();
        return response()->json($dosen);
    }

    // PUT /api/admin/dosen/{id}
    public function update(Request $request, $id)
    {
        $dosen = Dosen::findOrFail($id);

        $validated = $request->validate([
            'nip' => ['required', 'string', Rule::unique('dosen', 'nip')->ignore($dosen->id)],
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodi,id',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($dosen->user_id)],
        ]);

        DB::beginTransaction();
        try {
            // Update user
            $dosen->user->update([
                'name' => $validated['nama'],
                'email' => $validated['email'],
            ]);

            // Update dosen
            $dosen->update([
                'nip' => $validated['nip'],
                'nama' => $validated['nama'],
                'prodi_id' => $validated['prodi_id'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Dosen berhasil diperbarui',
                'data' => $dosen->load(['user', 'prodi'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui dosen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/admin/dosen/{id}
    public function destroy($id)
    {
        $dosen = Dosen::findOrFail($id);

        // Check if dosen is kaprodi
        if ($dosen->kaprodi()->exists()) {
            return response()->json([
                'message' => 'Tidak dapat menghapus dosen yang menjabat sebagai Kaprodi'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Soft delete user
            $dosen->user->update([
                'is_active' => false,
                'deactivated_at' => now(),
            ]);
            $dosen->user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Dosen berhasil dinonaktifkan'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal menonaktifkan dosen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // POST /api/admin/dosen/{id}/reset-password
    public function resetPassword($id)
    {
        $dosen = Dosen::findOrFail($id);

        $dosen->user->update([
            'password' => Hash::make('password1234'),
            'password_changed' => false,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset menjadi password1234'
        ]);
    }
}