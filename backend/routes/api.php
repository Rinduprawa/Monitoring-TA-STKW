<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MahasiswaController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\KaprodiController;
use App\Http\Controllers\Api\ProdiController;
use App\Http\Controllers\Api\ProfileController;

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
});

// Khusus mahasiswa
Route::middleware(['auth:sanctum', 'role:mahasiswa'])->group(function () {
    Route::get('/mahasiswa/profile', [MahasiswaController::class, 'profile']);
});

// Khusus dosen
Route::middleware(['auth:sanctum', 'role:dosen'])->group(function () {
    Route::get('/dosen/dashboard', [DosenController::class, 'dashboard']);
});

// Khusus kaprodi
Route::middleware(['auth:sanctum', 'role:kaprodi'])->group(function () {
    Route::get('/kaprodi/dashboard', [KaprodiController::class, 'dashboard']);
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