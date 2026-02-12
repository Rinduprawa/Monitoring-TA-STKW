<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Repository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MahasiswaBerkasTAController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $berkas = Repository::where('mahasiswa_id', $mahasiswa->id)->get();

        // Add file URL
        $berkas->map(function ($b) {
            $b->file_url = url('storage/' . $b->file_path);
            return $b;
        });

        return response()->json([
            'data' => [
                'bentuk_ta' => $mahasiswa->bentuk_ta,
                'berkas' => $berkas
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $request->validate([
            'jenis_dokumen' => 'required|in:naskah_skripsi,deskripsi_karya_seni,dokumentasi_pergelaran',
            'file' => 'required|file|max:10240', // 10MB
        ]);

        // Check if already exists
        $existing = Repository::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis_dokumen', $request->jenis_dokumen)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Berkas sudah ada, gunakan endpoint update'], 400);
        }

        $file = $request->file('file');
        $filename = time() . '_' . $request->jenis_dokumen . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('berkas_ta/' . $mahasiswa->nim, $filename, 'public');

        $berkas = Repository::create([
            'mahasiswa_id' => $mahasiswa->id,
            'jenis_dokumen' => $request->jenis_dokumen,
            'file_path' => $path,
            'tanggal_unggah' => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Berkas berhasil diunggah',
            'data' => $berkas
        ], 201);
    }

    public function update(Request $request, $jenisDokumen)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $berkas = Repository::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis_dokumen', $jenisDokumen)
            ->first();

        if (!$berkas) {
            return response()->json(['message' => 'Berkas not found'], 404);
        }

        $request->validate([
            'file' => 'required|file|max:10240',
            'tanggal_unggah' => now()->toDateString(),
        ]);

        // Delete old file
        Storage::disk('public')->delete($berkas->file_path);

        // Upload new file
        $file = $request->file('file');
        $filename = time() . '_' . $jenisDokumen . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('berkas_ta/' . $mahasiswa->nim, $filename, 'public');

        $berkas->update(['file_path' => $path]);

        return response()->json([
            'message' => 'Berkas berhasil diperbarui',
            'data' => $berkas
        ]);
    }

    public function destroy($jenisDokumen)
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json(['message' => 'Mahasiswa not found'], 404);
        }

        $berkas = Repository::where('mahasiswa_id', $mahasiswa->id)
            ->where('jenis_dokumen', $jenisDokumen)
            ->first();

        if (!$berkas) {
            return response()->json(['message' => 'Berkas not found'], 404);
        }

        // Delete file
        Storage::disk('public')->delete($berkas->file_path);
        $berkas->delete();

        return response()->json(['message' => 'Berkas berhasil dihapus']);
    }

    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            $berkas = Repository::findOrFail($id);
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

            if (!$mahasiswa) {
                return response()->json(['message' => 'Mahasiswa not found'], 404);
            }

            // Check authorization - hanya bisa akses berkas miliknya sendiri
            if ($berkas->mahasiswa_id !== $mahasiswa->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $path = storage_path('app/public/' . $berkas->file_path);

            if (!file_exists($path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return response()->file($path);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}