<?php

use App\Modules\Submissions\Controllers\SubmissionController;
use App\Modules\Submissions\Controllers\SubmissionFileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('submissions')->name('submissions.')->group(function () {
        Route::get('/', [SubmissionController::class, 'index'])->name('index');
        Route::get('/create', [SubmissionController::class, 'create'])->name('create');
        Route::post('/', [SubmissionController::class, 'store'])->name('store');
        Route::get('/{submission}', [SubmissionController::class, 'show'])->name('show');
        Route::post('/{submission}/revise', [SubmissionController::class, 'revise'])->name('revise');

        // File download
        Route::get('/{submission}/files/{file}/download', [SubmissionFileController::class, 'download'])
            ->name('files.download');
    });
});
