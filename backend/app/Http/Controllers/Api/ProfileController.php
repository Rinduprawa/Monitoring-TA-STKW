<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get authenticated user profile
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        // Load relasi sesuai role
        switch ($user->role) {
            case 'mahasiswa':
                $user->load([
                    'mahasiswa.prodi',
                    'mahasiswa.dosenPembimbing1',
                    'mahasiswa.dosenPembimbing2'
                ]);
                break;
            
            case 'dosen':
                $user->load('dosen.prodi');
                break;
            
            case 'kaprodi':
                $user->load([
                    'kaprodi.prodi',
                    'kaprodi.dosen'
                ]);
                break;
            
            case 'admin':
            default:
                // Admin ga perlu load relasi
                break;
        }

        return response()->json([
            'user' => $user,
        ], 200);
    }
}
