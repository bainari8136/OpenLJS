<?php

use App\Modules\Journals\Controllers\JournalCategoryController;
use App\Modules\Journals\Controllers\JournalController;
use App\Modules\Journals\Controllers\JournalEditorialMemberController;
use App\Modules\Journals\Controllers\JournalSectionController;
use App\Modules\Journals\Controllers\PublicJournalController;
use Illuminate\Support\Facades\Route;

// Admin journal management
Route::middleware(['auth', 'verified'])->prefix('journals')->name('journals.')->group(function () {
    Route::get('/', [JournalController::class, 'index'])->name('index');
    Route::get('/create', [JournalController::class, 'create'])->name('create');
    Route::post('/', [JournalController::class, 'store'])->name('store');
    Route::get('/{journal}/edit', [JournalController::class, 'edit'])->name('edit');
    Route::patch('/{journal}', [JournalController::class, 'update'])->name('update');
    Route::delete('/{journal}', [JournalController::class, 'destroy'])->name('destroy');

    // Sections (nested under journal)
    Route::post('/{journal}/sections', [JournalSectionController::class, 'store'])->name('sections.store');
    Route::patch('/{journal}/sections/{section}', [JournalSectionController::class, 'update'])->name('sections.update');
    Route::delete('/{journal}/sections/{section}', [JournalSectionController::class, 'destroy'])->name('sections.destroy');

    // Editorial team / masthead (nested under journal)
    Route::post('/{journal}/editorial-members', [JournalEditorialMemberController::class, 'store'])->name('editorial-members.store');
    Route::patch('/{journal}/editorial-members/{member}', [JournalEditorialMemberController::class, 'update'])->name('editorial-members.update');
    Route::delete('/{journal}/editorial-members/{member}', [JournalEditorialMemberController::class, 'destroy'])->name('editorial-members.destroy');

    // Categories (nested under journal)
    Route::post('/{journal}/categories', [JournalCategoryController::class, 'store'])->name('categories.store');
    Route::patch('/{journal}/categories/{category}', [JournalCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/{journal}/categories/{category}', [JournalCategoryController::class, 'destroy'])->name('categories.destroy');
});

// Public journal pages — keep after admin routes to avoid slug conflicts
Route::prefix('j/{journal:slug}')->name('journal.')->group(function () {
    Route::get('/', [PublicJournalController::class, 'home'])->name('home');
    Route::get('/about', [PublicJournalController::class, 'about'])->name('about');
    Route::get('/author-guidelines', [PublicJournalController::class, 'guidelines'])->name('guidelines');
    Route::get('/editorial-team', [PublicJournalController::class, 'editorialTeam'])->name('editorial_team');
    Route::get('/categories', [PublicJournalController::class, 'categories'])->name('categories');
});
