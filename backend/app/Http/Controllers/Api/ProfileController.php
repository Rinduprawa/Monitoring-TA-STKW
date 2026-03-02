<?php

namespace App\Http\Controllers\Api;

use App\Services\ProfileService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    protected ProfileService $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function show(Request $request)
    {
        $user = $request->user();

        $profile = $this->profileService->loadUserWithRole($user);

        return response()->json([
            'user' => $profile,
        ]);
    }
}
