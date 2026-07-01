<?php

use App\Modules\Copyediting\Controllers\CopyeditingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('submissions/{submission}')->name('copyediting.')->group(function () {
        Route::post('/copyediting/files', [CopyeditingController::class, 'uploadCopyeditingFile'])->name('upload_copyediting');
        Route::post('/production/galleys', [CopyeditingController::class, 'uploadGalley'])->name('upload_galley');
        Route::delete('/files/{file}', [CopyeditingController::class, 'deleteFile'])->name('delete_file');
    });
});
