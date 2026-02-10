<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DosenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prodis = Prodi::all();

        $dosens = [
            ['nama' => 'Dr. Ahmad Santoso, S.Sn., M.Sn.', 'nip' => '198501012010011001'],
            ['nama' => 'Dr. Budi Wibowo, S.Sn., M.Ds.', 'nip' => '198602022010012002'],
            ['nama' => 'Citra Dewi, S.Sn., M.Sn.', 'nip' => '198703032011012001'],
            ['nama' => 'Dimas Prasetyo, S.Sn., M.Ds.', 'nip' => '198804042012011001'],
            ['nama' => 'Dr. Eka Putri, S.Sn., M.Sn.', 'nip' => '198905052013012001'],
            ['nama' => 'Fajar Ramadhan, S.Sn., M.Ds.', 'nip' => '199006062014011001'],
            ['nama' => 'Gita Saraswati, S.Sn., M.Sn.', 'nip' => '199107072015012001'],
            ['nama' => 'Hendra Wijaya, S.Sn., M.Ds.', 'nip' => '199208082016011001'],
            ['nama' => 'Indah Permata, S.Sn., M.Sn.', 'nip' => '199309092017012001'],
            ['nama' => 'Joko Susilo, S.Sn., M.Ds.', 'nip' => '199410102018011001'],
        ];

        foreach ($dosens as $index => $dosenData) {
            $user = User::create([
                'name' => $dosenData['nama'],
                'email' => 'dosen' . ($index + 1) . '@ta.test',
                'password' => Hash::make('1234567890'),
                'role' => 'dosen',
                'is_active' => true,
            ]);

            Dosen::create([
                'user_id' => $user->id,
                'nip' => $dosenData['nip'],
                'nama' => $dosenData['nama'],
                'prodi_id' => $prodis->random()->id,
            ]);
        }
    }
}
