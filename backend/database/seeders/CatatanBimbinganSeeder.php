<?php

namespace Database\Seeders;

use App\Models\CatatanBimbingan;
use App\Models\Mahasiswa;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class CatatanBimbinganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::whereNotNull('dospem_1_id')->get();

        $jenisUjian = ['proposal', 'tes_tahap_1', 'uji_kelayakan_1', 'tes_tahap_2', 'uji_kelayakan_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'];

        $status = ['revisi', 'layak_uji'];

        foreach ($mahasiswas as $mhs) {
            // 5-10 catatan bimbingan per mahasiswa
            $jumlahBimbingan = rand(5, 10);

            for ($i = 0; $i < $jumlahBimbingan; $i++) {
                CatatanBimbingan::create([
                    'mahasiswa_id' => $mhs->id,
                    'dosen_id' => rand(0, 1) && $mhs->dospem_2_id ? $mhs->dospem_2_id : $mhs->dospem_1_id,
                    'untuk_ujian' => $jenisUjian[array_rand($jenisUjian)],
                    'tanggal_bimbingan' => Carbon::now()->subDays(rand(1, 90)),
                    'judul_bimbingan' => 'Bimbingan ' . ($i + 1) . ' - ' . $mhs->nama,
                    'deskripsi' => 'Pembahasan progress TA terkait ' . ($i + 1) . '. Lorem ipsum dolor sit amet.',
                    'status' => $status[array_rand($status)],
                ]);
            }
        }
    }
}
