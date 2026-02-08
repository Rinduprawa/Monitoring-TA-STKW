<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PengajuanUjian extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pengajuan_ujian';

    protected $fillable = [
        'mahasiswa_id',
        'jenis_ujian',
        'tanggal_pengajuan',
        'file_bukti_kelayakan',
        'status',
        'catatan_pembimbing',
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
    public function scopeDiprosesPembimbing($query)
    {
        return $query->where('status', 'diproses_pembimbing');
    }

    public function scopeDisetujuiPembimbing($query)
    {
        return $query->where('status', 'disetujui_pembimbing');
    }

    public function scopeDiprosesKaprodi($query)
    {
        return $query->whereIn('status', ['disetujui_pembimbing']); // Display mapping
    }

    public function scopeDisetujuiKaprodi($query)
    {
        return $query->where('status', 'disetujui_kaprodi');
    }

    // Helpers
    public function getDisplayStatus($role)
    {
        if ($this->status === 'disetujui_pembimbing' && $role !== 'kaprodi') {
            return 'diproses_kaprodi';
        }
        return $this->status;
    }
}
