<?php

namespace App\Services;

use App\Models\User;

class ProfileService
{
    public function loadUserWithRole(User $user): User
    {
        switch ($user->role) {
            case 'mahasiswa':
                $user->load([
                    'mahasiswa.prodi',
                    'mahasiswa.dosenPembimbing1',
                    'mahasiswa.dosenPembimbing2'
                ]);
                break;

            case 'dosen':
                $user->load('dosen.prodi');
                break;

            case 'kaprodi':
                $user->load([
                    'kaprodi.prodi',
                    'kaprodi.dosen'
                ]);
                break;

            case 'admin':
            default:
                break;
        }

        return $user;
    }
}