<?php

namespace Database\Seeders;

use App\Models\Prodi;
use Illuminate\Database\Seeder;

class ProdiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prodis = [
            ['nama_prodi' => 'Seni Karawitan'],
            ['nama_prodi' => 'Seni Rupa Murni'],
            ['nama_prodi' => 'Seni Teater'],
            ['nama_prodi' => 'Seni Tari'],
        ];

        foreach ($prodis as $prodi) {
            Prodi::create($prodi);
        }
    }
}
