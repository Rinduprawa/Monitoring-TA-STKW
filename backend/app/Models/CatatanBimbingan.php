<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CatatanBimbingan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'catatan_bimbingan';

    protected $fillable = [
        'mahasiswa_id',
        'dosen_id',
        'untuk_ujian',
        'tanggal_bimbingan',
        'judul_bimbingan',
        'deskripsi',
        'status',
    ];

    protected $casts = [
        'tanggal_bimbingan' => 'date',
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

    // Scopes
    public function scopeByMahasiswa($query, $mahasiswaId)
    {
        return $query->where('mahasiswa_id', $mahasiswaId);
    }

    public function scopeByDosen($query, $dosenId)
    {
        return $query->where('dosen_id', $dosenId);
    }

    public function scopeUntukUjian($query, $jenisUjian)
    {
        return $query->where('untuk_ujian', $jenisUjian);
    }

    public function scopeLayakUji($query)
    {
        return $query->where('status', 'layak_uji');
    }

    public function scopeRevisi($query)
    {
        return $query->where('status', 'revisi');
    }
}
