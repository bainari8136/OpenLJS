<?php

use App\Modules\Search\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

// Public + authenticated: results differ based on auth state
Route::get('/search', SearchController::class)->name('search');
