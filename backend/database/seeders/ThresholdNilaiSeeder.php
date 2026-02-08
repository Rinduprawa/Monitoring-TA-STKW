<?php

namespace Database\Seeders;

use App\Models\ThresholdNilai;
use Illuminate\Database\Seeder;

class ThresholdNilaiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $thresholds = [
            ['jenis_ujian' => 'proposal', 'nilai_minimal' => 65.00],
            ['jenis_ujian' => 'tes_tahap_1', 'nilai_minimal' => 70.00],
            ['jenis_ujian' => 'uji_kelayakan_1', 'nilai_minimal' => 70.00],
            ['jenis_ujian' => 'tes_tahap_2', 'nilai_minimal' => 70.00],
            ['jenis_ujian' => 'uji_kelayakan_2', 'nilai_minimal' => 70.00],
            ['jenis_ujian' => 'pergelaran', 'nilai_minimal' => 75.00],
            ['jenis_ujian' => 'sidang_skripsi', 'nilai_minimal' => 75.00],
            ['jenis_ujian' => 'sidang_komprehensif', 'nilai_minimal' => 75.00],
        ];

        foreach ($thresholds as $threshold) {
            ThresholdNilai::create($threshold);
        }
    }
}
