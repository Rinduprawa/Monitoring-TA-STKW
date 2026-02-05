<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'CORS working!',
        'status' => 'success'
    ]);
});

// Protected route (butuh authentication)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});