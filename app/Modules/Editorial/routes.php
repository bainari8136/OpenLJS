<?php

use App\Modules\Editorial\Controllers\EditorialController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Editorial queue
    Route::get('/editorial', [EditorialController::class, 'index'])->name('editorial.index');

    // Per-submission editorial actions
    Route::prefix('submissions/{submission}/editorial')->name('editorial.')->group(function () {
        Route::post('/assign',    [EditorialController::class, 'assignEditor'])->name('assign');
        Route::delete('/unassign', [EditorialController::class, 'unassignEditor'])->name('unassign');
        Route::post('/transition', [EditorialController::class, 'transition'])->name('transition');
    });
});
