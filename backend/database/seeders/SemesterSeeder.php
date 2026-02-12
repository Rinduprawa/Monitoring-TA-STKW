<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $semesters = [
            [
                'nama' => '2025/2026 Genap',
                'kode' => '2025_2',
                'tanggal_mulai' => '2026-02-01',
                'tanggal_selesai' => '2026-07-31',
                'is_active' => false,
            ],
            [
                'nama' => '2026/2027 Ganjil',
                'kode' => '2026_1',
                'tanggal_mulai' => '2026-08-01',
                'tanggal_selesai' => '2027-01-31',
                'is_active' => true,
            ],
            [
                'nama' => '2026/2027 Genap',
                'kode' => '2026_2',
                'tanggal_mulai' => '2027-02-01',
                'tanggal_selesai' => '2027-07-31',
                'is_active' => false,
            ],
        ];

        foreach ($semesters as $semester) {
            Semester::create($semester);
        }
    }
}
