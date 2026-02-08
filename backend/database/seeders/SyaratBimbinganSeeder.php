<?php

namespace Database\Seeders;

use App\Models\SyaratBimbingan;
use Illuminate\Database\Seeder;

class SyaratBimbinganSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $syarats = [
            ['jenis_ujian' => 'proposal', 'minimal_bimbingan' => 3],
            ['jenis_ujian' => 'tes_tahap_1', 'minimal_bimbingan' => 5],
            ['jenis_ujian' => 'uji_kelayakan_1', 'minimal_bimbingan' => 5],
            ['jenis_ujian' => 'tes_tahap_2', 'minimal_bimbingan' => 5],
            ['jenis_ujian' => 'uji_kelayakan_2', 'minimal_bimbingan' => 5],
            ['jenis_ujian' => 'pergelaran', 'minimal_bimbingan' => 4],
            ['jenis_ujian' => 'sidang_skripsi', 'minimal_bimbingan' => 3],
            ['jenis_ujian' => 'sidang_komprehensif', 'minimal_bimbingan' => 3],
        ];

        foreach ($syarats as $syarat) {
            SyaratBimbingan::create($syarat);
        }
    }
}
