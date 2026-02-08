<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\PenugasanDosen;
use Illuminate\Database\Seeder;

class PenugasanDosenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::all();

        foreach ($mahasiswas as $mhs) {
            // Penugasan pembimbing 1
            if ($mhs->dospem_1_id) {
                PenugasanDosen::create([
                    'mahasiswa_id' => $mhs->id,
                    'dosen_id' => $mhs->dospem_1_id,
                    'jenis' => 'pembimbing_1',
                    'file_surat_tugas' => 'surat_tugas/pembimbing_1_' . $mhs->nim . '.pdf',
                ]);
            }

            // Penugasan pembimbing 2
            if ($mhs->dospem_2_id) {
                PenugasanDosen::create([
                    'mahasiswa_id' => $mhs->id,
                    'dosen_id' => $mhs->dospem_2_id,
                    'jenis' => 'pembimbing_2',
                    'file_surat_tugas' => 'surat_tugas/pembimbing_2_' . $mhs->nim . '.pdf',
                ]);
            }

            // Penugasan penguji (2-3 penguji per mahasiswa)
            $dosens = Dosen::whereNotIn('id', [$mhs->dospem_1_id, $mhs->dospem_2_id])
                ->inRandomOrder()
                ->take(rand(2, 3))
                ->get();

            foreach ($dosens as $dosen) {
                PenugasanDosen::create([
                    'mahasiswa_id' => $mhs->id,
                    'dosen_id' => $dosen->id,
                    'jenis' => 'penguji',
                    'file_surat_tugas' => 'surat_tugas/penguji_' . $mhs->nim . '_' . $dosen->nip . '.pdf',
                ]);
            }
        }
    }
}
