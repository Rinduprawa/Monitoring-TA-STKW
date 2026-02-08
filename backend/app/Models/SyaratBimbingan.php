<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SyaratBimbingan extends Model
{
    use HasFactory;

    protected $table = 'syarat_bimbingan';

    protected $fillable = [
        'jenis_ujian',
        'minimal_bimbingan',
    ];

    protected $casts = [
        'minimal_bimbingan' => 'integer',
    ];
}
