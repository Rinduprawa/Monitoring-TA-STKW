<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JadwalUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jadwal_ujian';

    protected $fillable = [
        'mahasiswa_id',
        'jenis_ujian',
        'tanggal',
        'jam_mulai',
        'jam_selesai',
        'status_jadwal',
        'status_kelulusan',
    ];

    protected $casts = [
        'tanggal' => 'date',
    ];

    // Relationships
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function pengujiUjian()
    {
        return $this->hasMany(PengujiUjian::class);
    }

    public function penguji()
    {
        return $this->belongsToMany(
            Dosen::class, 
            'penguji_ujian', 
            'jadwal_ujian_id', 
            'penugasan_dosen_id'
        )->withTimestamps();
    }

    public function penilaian()
    {
        return $this->hasMany(Penilaian::class);
    }

    // Scopes
    public function scopeDraft($query)
    {
        return $query->where('status_jadwal', 'draft');
    }

    public function scopeTerjadwal($query)
    {
        return $query->where('status_jadwal', 'terjadwal');
    }

    public function scopeSelesai($query)
    {
        return $query->where('status_jadwal', 'selesai');
    }

    public function scopeVisibleFor($query, $role)
    {
        if ($role !== 'kaprodi') {
            return $query->whereIn('status_jadwal', ['terjadwal', 'selesai']);
        }
        return $query;
    }
}
