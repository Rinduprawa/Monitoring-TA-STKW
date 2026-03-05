<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\JadwalUjian;
use App\Observers\JadwalUjianObserver;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JadwalUjian::observe(JadwalUjianObserver::class);

    }
}
