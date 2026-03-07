<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\JadwalUjian;
use App\Models\Penilaian;
use App\Observers\JadwalUjianObserver;
use App\Observers\PenilaianObserver;


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
        Penilaian::observe(PenilaianObserver::class);
    }
}
