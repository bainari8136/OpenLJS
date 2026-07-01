<?php

use App\Modules\Reviews\Controllers\ReviewAssignmentController;
use App\Modules\Reviews\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Reviewer routes
    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::get('/reviews/{assignment}', [ReviewController::class, 'show'])->name('reviews.show');
    Route::post('/reviews/{assignment}/accept', [ReviewController::class, 'accept'])->name('reviews.accept');
    Route::post('/reviews/{assignment}/decline', [ReviewController::class, 'decline'])->name('reviews.decline');
    Route::post('/reviews/{assignment}/submit', [ReviewController::class, 'submit'])->name('reviews.submit');

    // Editor routes (per-submission)
    Route::prefix('submissions/{submission}/reviews')->name('reviews.')->group(function () {
        Route::post('/invite', [ReviewAssignmentController::class, 'invite'])->name('invite');
        Route::delete('/{assignment}/cancel', [ReviewAssignmentController::class, 'cancel'])->name('cancel');
    });
});
