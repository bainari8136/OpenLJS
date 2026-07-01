<?php

namespace App\Modules\Issues\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\Issue;
use App\Modules\Issues\Services\PublishingService;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ArticleController extends Controller
{
    public function __construct(private PublishingService $publisher) {}

    public function convert(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $article = $this->publisher->convertToArticle($submission);

        return redirect()->route('issues.index')
            ->with('success', "Article created: {$article->title}. Assign it to an issue.");
    }

    public function assignIssue(Request $request, Article $article): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $data = $request->validate([
            'issue_id'   => ['required', 'exists:issues,id'],
            'page_start' => ['nullable', 'integer', 'min:1'],
            'page_end'   => ['nullable', 'integer', 'min:1'],
        ]);

        $issue = Issue::findOrFail($data['issue_id']);
        $this->publisher->assignToIssue($article, $issue);

        if (isset($data['page_start'])) {
            $article->update(['page_start' => $data['page_start'], 'page_end' => $data['page_end']]);
        }

        return back()->with('success', 'Article assigned to issue.');
    }

    public function removeIssue(Request $request, Article $article): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $this->publisher->removeFromIssue($article);

        return back()->with('success', 'Article removed from issue.');
    }

    public function updateMeta(Request $request, Article $article): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $data = $request->validate([
            'doi'        => ['nullable', 'string', 'max:255', 'regex:/^10\.\d{4,}\/\S+$/'],
            'page_start' => ['nullable', 'integer', 'min:1'],
            'page_end'   => ['nullable', 'integer', 'min:1', 'gte:page_start'],
        ]);

        $article->update(array_filter($data, fn ($v) => $v !== null) + [
            'doi'        => $data['doi'] ?? null,
            'page_start' => $data['page_start'] ?? null,
            'page_end'   => $data['page_end'] ?? null,
        ]);

        return back()->with('success', 'Article metadata updated.');
    }

    public function download(Article $article, \App\Modules\Issues\Models\ArticleFile $file): mixed
    {
        abort_unless($file->article_id === $article->id, 404);

        // Only published articles are publicly downloadable
        // (or authenticated users with manage permissions can always download)
        $isPublished = $article->published_at !== null;
        if (!$isPublished) {
            abort_unless(auth()->check() && auth()->user()->can('manage-issues'), 403);
        }

        $file->increment('downloads_count');

        return Storage::disk('local')->download($file->storage_path, "{$article->slug}.{$file->file_type}");
    }
}
