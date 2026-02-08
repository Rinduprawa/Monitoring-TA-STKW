<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa';

    protected $fillable = [
        'user_id',
        'nim',
        'nama',
        'jenis_kelamin',
        'prodi_id',
        'bentuk_ta',
        'judul_ta',
        'tahap_ta',
        'dospem_1_id',
        'dospem_2_id',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class);
    }

    public function dosenPembimbing1()
    {
        return $this->belongsTo(Dosen::class, 'dospem_1_id');
    }

    public function dosenPembimbing2()
    {
        return $this->belongsTo(Dosen::class, 'dospem_2_id');
    }

    public function pendaftaranTa()
    {
        return $this->hasMany(PendaftaranTa::class);
    }

    public function pendaftaranTaAktif()
    {
        return $this->hasOne(PendaftaranTa::class)->where('is_active', true);
    }

    public function pengajuanProposal()
    {
        return $this->hasMany(PengajuanProposal::class);
    }

    public function jadwalUjian()
    {
        return $this->hasMany(JadwalUjian::class);
    }

    public function catatanBimbingan()
    {
        return $this->hasMany(CatatanBimbingan::class);
    }

    public function pengajuanUjian()
    {
        return $this->hasMany(PengajuanUjian::class);
    }

    public function repository()
    {
        return $this->hasMany(Repository::class);
    }

    public function penugasanDosen()
    {
        return $this->hasMany(PenugasanDosen::class);
    }

    // Scopes
    public function scopeByProdi($query, $prodiId)
    {
        return $query->where('prodi_id', $prodiId);
    }

    public function scopeByTahapTa($query, $tahap)
    {
        return $query->where('tahap_ta', $tahap);
    }
}
