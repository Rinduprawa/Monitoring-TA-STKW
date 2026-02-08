<?php

namespace Database\Seeders;

use App\Models\JadwalUjian;
use App\Models\Penilaian;
use App\Models\PengujiUjian;
use Illuminate\Database\Seeder;

class PenilaianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jadwalSelesai = JadwalUjian::where('status_jadwal', 'selesai')->get();

        foreach ($jadwalSelesai as $jadwal) {
            $pengujiUjian = PengujiUjian::where('jadwal_ujian_id', $jadwal->id)->get();

            foreach ($pengujiUjian as $penguji) {
                Penilaian::create([
                    'jadwal_ujian_id' => $jadwal->id,
                    'dosen_id' => $penguji->penugasanDosen->dosen_id,
                    'nilai' => rand(65, 95) + (rand(0, 99) / 100), // Random 65.00 - 95.99
                    'catatan' => rand(0, 1) ? 'Catatan revisi dari penguji. Perlu perbaikan pada beberapa bagian.' : null,
                ]);
            }
        }
    }
}
