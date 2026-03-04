<?php

namespace App\Services\TA;

use App\Models\PengajuanUjian;
use App\Models\PengajuanProposal;
use App\Models\Mahasiswa;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PengajuanUjianService
{
    public function list($kaprodi)
    {
        return PengajuanUjian::with('mahasiswa')
            ->whereHas('mahasiswa', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function detail($kaprodi, $id)
    {
        $pengajuan = PengajuanUjian::with('mahasiswa')
            ->whereHas('mahasiswa', function ($q) use ($kaprodi) {
                $q->where('prodi_id', $kaprodi->prodi_id);
            })
            ->findOrFail($id);

        // Ambil proposal yang disetujui
        $proposal = PengajuanProposal::where('mahasiswa_id', $pengajuan->mahasiswa_id)
            ->where('status', 'disetujui')
            ->latest()
            ->first();

        return [
            'pengajuan' => $pengajuan,
            'proposal' => $proposal
        ];
    }

    public function previewBukti($kaprodi, $id)
    {
        $pengajuan = PengajuanUjian::whereHas('mahasiswa', function ($q) use ($kaprodi) {
            $q->where('prodi_id', $kaprodi->prodi_id);
        })
            ->findOrFail($id);

        $path = storage_path('app/public/' . $pengajuan->file_bukti_kelayakan);

        if (!file_exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->file($path, [
            'Content-Disposition' => 'inline'
        ]);
    }

    public function validasi($kaprodi, $id, $status, $catatan)
    {
        $pengajuan = PengajuanUjian::whereHas('mahasiswa', function ($q) use ($kaprodi) {
            $q->where('prodi_id', $kaprodi->prodi_id);
        })
            ->findOrFail($id);

        if ($pengajuan->status !== 'disetujui_pembimbing') {
            throw ValidationException::withMessages([
                'status' => ['Pengajuan belum bisa divalidasi oleh kaprodi.']
            ]);
        }

        if ($status === 'ditolak_kaprodi' && empty($catatan)) {
            throw ValidationException::withMessages([
                'catatan_kaprodi' => ['Catatan wajib diisi jika menolak pengajuan.']
            ]);
        }

        $pengajuan->update([
            'status' => $status,
            'catatan_kaprodi' => $status === 'ditolak_kaprodi' ? $catatan : null
        ]);

        return $pengajuan;
    }
}