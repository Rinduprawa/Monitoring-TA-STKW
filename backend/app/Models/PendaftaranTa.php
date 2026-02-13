<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PendaftaranTa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pendaftaran_ta';

    protected $fillable = [
        'mahasiswa_id',
        'semester_id',
        'status_validasi',
        'catatan_kaprodi',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function berkasPendaftaran()
    {
        return $this->hasMany(BerkasPendaftaran::class);
    }

    // Scopes
    public function scopeAktif($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeMenungguValidasi($query)
    {
        return $query->where('status_validasi', 'menunggu');
    }
}
