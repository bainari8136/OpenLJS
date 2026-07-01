<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Module routes
require base_path('app/Modules/Users/routes.php');
require base_path('app/Modules/Journals/routes.php');
require base_path('app/Modules/Submissions/routes.php');
require base_path('app/Modules/Editorial/routes.php');
require base_path('app/Modules/Reviews/routes.php');
require base_path('app/Modules/Copyediting/routes.php');
require base_path('app/Modules/Issues/routes.php');
require base_path('app/Modules/Feeds/routes.php');
require base_path('app/Modules/Notifications/routes.php');
require base_path('app/Modules/Search/routes.php');
require base_path('app/Modules/Oai/routes.php');
require base_path('app/Modules/Metrics/routes.php');
require base_path('app/Modules/Settings/routes.php');

require __DIR__.'/auth.php';
