<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserProvisionService
{
    protected string $defaultPassword = 'password1234';

    public function createUser(
        string $name,
        string $email,
        string $role,
        ?string $password = null
    ): User {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password ?? $this->defaultPassword),
            'role' => $role,
            'password_changed' => false,
            'is_active' => true,
        ]);
    }

    public function resetPassword(User $user): void
    {
        $user->update([
            'password' => Hash::make($this->defaultPassword),
            'password_changed' => false,
        ]);
    }

    public function deactivate(User $user): void
    {
        $user->update([
            'is_active' => false,
            'deactivated_at' => now(),
        ]);
    }

    public function activate(User $user): void
    {
        $user->update([
            'is_active' => true,
            'deactivated_at' => null,
        ]);
    }
}