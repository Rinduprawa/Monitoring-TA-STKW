<?php

namespace Database\Seeders;

use App\Models\Dosen;
use App\Models\Kaprodi;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class KaprodiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prodis = Prodi::all();

        // Ambil 4 dosen pertama untuk dijadikan kaprodi
        $dosens = Dosen::take(4)->get();

        foreach ($prodis as $index => $prodi) {
            $dosen = $dosens[$index];

            $user = User::create([
                'name' => 'Kaprodi ' . $prodi->nama_prodi,
                'email' => 'kaprodi' . ($index + 1) . '@ta.test',
                'password' => Hash::make('password'),
                'role' => 'kaprodi',
                'is_active' => true,
            ]);

            Kaprodi::create([
                'user_id' => $user->id,
                'dosen_id' => $dosen->id,
                'prodi_id' => $prodi->id,
            ]);
        }
    }
}
