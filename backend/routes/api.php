<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

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
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
});