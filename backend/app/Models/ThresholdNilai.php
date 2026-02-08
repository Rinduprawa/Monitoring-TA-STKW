<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ThresholdNilai extends Model
{
    use HasFactory;

    protected $table = 'threshold_nilai';

    protected $fillable = [
        'jenis_ujian',
        'nilai_minimal',
    ];

    protected $casts = [
        'nilai_minimal' => 'decimal:2',
    ];
}
