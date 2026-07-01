<?php

use App\Modules\Notifications\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::post('/mark-all-read', [NotificationController::class, 'markAllRead'])->name('mark_all_read');
    Route::post('/{id}/read', [NotificationController::class, 'markRead'])->name('mark_read');
    Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
});
