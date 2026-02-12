<?php

namespace Database\Seeders;

use App\Models\BerkasPendaftaran;
use App\Models\Mahasiswa;
use App\Models\PendaftaranTa;
use Illuminate\Database\Seeder;

class PendaftaranTaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::all();

        $jenisBerkas = [
            'surat_permohonan',
            'bukti_uang_gedung',
            'kuitansi_spp',
            'kuitansi_biaya_ta',
            'khs',
            'krs',
            'transkrip',
            'proyeksi_ta',
        ];

        $statusValidasi = ['menunggu', 'valid', 'tidak_valid'];
        $statusBerkas = ['menunggu_validasi', 'valid', 'tidak_valid'];

        foreach ($mahasiswas->take(15) as $mhs) {
            $pendaftaran = PendaftaranTa::create([
                'mahasiswa_id' => $mhs->id,
                'semester_id' => 2,
                'status_validasi' => $statusValidasi[array_rand($statusValidasi)],
                'catatan_kaprodi' => rand(0, 1) ? 'Catatan validasi untuk ' . $mhs->nama : null,
            ]);

            // Create berkas untuk setiap jenis
            foreach ($jenisBerkas as $jenis) {
                BerkasPendaftaran::create([
                    'pendaftaran_ta_id' => $pendaftaran->id,
                    'jenis_berkas' => $jenis,
                    'file_path' => 'berkas/' . $mhs->nim . '/' . $jenis . '.pdf',
                    'status' => $statusBerkas[array_rand($statusBerkas)],
                    'catatan' => rand(0, 1) ? 'Catatan untuk ' . $jenis : null,
                ]);
            }
        }
    }
}
