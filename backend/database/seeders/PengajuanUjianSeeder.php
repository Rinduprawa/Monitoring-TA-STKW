<?php

namespace Database\Seeders;

use App\Models\Mahasiswa;
use App\Models\PengajuanUjian;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PengajuanUjianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::whereIn('tahap_ta', ['tes_tahap_1', 'uji_kelayakan_1', 'tes_tahap_2', 'uji_kelayakan_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])
            ->get();

        $status = [
            'diproses_pembimbing',
            'ditolak_pembimbing',
            'disetujui_pembimbing',
            'ditolak_kaprodi',
            'disetujui_kaprodi',
        ];

        foreach ($mahasiswas as $mhs) {
            PengajuanUjian::create([
                'mahasiswa_id' => $mhs->id,
                'jenis_ujian' => $mhs->tahap_ta,
                'tanggal_pengajuan' => Carbon::now()->subDays(rand(5, 30)),
                'file_bukti_kelayakan' => 'bukti_kelayakan/' . $mhs->nim . '_bukti.pdf',
                'status' => $status[array_rand($status)],
                'catatan_pembimbing' => rand(0, 1) ? 'Catatan pembimbing untuk ' . $mhs->nama : null,
                'catatan_kaprodi' => rand(0, 1) ? 'Catatan kaprodi untuk ' . $mhs->nama : null,
            ]);
        }
    }
}
