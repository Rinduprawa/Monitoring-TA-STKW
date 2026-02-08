<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    use HasFactory;

    protected $table = 'dosen';

    protected $fillable = [
        'user_id',
        'nip',
        'nama',
        'prodi_id',
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

    public function kaprodi()
    {
        return $this->hasOne(Kaprodi::class);
    }

    public function mahasiswaBimbingan1()
    {
        return $this->hasMany(Mahasiswa::class, 'dospem_1_id');
    }

    public function mahasiswaBimbingan2()
    {
        return $this->hasMany(Mahasiswa::class, 'dospem_2_id');
    }

    public function catatanBimbingan()
    {
        return $this->hasMany(CatatanBimbingan::class);
    }

    public function penugasanDosen()
    {
        return $this->hasMany(PenugasanDosen::class);
    }

    public function penilaian()
    {
        return $this->hasMany(Penilaian::class);
    }

    // Scopes
    public function scopeByProdi($query, $prodiId)
    {
        return $query->where('prodi_id', $prodiId);
    }
}
