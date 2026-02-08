<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BerkasPendaftaran extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'berkas_pendaftaran';

    protected $fillable = [
        'pendaftaran_ta_id',
        'jenis_berkas',
        'file_path',
        'status',
        'catatan',
    ];

    // Relationships
    public function pendaftaranTa()
    {
        return $this->belongsTo(PendaftaranTa::class);
    }

    // Scopes
    public function scopeByJenis($query, $jenis)
    {
        return $query->where('jenis_berkas', $jenis);
    }

    public function scopeMenungguValidasi($query)
    {
        return $query->where('status', 'menunggu_validasi');
    }

    public function scopeValid($query)
    {
        return $query->where('status', 'valid');
    }
}
