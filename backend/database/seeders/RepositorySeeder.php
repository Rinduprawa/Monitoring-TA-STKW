<?php

namespace Database\Seeders;

use App\Models\Mahasiswa;
use App\Models\Repository;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class RepositorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::whereIn('tahap_ta', ['sidang_skripsi', 'sidang_komprehensif'])
            ->get();

        $jenisDokumen = ['naskah_skripsi', 'deskripsi_karya_seni', 'dokumentasi_pergelaran'];

        foreach ($mahasiswas as $mhs) {
            // Random 1-3 dokumen per mahasiswa
            $jumlahDokumen = rand(1, 3);
            $dokumenTerpilih = array_rand(array_flip($jenisDokumen), $jumlahDokumen);

            if (!is_array($dokumenTerpilih)) {
                $dokumenTerpilih = [$dokumenTerpilih];
            }

            foreach ($dokumenTerpilih as $jenis) {
                Repository::create([
                    'mahasiswa_id' => $mhs->id,
                    'jenis_dokumen' => $jenis,
                    'file_path' => 'repository/' . $mhs->nim . '/' . $jenis . '.pdf',
                    'tanggal_unggah' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }
}
