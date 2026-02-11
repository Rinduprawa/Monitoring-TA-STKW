<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MahasiswaController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\KaprodiController;
use App\Http\Controllers\Api\ProdiController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\MahasiswaPendaftaranTAController;
use App\Http\Controllers\Api\MahasiswaPengajuanProposalController;
use App\Http\Controllers\Api\KaprodiPendaftaranTAController;

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS working!',
        'status' => 'success'
    ]);
});

// Public routes (tidak perlu login)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (harus login)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/prodi', [ProdiController::class, 'index']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Routes yang bisa diakses mahasiswa & kaprodi
    Route::get('/berkas-pendaftaran/{id}', [MahasiswaPendaftaranTAController::class, 'serveBerkas']);
    Route::get('/berkas-pendaftaran/{id}/download', [MahasiswaPendaftaranTAController::class, 'downloadBerkas']);

    // Routes untuk preview/download pengajuan proposal (bisa diakses mahasiswa & kaprodi)
    Route::get('/pengajuan-proposal/{id}/preview', [MahasiswaPengajuanProposalController::class, 'previewProposal']);
    Route::get('/pengajuan-proposal/{id}/download', [MahasiswaPengajuanProposalController::class, 'downloadProposal']);
});

// Khusus mahasiswa
Route::middleware(['auth:sanctum', 'role:mahasiswa'])->group(function () {
    Route::get('/mahasiswa/profile', [MahasiswaController::class, 'profile']);

    Route::get('/pendaftaran-ta', [MahasiswaPendaftaranTAController::class, 'index']);
    Route::post('/pendaftaran-ta', [MahasiswaPendaftaranTAController::class, 'store']);
    Route::get('/pendaftaran-ta/{id}', [MahasiswaPendaftaranTAController::class, 'show']);
    Route::post('/pendaftaran-ta/{id}', [MahasiswaPendaftaranTAController::class, 'update']);
    Route::delete('/pendaftaran-ta/{id}', [MahasiswaPendaftaranTAController::class, 'destroy']);

    Route::get('/pengajuan-proposal', [MahasiswaPengajuanProposalController::class, 'index']);
    Route::post('/pengajuan-proposal', [MahasiswaPengajuanProposalController::class, 'store']);
    Route::get('/pengajuan-proposal/{id}', [MahasiswaPengajuanProposalController::class, 'show']);
    Route::post('/pengajuan-proposal/{id}', [MahasiswaPengajuanProposalController::class, 'update']);
    Route::delete('/pengajuan-proposal/{id}', [MahasiswaPengajuanProposalController::class, 'destroy']);
});

// Khusus dosen
Route::middleware(['auth:sanctum', 'role:dosen'])->group(function () {
    Route::get('/dosen/dashboard', [DosenController::class, 'dashboard']);
});

// Khusus kaprodi
Route::middleware(['auth:sanctum', 'role:kaprodi'])->group(function () {
    Route::get('/kaprodi/dashboard', [KaprodiController::class, 'dashboard']);

    Route::get('/kaprodi/pendaftaran-ta', [KaprodiPendaftaranTAController::class, 'index']);
    Route::get('/kaprodi/pendaftaran-ta/{id}', [KaprodiPendaftaranTAController::class, 'show']);
    Route::post('/kaprodi/pendaftaran-ta/{id}/validasi', [KaprodiPendaftaranTAController::class, 'validasi']);
});

// Khusus admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Mahasiswa
    Route::get('/mahasiswa', [MahasiswaController::class, 'index']);
    Route::post('/mahasiswa', [MahasiswaController::class, 'store']);
    Route::get('/mahasiswa/{id}', [MahasiswaController::class, 'show']);
    Route::put('/mahasiswa/{id}', [MahasiswaController::class, 'update']);
    Route::delete('/mahasiswa/{id}', [MahasiswaController::class, 'destroy']);
    Route::post('/mahasiswa/{id}/reset-password', [MahasiswaController::class, 'resetPassword']);

    // Dosen
    Route::get('/dosen', [DosenController::class, 'index']);
    Route::post('/dosen', [DosenController::class, 'store']);
    Route::get('/dosen/{id}', [DosenController::class, 'show']);
    Route::put('/dosen/{id}', [DosenController::class, 'update']);
    Route::delete('/dosen/{id}', [DosenController::class, 'destroy']);
    Route::post('/dosen/{id}/reset-password', [DosenController::class, 'resetPassword']);

    // Kaprodi
    Route::get('/kaprodi', [KaprodiController::class, 'index']);
    Route::get('/kaprodi/{id}', [KaprodiController::class, 'show']);
    Route::put('/kaprodi/{id}', [KaprodiController::class, 'update']);
    Route::post('/kaprodi/{id}/reset-password', [KaprodiController::class, 'resetPassword']);
    Route::get('/kaprodi/dosen-available/{prodi_id}', [KaprodiController::class, 'getAvailableDosen']);
});