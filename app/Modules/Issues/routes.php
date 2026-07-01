<?php

use App\Modules\Issues\Controllers\ArticleController;
use App\Modules\Issues\Controllers\IssueController;
use App\Modules\Issues\Controllers\PublicIssueController;
use Illuminate\Support\Facades\Route;

// Admin issue management
Route::middleware(['auth', 'verified'])->group(function () {
    // Articles dashboard
    Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
    Route::get('/articles/{article}', [ArticleController::class, 'show'])->name('articles.show');

    Route::prefix('issues')->name('issues.')->group(function () {
        Route::get('/', [IssueController::class, 'index'])->name('index');
        Route::post('/', [IssueController::class, 'store'])->name('store');
        Route::get('/{issue}/edit', [IssueController::class, 'edit'])->name('edit');
        Route::patch('/{issue}', [IssueController::class, 'update'])->name('update');
        Route::delete('/{issue}', [IssueController::class, 'destroy'])->name('destroy');
        Route::post('/{issue}/publish', [IssueController::class, 'publish'])->name('publish');
        Route::post('/{issue}/unpublish', [IssueController::class, 'unpublish'])->name('unpublish');

        // Article file download (pre-publication preview for managers)
        Route::get('/articles/{article}/files/{file}/download', [ArticleController::class, 'download'])
            ->name('articles.download');
    });

    Route::post('/submissions/{submission}/convert', [ArticleController::class, 'convert'])->name('articles.convert');
    Route::patch('/articles/{article}/assign-issue', [ArticleController::class, 'assignIssue'])->name('articles.assign_issue');
    Route::patch('/articles/{article}/remove-issue', [ArticleController::class, 'removeIssue'])->name('articles.remove_issue');
    Route::patch('/articles/{article}/meta', [ArticleController::class, 'updateMeta'])->name('articles.update_meta');
});

// Public journal pages (no auth required)
Route::prefix('j/{journal:slug}')->name('journal.')->group(function () {
    Route::get('/current-issue', [PublicIssueController::class, 'current'])->name('current_issue');
    Route::get('/archive', [PublicIssueController::class, 'archive'])->name('archive');
    Route::get('/articles/{article:slug}', [PublicIssueController::class, 'article'])->name('article');
});
