<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MahasiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prodis = Prodi::all();
        $dosens = Dosen::all();

        $mahasiswas = [
            ['nama' => 'Andi Saputra', 'nim' => '2021010001', 'jk' => 'L'],
            ['nama' => 'Bella Kusuma', 'nim' => '2021010002', 'jk' => 'P'],
            ['nama' => 'Candra Wijaya', 'nim' => '2021010003', 'jk' => 'L'],
            ['nama' => 'Dewi Lestari', 'nim' => '2021010004', 'jk' => 'P'],
            ['nama' => 'Eko Prasetyo', 'nim' => '2021010005', 'jk' => 'L'],
            ['nama' => 'Fitri Andini', 'nim' => '2021010006', 'jk' => 'P'],
            ['nama' => 'Gilang Ramadhan', 'nim' => '2021010007', 'jk' => 'L'],
            ['nama' => 'Hani Safitri', 'nim' => '2021010008', 'jk' => 'P'],
            ['nama' => 'Irfan Hakim', 'nim' => '2021010009', 'jk' => 'L'],
            ['nama' => 'Jasmine Putri', 'nim' => '2021010010', 'jk' => 'P'],
            ['nama' => 'Khairul Anwar', 'nim' => '2021010011', 'jk' => 'L'],
            ['nama' => 'Lina Marlina', 'nim' => '2021010012', 'jk' => 'P'],
            ['nama' => 'Muhamad Rizki', 'nim' => '2021010013', 'jk' => 'L'],
            ['nama' => 'Novi Rahmawati', 'nim' => '2021010014', 'jk' => 'P'],
            ['nama' => 'Oki Setiawan', 'nim' => '2021010015', 'jk' => 'L'],
            ['nama' => 'Putri Amelia', 'nim' => '2021010016', 'jk' => 'P'],
            ['nama' => 'Qori Nugroho', 'nim' => '2021010017', 'jk' => 'L'],
            ['nama' => 'Rina Agustina', 'nim' => '2021010018', 'jk' => 'P'],
            ['nama' => 'Surya Pratama', 'nim' => '2021010019', 'jk' => 'L'],
            ['nama' => 'Tari Wulandari', 'nim' => '2021010020', 'jk' => 'P'],
        ];

        $bentukTa = ['penelitian', 'penciptaan'];
        $tahapTa = ['pendaftaran', 'proposal', 'tes_tahap_1', 'uji_kelayakan_1', 'tes_tahap_2', 'uji_kelayakan_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'];

        foreach ($mahasiswas as $index => $mhsData) {
            $user = User::create([
                'name' => $mhsData['nama'],
                'email' => 'mhs' . ($index + 1) . '@ta.test',
                'password' => Hash::make('password'),
                'role' => 'mahasiswa',
                'is_active' => true,
            ]);

            $prodi = $prodis->random();
            $dospem1 = $dosens->random();
            $dospem2 = $dosens->where('id', '!=', $dospem1->id)->random();

            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $mhsData['nim'],
                'nama' => $mhsData['nama'],
                'jenis_kelamin' => $mhsData['jk'],
                'prodi_id' => $prodi->id,
                'bentuk_ta' => $bentukTa[array_rand($bentukTa)],
                'judul_ta' => 'Judul TA ' . $mhsData['nama'],
                'tahap_ta' => $tahapTa[array_rand($tahapTa)],
                'dospem_1_id' => $dospem1->id,
                'dospem_2_id' => rand(0, 1) ? $dospem2->id : null,
            ]);
        }
    }
}
