<?php

namespace App\Services\TA;

use App\Models\Mahasiswa;
use App\Models\Kaprodi;
use App\Models\Semester;
use App\Models\PendaftaranTa;
use App\Models\PengajuanProposal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PengajuanProposalService
{
    public function getMahasiswaByUser(int $userId): Mahasiswa
    {
        $mahasiswa = Mahasiswa::where('user_id', $userId)->first();

        if (!$mahasiswa) {
            throw ValidationException::withMessages([
                'user' => ['Mahasiswa tidak ditemukan']
            ]);
        }

        return $mahasiswa;
    }

    public function getKaprodiByUser(int $userId): Kaprodi
    {
        $kaprodi = Kaprodi::where('user_id', $userId)->first();

        if (!$kaprodi) {
            throw ValidationException::withMessages([
                'user' => ['Kaprodi tidak ditemukan']
            ]);
        }

        return $kaprodi;
    }

    public function getByMahasiswa(Mahasiswa $mahasiswa)
    {
        return PengajuanProposal::where('mahasiswa_id', $mahasiswa->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getByProdi(Kaprodi $kaprodi)
    {
        return PengajuanProposal::with('mahasiswa.user')
            ->whereHas('mahasiswa', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id);
            })
            ->orderByDesc('created_at')
            ->get();
    }

    public function findOwned(Mahasiswa $mahasiswa, int $id): PengajuanProposal
    {
        $proposal = PengajuanProposal::where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$proposal) {
            throw new ModelNotFoundException('Pengajuan not found');
        }

        return $proposal;
    }

    public function findForKaprodi(Kaprodi $kaprodi, int $id): PengajuanProposal
    {
        $proposal = PengajuanProposal::with('mahasiswa.user')
            ->find($id);

        if (!$proposal) {
            throw new ModelNotFoundException('Pengajuan not found');
        }

        if ($proposal->mahasiswa->prodi_id !== $kaprodi->prodi_id) {
            throw ValidationException::withMessages([
                'authorization' => ['Tidak berhak mengakses proposal ini.']
            ]);
        }

        return $proposal;
    }

    public function create(Mahasiswa $mahasiswa, array $data, $file): PengajuanProposal
    {
        $semesterAktif = Semester::where('is_active', true)->first();

        if (!$semesterAktif) {
            throw ValidationException::withMessages([
                'semester' => ['Tidak ada semester aktif']
            ]);
        }

        $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->where('semester_id', $semesterAktif->id)
            ->where('status_validasi', 'valid')
            ->first();

        if (!$pendaftaran) {
            throw ValidationException::withMessages([
                'pendaftaran' => ['Silakan melakukan pendaftaran tugas akhir terlebih dahulu.']
            ]);
        }

        // RULE: satu pendaftaran valid = satu proposal
        $existing = PengajuanProposal::where('pendaftaran_ta_id', $pendaftaran->id)->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'proposal' => ['Proposal sudah pernah diajukan untuk pendaftaran ini.']
            ]);
        }

        return DB::transaction(function () use ($mahasiswa, $pendaftaran, $data, $file) {

            $filename = time() . '_proposal.' . $file->getClientOriginalExtension();
            $path = $file->storeAs(
                'proposal/' . $mahasiswa->nim,
                $filename,
                'public'
            );

            return PengajuanProposal::create([
                'mahasiswa_id' => $mahasiswa->id,
                'pendaftaran_ta_id' => $pendaftaran->id,
                'judul_ta' => $data['judul_ta'],
                'bentuk_ta' => $data['bentuk_ta'],
                'file_proposal' => $path,
                'tanggal_pengajuan' => now(),
                'status' => PengajuanProposal::STATUS_DIPROSES,
            ]);
        });
    }

    public function update(Mahasiswa $mahasiswa, int $id, array $data, $file = null): PengajuanProposal
    {
        $proposal = $this->findOwned($mahasiswa, $id);

        if ($proposal->status !== PengajuanProposal::STATUS_DIPROSES) {
            throw ValidationException::withMessages([
                'proposal' => ['Tidak dapat mengubah pengajuan yang sudah divalidasi']
            ]);
        }

        return DB::transaction(function () use ($proposal, $mahasiswa, $data, $file) {

            if ($file) {
                Storage::disk('public')->delete($proposal->file_proposal);

                $filename = time() . '_proposal.' . $file->getClientOriginalExtension();
                $path = $file->storeAs(
                    'proposal/' . $mahasiswa->nim,
                    $filename,
                    'public'
                );

                $proposal->file_proposal = $path;
            }

            $proposal->judul_ta = $data['judul_ta'];
            $proposal->bentuk_ta = $data['bentuk_ta'];
            $proposal->save();

            return $proposal;
        });
    }

    public function validateByKaprodi(Kaprodi $kaprodi, int $id, string $status, ?string $catatan): PengajuanProposal
    {
        $proposal = PengajuanProposal::with('mahasiswa')->find($id);

        if (!$proposal) {
            throw new ModelNotFoundException('Pengajuan not found');
        }

        // RULE: hanya prodi yang sama
        if ($proposal->mahasiswa->prodi_id !== $kaprodi->prodi_id) {
            throw ValidationException::withMessages([
                'authorization' => ['Tidak berhak memvalidasi proposal ini.']
            ]);
        }

        // RULE: tidak bisa validasi ulang
        if ($proposal->status !== PengajuanProposal::STATUS_DIPROSES) {
            throw ValidationException::withMessages([
                'proposal' => ['Proposal sudah divalidasi sebelumnya.']
            ]);
        }

        if (
            !in_array($status, [
                PengajuanProposal::STATUS_DISETUJUI,
                PengajuanProposal::STATUS_DITOLAK
            ])
        ) {
            throw ValidationException::withMessages([
                'status' => ['Status tidak valid.']
            ]);
        }

        $proposal->update([
            'status' => $status,
            'catatan_kaprodi' => $catatan,
        ]);

        return $proposal;
    }

    public function checkEligibility(Mahasiswa $mahasiswa): array
    {
        $semesterAktif = Semester::where('is_active', true)->first();

        if (!$semesterAktif) {
            return [
                'eligible' => false,
                'message' => 'Tidak ada semester aktif.'
            ];
        }

        $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->where('semester_id', $semesterAktif->id)
            ->where('status_validasi', 'valid')
            ->first();

        if (!$pendaftaran) {
            return [
                'eligible' => false,
                'message' => 'Silakan melakukan pendaftaran tugas akhir terlebih dahulu.'
            ];
        }

        $existing = PengajuanProposal::where('pendaftaran_ta_id', $pendaftaran->id)->exists();

        if ($existing) {
            return [
                'eligible' => false,
                'message' => 'Proposal sudah pernah diajukan.'
            ];
        }

        return ['eligible' => true];
    }

    public function preview(int $proposalId, $user)
    {
        $proposal = PengajuanProposal::with('mahasiswa')->findOrFail($proposalId);

        if (!$user) {
            throw ValidationException::withMessages([
                'auth' => ['Unauthenticated']
            ]);
        }

        // Mahasiswa
        if ($user->role === 'mahasiswa') {

            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

            if (!$mahasiswa || $proposal->mahasiswa_id !== $mahasiswa->id) {
                throw ValidationException::withMessages([
                    'authorization' => ['Tidak berhak mengakses proposal ini.']
                ]);
            }
        }

        // Kaprodi
        elseif ($user->role === 'kaprodi') {

            $kaprodi = Kaprodi::where('user_id', $user->id)->first();

            if (!$kaprodi || $proposal->mahasiswa->prodi_id !== $kaprodi->prodi_id) {
                throw ValidationException::withMessages([
                    'authorization' => ['Tidak berhak mengakses proposal ini.']
                ]);
            }
        } else {
            throw ValidationException::withMessages([
                'authorization' => ['Role tidak diizinkan.']
            ]);
        }

        $path = storage_path('app/public/' . $proposal->file_proposal);

        if (!file_exists($path)) {
            throw new ModelNotFoundException('File not found');
        }

        return response()->file($path);
    }
}