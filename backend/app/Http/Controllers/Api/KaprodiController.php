<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kaprodi;
use App\Models\Dosen;
use App\Models\User;
use App\Models\Prodi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class KaprodiController extends Controller
{
    // GET /api/admin/kaprodi
    public function index()
    {
        $kaprodi = Kaprodi::with(['prodi', 'dosen.user', 'user'])->get();

        return response()->json($kaprodi);
    }

    // GET /api/admin/kaprodi/{id}
    public function show($id)
    {
        $kaprodi = Kaprodi::with(['prodi', 'dosen.user', 'user'])->findOrFail($id);
        return response()->json($kaprodi);
    }

    // PUT /api/admin/kaprodi/{id}
    public function update(Request $request, $id)
    {
        $kaprodi = Kaprodi::findOrFail($id);

        $validated = $request->validate([
            'dosen_id' => [
                'required',
                'exists:dosen,id',
                // Validasi: dosen belum jadi kaprodi di prodi lain
                Rule::unique('kaprodi', 'dosen_id')->ignore($kaprodi->id)
            ],
        ]);

        $dosen = Dosen::findOrFail($validated['dosen_id']);
        $prodi = $kaprodi->prodi;

        DB::beginTransaction();
        try {
            // Create kaprodi user if not exists
            if (!$kaprodi->user_id) {
                $email = 'kaprodi.' . Str::slug($prodi->nama_prodi) . '@stikw.ac.id';

                $user = User::create([
                    'name' => $dosen->nama,
                    'email' => $email,
                    'password' => Hash::make('password1234'),
                    'role' => 'kaprodi',
                    'password_changed' => false,
                    'is_active' => true,
                ]);

                $kaprodi->user_id = $user->id;
            } else {
                // Update existing user name
                $kaprodi->user->update([
                    'name' => $dosen->nama,
                ]);
            }

            // Update dosen assignment
            $kaprodi->dosen_id = $dosen->id;
            $kaprodi->save();

            DB::commit();

            return response()->json([
                'message' => 'Kaprodi berhasil diperbarui',
                'data' => $kaprodi->load(['prodi', 'dosen.user', 'user'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Gagal memperbarui kaprodi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // POST /api/admin/kaprodi/{id}/reset-password
    public function resetPassword($id)
    {
        $kaprodi = Kaprodi::findOrFail($id);

        if (!$kaprodi->user_id) {
            return response()->json([
                'message' => 'Kaprodi belum memiliki akun'
            ], 422);
        }

        $kaprodi->user->update([
            'password' => Hash::make('password1234'),
            'password_changed' => false,
        ]);

        return response()->json([
            'message' => 'Password berhasil direset menjadi password1234'
        ]);
    }

    // GET /api/admin/kaprodi/dosen-available/{prodi_id}
    public function getAvailableDosen($prodi_id)
    {
        // Get dosen by prodi yang belum jadi kaprodi
        $dosen = Dosen::where('prodi_id', $prodi_id)
            ->whereDoesntHave('kaprodi', function ($query) use ($prodi_id) {
                // Exclude dosen yang jadi kaprodi di prodi lain
                $query->where('prodi_id', '!=', $prodi_id);
            })
            ->with('user')
            ->get();

        return response()->json($dosen);
    }
}