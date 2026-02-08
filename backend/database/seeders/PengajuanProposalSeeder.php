<?php

namespace Database\Seeders;

use App\Models\Mahasiswa;
use App\Models\PengajuanProposal;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PengajuanProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::whereIn('tahap_ta', ['pendaftaran', 'proposal', 'uji_tahap_1', 'uji_tahap_2', 'pergelaran', 'sidang'])
            ->get();

        $status = ['diproses', 'ditolak', 'disetujui'];

        foreach ($mahasiswas as $mhs) {
            PengajuanProposal::create([
                'mahasiswa_id' => $mhs->id,
                'judul_ta' => $mhs->judul_ta,
                'bentuk_ta' => $mhs->bentuk_ta,
                'file_proposal' => 'proposal/' . $mhs->nim . '_proposal.pdf',
                'tanggal_pengajuan' => Carbon::now()->subDays(rand(10, 60)),
                'status' => $status[array_rand($status)],
                'catatan_kaprodi' => rand(0, 1) ? 'Catatan kaprodi untuk proposal ' . $mhs->nama : null,
            ]);
        }
    }
}
