<?php

namespace Database\Seeders;

use App\Models\Mahasiswa;
use App\Models\PendaftaranTa;
use App\Models\PengajuanProposal;
use App\Models\Semester;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PengajuanProposalSeeder extends Seeder
{
    public function run(): void
    {
        $semesterAktif = Semester::where('is_active', true)->first();

        if (!$semesterAktif) {
            throw new \Exception('Tidak ada semester aktif.');
        }

        $status = ['diproses', 'ditolak', 'disetujui'];

        $mahasiswas = Mahasiswa::whereIn('tahap_ta', [
            'pendaftaran',
        ])->get();

        foreach ($mahasiswas as $mhs) {

            $pendaftaran = PendaftaranTa::where('mahasiswa_id', $mhs->id)
                ->where('semester_id', $semesterAktif->id)
                ->where('status_validasi', 'valid')
                ->first();

            if (!$pendaftaran) {
                continue;
            }

            PengajuanProposal::create([
                'mahasiswa_id' => $mhs->id,
                'pendaftaran_ta_id' => $pendaftaran->id,
                'judul_ta' => $mhs->judul_ta ?? 'Judul TA ' . $mhs->nama,
                'bentuk_ta' => $mhs->bentuk_ta ?? 'penelitian',
                'file_proposal' => 'proposal/' . $mhs->nim . '_proposal.pdf',
                'tanggal_pengajuan' => Carbon::now()->subDays(rand(10, 60)),
                'status' => $status[array_rand($status)],
                'catatan_kaprodi' => rand(0, 1)
                    ? 'Catatan kaprodi untuk proposal ' . $mhs->nama
                    : null,
            ]);
        }
    }
}
