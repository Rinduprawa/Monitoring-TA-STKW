<?php

namespace App\Services\Admin;

use App\Models\Mahasiswa;
use Illuminate\Support\Facades\DB;

class MahasiswaService
{
    protected UserProvisionService $userProvisionService;

    public function __construct(UserProvisionService $userProvisionService)
    {
        $this->userProvisionService = $userProvisionService;
    }

    public function create(array $data): Mahasiswa
    {
        return DB::transaction(function () use ($data) {

            $user = $this->userProvisionService->createUser(
                $data['nama'],
                $data['email'],
                'mahasiswa',
                $data['password']
            );

            $mahasiswa = Mahasiswa::create([
                'nim' => $data['nim'],
                'nama' => $data['nama'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'prodi_id' => $data['prodi_id'],
                'user_id' => $user->id,
                'tahap_ta' => 'pendaftaran',
            ]);

            return $mahasiswa->load(['user', 'prodi']);
        });
    }

    public function update(Mahasiswa $mahasiswa, array $data): Mahasiswa
    {
        return DB::transaction(function () use ($mahasiswa, $data) {

            $mahasiswa->user->update([
                'name' => $data['nama'],
                'email' => $data['email'],
            ]);

            $mahasiswa->update([
                'nim' => $data['nim'],
                'nama' => $data['nama'],
                'jenis_kelamin' => $data['jenis_kelamin'],
                'prodi_id' => $data['prodi_id'],
            ]);

            return $mahasiswa->load(['user', 'prodi']);
        });
    }

    public function deactivate(Mahasiswa $mahasiswa): void
    {
        DB::transaction(function () use ($mahasiswa) {
            $this->userProvisionService->deactivate($mahasiswa->user);
        });
    }

    public function activate(Mahasiswa $mahasiswa): void
    {
        DB::transaction(function () use ($mahasiswa) {
            $this->userProvisionService->activate($mahasiswa->user);
        });
    }

    public function resetPassword(Mahasiswa $mahasiswa): void
    {
        $this->userProvisionService->resetPassword($mahasiswa->user);
    }
}