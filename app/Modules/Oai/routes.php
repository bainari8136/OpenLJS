<?php

use App\Modules\Oai\Controllers\OaiController;
use Illuminate\Support\Facades\Route;

// OAI-PMH endpoint — public, no auth required
Route::get('/oai', OaiController::class)->name('oai');
