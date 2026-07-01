<?php

use App\Modules\Metrics\Controllers\MetricsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/metrics', MetricsController::class)->name('metrics');
});
