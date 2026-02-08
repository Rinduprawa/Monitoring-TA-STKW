<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
                // Config data (wajib)
            ProdiSeeder::class,
            SyaratBimbinganSeeder::class,
            ThresholdNilaiSeeder::class,

                // Master data
            AdminSeeder::class,
            DosenSeeder::class,
            KaprodiSeeder::class,
            MahasiswaSeeder::class,

                // Transactional data
            PenugasanDosenSeeder::class,
            PendaftaranTaSeeder::class,
            PengajuanProposalSeeder::class,
            CatatanBimbinganSeeder::class,
            JadwalUjianSeeder::class,
            PengajuanUjianSeeder::class,
            PenilaianSeeder::class,
            RepositorySeeder::class,
        ]);
    }
}
