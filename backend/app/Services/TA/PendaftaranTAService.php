<?php

namespace App\Services\TA;

use App\Models\PendaftaranTa;
use App\Models\BerkasPendaftaran;
use App\Models\Mahasiswa;
use App\Models\Kaprodi;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class PendaftaranTAService
{
    public function getSemesterAktif(): Semester
    {
        $semester = Semester::where('is_active', true)->first();

        if (!$semester) {
            throw ValidationException::withMessages([
                'semester' => ['Tidak ada semester aktif']
            ]);
        }

        return $semester;
    }

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

    public function create(Mahasiswa $mahasiswa, array $files): PendaftaranTa
    {
        $semesterAktif = $this->getSemesterAktif();

        return DB::transaction(function () use ($mahasiswa, $semesterAktif, $files) {

            // Auto close pending beda semester
            $oldPending = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
                ->where('status_validasi', 'menunggu')
                ->first();

            if ($oldPending) {
                if ($oldPending->semester_id == $semesterAktif->id) {
                    throw ValidationException::withMessages([
                        'pendaftaran' => ['Masih ada pendaftaran menunggu di semester ini']
                    ]);
                }

                $oldPending->update([
                    'status_validasi' => 'tidak_valid',
                    'catatan_kaprodi' => 'Otomatis ditutup karena pergantian semester'
                ]);
            }

            // Cek sudah valid di semester aktif
            $existingValid = PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
                ->where('semester_id', $semesterAktif->id)
                ->where('status_validasi', 'valid')
                ->exists();

            if ($existingValid) {
                throw ValidationException::withMessages([
                    'pendaftaran' => ['Sudah memiliki pendaftaran valid di semester ini']
                ]);
            }

            $pendaftaran = PendaftaranTa::create([
                'mahasiswa_id' => $mahasiswa->id,
                'semester_id' => $semesterAktif->id,
                'status_validasi' => 'menunggu',
            ]);

            foreach ($files as $jenis => $file) {
                $filename = time() . '_' . $jenis . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('berkas_pendaftaran/' . $mahasiswa->nim, $filename, 'public');

                BerkasPendaftaran::create([
                    'pendaftaran_ta_id' => $pendaftaran->id,
                    'jenis_berkas' => $jenis,
                    'file_path' => $path,
                    'status' => 'menunggu_validasi',
                ]);
            }

            return $pendaftaran->load('berkasPendaftaran');
        });
    }

    public function update(Mahasiswa $mahasiswa, int $pendaftaranId, array $files): PendaftaranTa
    {
        $pendaftaran = PendaftaranTa::where('id', $pendaftaranId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$pendaftaran) {
            throw new ModelNotFoundException('Pendaftaran not found');
        }

        if ($pendaftaran->status_validasi !== 'menunggu') {
            throw ValidationException::withMessages([
                'pendaftaran' => ['Tidak dapat mengubah pendaftaran yang sudah divalidasi']
            ]);
        }

        return DB::transaction(function () use ($pendaftaran, $mahasiswa, $files) {

            foreach ($files as $jenis => $file) {

                $berkas = BerkasPendaftaran::where('pendaftaran_ta_id', $pendaftaran->id)
                    ->where('jenis_berkas', $jenis)
                    ->first();

                if ($berkas) {

                    // delete file lama
                    Storage::disk('public')->delete($berkas->file_path);

                    // upload file baru
                    $filename = time() . '_' . $jenis . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs(
                        'berkas_pendaftaran/' . $mahasiswa->nim,
                        $filename,
                        'public'
                    );

                    $berkas->update([
                        'file_path' => $path,
                        'status' => 'menunggu_validasi',
                        'catatan' => null,
                    ]);
                }
            }

            return $pendaftaran->load('berkasPendaftaran');
        });
    }

    public function delete(Mahasiswa $mahasiswa, int $pendaftaranId): void
    {
        $pendaftaran = PendaftaranTa::where('id', $pendaftaranId)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->with('berkasPendaftaran')
            ->first();

        if (!$pendaftaran) {
            throw new ModelNotFoundException('Pendaftaran not found');
        }

        if ($pendaftaran->status_validasi !== 'menunggu') {
            throw ValidationException::withMessages([
                'pendaftaran' => ['Tidak dapat menghapus pendaftaran yang sudah divalidasi']
            ]);
        }

        DB::transaction(function () use ($pendaftaran) {

            foreach ($pendaftaran->berkasPendaftaran as $berkas) {
                Storage::disk('public')->delete($berkas->file_path);
                $berkas->forceDelete();
            }

            $pendaftaran->forceDelete();
        });
    }

    public function validasi(PendaftaranTa $pendaftaran, array $berkasData, string $status): PendaftaranTa
    {
        return DB::transaction(function () use ($pendaftaran, $berkasData, $status) {

            foreach ($berkasData as $data) {
                $berkas = BerkasPendaftaran::where('id', $data['id'])
                    ->where('pendaftaran_ta_id', $pendaftaran->id)
                    ->first();

                if ($berkas) {
                    $berkas->update([
                        'status' => $data['is_valid'] ? 'valid' : 'tidak_valid',
                        'catatan' => $data['catatan'] ?? null,
                    ]);
                }
            }

            $pendaftaran->update([
                'status_validasi' => $status,
                'catatan_kaprodi' => $status === 'tidak_valid'
                    ? 'Terdapat berkas yang tidak valid, silakan periksa catatan pada setiap berkas.'
                    : null,
            ]);

            return $pendaftaran->load('berkasPendaftaran');
        });
    }

    public function listByMahasiswa(Mahasiswa $mahasiswa)
    {
        return PendaftaranTa::where('mahasiswa_id', $mahasiswa->id)
            ->with('berkasPendaftaran')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function listByKaprodi(Kaprodi $kaprodi)
    {
        return PendaftaranTa::with([
            'mahasiswa.user',
            'mahasiswa.prodi',
            'berkasPendaftaran',
            'semester'
        ])
            ->whereHas('mahasiswa', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findForMahasiswa(int $id, Mahasiswa $mahasiswa)
    {
        return PendaftaranTa::with('berkasPendaftaran')
            ->where('id', $id)
            ->where('mahasiswa_id', $mahasiswa->id)
            ->firstOrFail();
    }

    public function findForKaprodi(int $id, Kaprodi $kaprodi)
    {
        return PendaftaranTa::with([
            'mahasiswa.user',
            'mahasiswa.prodi',
            'berkasPendaftaran',
            'semester'
        ])
            ->whereHas('mahasiswa', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id);
            })
            ->findOrFail($id);
    }

    public function serveBerkas(int $berkasId, $user)
    {
        $berkas = BerkasPendaftaran::with('pendaftaranTa.mahasiswa')
            ->findOrFail($berkasId);

        if ($user->role === 'mahasiswa') {
            $mahasiswa = $this->getMahasiswaByUser($user->id);

            if ($berkas->pendaftaranTa->mahasiswa_id !== $mahasiswa->id) {
                abort(403);
            }
        }

        if ($user->role === 'kaprodi') {
            $kaprodi = $this->getKaprodiByUser($user->id);

            if ($berkas->pendaftaranTa->mahasiswa->prodi_id !== $kaprodi->prodi_id) {
                abort(403);
            }
        }

        $path = storage_path('app/public/' . $berkas->file_path);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}