<?php

namespace App\Services\Admin;

use App\Models\Dosen;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DosenService
{
    protected UserProvisionService $userProvisionService;

    public function __construct(UserProvisionService $userProvisionService)
    {
        $this->userProvisionService = $userProvisionService;
    }

    public function create(array $data): Dosen
    {
        return DB::transaction(function () use ($data) {

            $user = $this->userProvisionService->createUser(
                $data['nama'],
                $data['email'],
                'dosen',
                $data['password']
            );

            $dosen = Dosen::create([
                'nip' => $data['nip'],
                'nama' => $data['nama'],
                'prodi_id' => $data['prodi_id'],
                'user_id' => $user->id,
            ]);

            return $dosen->load(['user', 'prodi']);
        });
    }

    public function update(Dosen $dosen, array $data): Dosen
    {
        return DB::transaction(function () use ($dosen, $data) {

            $dosen->user->update([
                'name' => $data['nama'],
                'email' => $data['email'],
            ]);

            $dosen->update([
                'nip' => $data['nip'],
                'nama' => $data['nama'],
                'prodi_id' => $data['prodi_id'],
            ]);

            return $dosen->load(['user', 'prodi']);
        });
    }

    public function deactivate(Dosen $dosen): void
    {
        if ($dosen->kaprodi()->exists()) {
            throw ValidationException::withMessages([
                'dosen' => ['Tidak dapat menghapus dosen yang menjabat sebagai Kaprodi']
            ]);
        }

        DB::transaction(function () use ($dosen) {
            $this->userProvisionService->deactivate($dosen->user);
        });
    }

    public function activate(Dosen $dosen): void
    {
        $this->userProvisionService->activate($dosen->user);
    }

    public function resetPassword(Dosen $dosen): void
    {
        $this->userProvisionService->resetPassword($dosen->user);
    }
}