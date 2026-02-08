<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PenugasanDosen extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'penugasan_dosen';

    protected $fillable = [
        'mahasiswa_id',
        'dosen_id',
        'jenis',
        'file_surat_tugas',
    ];

    // Relationships
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }

    public function pengujiUjian()
    {
        return $this->hasMany(PengujiUjian::class);
    }

    // Scopes
    public function scopePembimbing($query)
    {
        return $query->whereIn('jenis', ['pembimbing_1', 'pembimbing_2']);
    }

    public function scopePenguji($query)
    {
        return $query->where('jenis', 'penguji');
    }

    public function scopeByDosen($query, $dosenId)
    {
        return $query->where('dosen_id', $dosenId);
    }

    public function scopeByMahasiswa($query, $mahasiswaId)
    {
        return $query->where('mahasiswa_id', $mahasiswaId);
    }
}
