<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user dan return token
     * Support login dengan email/nim/nip
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // Validasi input
        $request->validate([
            'identifier' => 'required|string', // bisa email/nim/nip
            'password' => 'required',
        ]);

        $identifier = $request->identifier;

        // Cari user berdasarkan email, nim, atau nip
        $user = User::where('email', $identifier)
            ->orWhereHas('mahasiswa', function ($query) use ($identifier) {
                $query->where('nim', $identifier);
            })
            ->orWhereHas('dosen', function ($query) use ($identifier) {
                $query->where('nip', $identifier);
            })
            ->first();

        // Check user exist dan password benar
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check apakah user aktif
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is inactive. Please contact administrator.',
            ], 403);
        }

        // Hapus token lama (opsional, biar ga numpuk)
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('auth_token')->plainTextToken;

        // Load relasi sesuai role
        $userData = $this->getUserWithRole($user);

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $userData,
        ], 200);
    }

    /**
     * Logout user (hapus token)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Hapus token yang dipakai sekarang
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful',
        ], 200);
    }

    /**
     * Get authenticated user info
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $userData = $this->getUserWithRole($user);

        return response()->json([
            'user' => $userData,
        ], 200);
    }

    /**
     * Helper: Load user data dengan relasi sesuai role
     * 
     * @param User $user
     * @return User
     */
    private function getUserWithRole(User $user)
    {
        switch ($user->role) {
            case 'mahasiswa':
                return $user->load([
                    'mahasiswa.prodi',
                    'mahasiswa.dosenPembimbing1',
                    'mahasiswa.dosenPembimbing2'
                ]);

            case 'dosen':
                return $user->load([
                    'dosen.prodi'
                ]);

            case 'kaprodi':
                return $user->load([
                    'kaprodi.prodi',
                    'kaprodi.dosen'
                ]);

            case 'admin':
            default:
                return $user;
        }
    }
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Password lama tidak sesuai',
                'errors' => [
                    'current_password' => ['Password lama tidak sesuai']
                ]
            ], 422);
        }

        // Check if new password same as old password
        if (Hash::check($request->new_password, $user->password)) {
            return response()->json([
                'message' => 'Password baru tidak boleh sama dengan password lama',
                'errors' => [
                    'new_password' => ['Password baru tidak boleh sama dengan password lama']
                ]
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
            'password_changed' => true,
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah'
        ]);
    }
}