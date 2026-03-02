<?php

namespace App\Services\Admin;

use App\Models\Kaprodi;
use App\Models\Dosen;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class KaprodiService
{
    protected UserProvisionService $userProvisionService;

    public function __construct(UserProvisionService $userProvisionService)
    {
        $this->userProvisionService = $userProvisionService;
    }

    public function assign(Kaprodi $kaprodi, int $dosenId): Kaprodi
    {
        return DB::transaction(function () use ($kaprodi, $dosenId) {

            $dosen = Dosen::findOrFail($dosenId);

            $alreadyKaprodi = Kaprodi::where('dosen_id', $dosen->id)
                ->where('id', '!=', $kaprodi->id)
                ->exists();

            if ($alreadyKaprodi) {
                throw ValidationException::withMessages([
                    'dosen_id' => ['Dosen sudah menjadi Kaprodi di prodi lain']
                ]);
            }

            $kaprodi->update([
                'dosen_id' => $dosen->id,
            ]);

            if ($kaprodi->user) {
                $kaprodi->user->update([
                    'name' => $dosen->nama
                ]);
            }

            return $kaprodi->load(['prodi', 'dosen.user', 'user']);
        });
    }

    public function resetPassword(Kaprodi $kaprodi): void
    {
        if (!$kaprodi->user) {
            throw ValidationException::withMessages([
                'kaprodi' => ['Akun kaprodi tidak ditemukan']
            ]);
        }

        $this->userProvisionService->resetPassword($kaprodi->user);
    }
}