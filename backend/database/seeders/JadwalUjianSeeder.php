<?php

namespace Database\Seeders;

use App\Models\JadwalUjian;
use App\Models\Mahasiswa;
use App\Models\PengujiUjian;
use App\Models\PenugasanDosen;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class JadwalUjianSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mahasiswas = Mahasiswa::whereIn('tahap_ta', ['proposal', 'tes_tahap_1', 'uji_kelayakan_1', 'tes_tahap_2', 'uji_kelayakan_2', 'pergelaran', 'sidang_skripsi', 'sidang_komprehensif'])
            ->get();

        $statusJadwal = ['draft', 'terjadwal', 'selesai'];
        $statusKelulusan = ['lulus', 'tidak_lulus'];

        foreach ($mahasiswas as $mhs) {
            $status = $statusJadwal[array_rand($statusJadwal)];

            $jadwal = JadwalUjian::create([
                'mahasiswa_id' => $mhs->id,
                'jenis_ujian' => $mhs->tahap_ta,
                'tanggal' => Carbon::now()->addDays(rand(7, 60)),
                'jam_mulai' => '09:00:00',
                'jam_selesai' => '11:00:00',
                'status_jadwal' => $status,
                'status_kelulusan' => $status === 'selesai' ? $statusKelulusan[array_rand($statusKelulusan)] : null,
            ]);

            // Assign penguji (jika bukan draft)
            if ($status !== 'draft') {
                $penugasanPenguji = PenugasanDosen::where('mahasiswa_id', $mhs->id)
                    ->where('jenis', 'penguji')
                    ->get();

                foreach ($penugasanPenguji as $penugasan) {
                    PengujiUjian::create([
                        'jadwal_ujian_id' => $jadwal->id,
                        'penugasan_dosen_id' => $penugasan->id,
                    ]);
                }
            }
        }
    }
}
