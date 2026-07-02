<?php

use App\Modules\Plugins\Controllers\PluginController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/plugins', [PluginController::class, 'index'])->name('plugins.index');
    Route::post('/plugins/{plugin}/enable', [PluginController::class, 'enable'])->name('plugins.enable');
    Route::post('/plugins/{plugin}/disable', [PluginController::class, 'disable'])->name('plugins.disable');
});
