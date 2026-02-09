<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check apakah user sudah login
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check apakah role user sesuai
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}