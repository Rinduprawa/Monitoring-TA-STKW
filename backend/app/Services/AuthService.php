<?php

namespace App\Services;

use App\Models\User;
use App\Services\ProfileService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    protected ProfileService $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function login(array $data): array
    {
        $identifier = $data['identifier'];
        $password = $data['password'];

        $user = $this->findUserByIdentifier($identifier);

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Login gagal. Periksa kembali ID dan PIN Anda.'],
            ]);
        }

        if (!$user->is_active) {
            abort(403, 'Akun anda tidak aktif. Silakan hubungi administrator.');
        }

        // Delete old tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        $user = $this->profileService->loadUserWithRole($user);

        return [
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function me(User $user): User
    {
        return $this->profileService->loadUserWithRole($user);
    }

    public function changePassword(User $user, array $data): void
    {
        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai'],
            ]);
        }

        if (Hash::check($data['new_password'], $user->password)) {
            throw ValidationException::withMessages([
                'new_password' => ['Password baru tidak boleh sama dengan password lama'],
            ]);
        }

        $user->update([
            'password' => Hash::make($data['new_password']),
            'password_changed' => true,
        ]);
    }

    private function findUserByIdentifier(string $identifier): ?User
    {
        return User::where('email', $identifier)
            ->orWhereHas('mahasiswa', function ($query) use ($identifier) {
                $query->where('nim', $identifier);
            })
            ->orWhereHas('dosen', function ($query) use ($identifier) {
                $query->where('nip', $identifier);
            })
            ->first();
    }
}