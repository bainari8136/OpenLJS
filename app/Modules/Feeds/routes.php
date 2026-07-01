<?php

use App\Modules\Feeds\Controllers\FeedController;
use Illuminate\Support\Facades\Route;

// Public syndication feeds — no auth required
Route::prefix('j/{journal:slug}')->name('journal.')->group(function () {
    Route::get('/feed/rss', [FeedController::class, 'journalRss'])->name('feed.rss');
    Route::get('/feed/atom', [FeedController::class, 'journalAtom'])->name('feed.atom');
    Route::get('/issues/{issue}/feed/rss', [FeedController::class, 'issueRss'])->name('issue.feed.rss');
    Route::get('/issues/{issue}/feed/atom', [FeedController::class, 'issueAtom'])->name('issue.feed.atom');
});
