<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengajuanProposal extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pengajuan_proposal';

    protected $fillable = [
        'mahasiswa_id',
        'pendaftaran_ta_id',
        'judul_ta',
        'bentuk_ta',
        'file_proposal',
        'tanggal_pengajuan',
        'status',
        'catatan_kaprodi',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'date',
    ];

    // Relationships
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    // Scopes
    public function scopeDiproses($query)
    {
        return $query->where('status', 'diproses');
    }

    public function scopeDisetujui($query)
    {
        return $query->where('status', 'disetujui');
    }
}
