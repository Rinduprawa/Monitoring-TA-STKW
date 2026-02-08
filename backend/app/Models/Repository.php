<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Repository extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'repository';

    protected $fillable = [
        'mahasiswa_id',
        'jenis_dokumen',
        'file_path',
        'tanggal_unggah',
    ];

    protected $casts = [
        'tanggal_unggah' => 'date',
    ];

    // Relationships
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    // Scopes
    public function scopeByMahasiswa($query, $mahasiswaId)
    {
        return $query->where('mahasiswa_id', $mahasiswaId);
    }

    public function scopeByJenisDokumen($query, $jenisDokumen)
    {
        return $query->where('jenis_dokumen', $jenisDokumen);
    }
}
