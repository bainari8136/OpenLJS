<?php

namespace App\Modules\Issues\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\Issue;
use App\Modules\Issues\Services\PublishingService;
use App\Modules\Journals\Models\Journal;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function __construct(private PublishingService $publisher) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $query = Article::with(['journal', 'issue', 'files'])
            ->when($request->filled('journal_id'), fn ($q) => $q->where('journal_id', $request->journal_id))
            ->when($request->filled('status'), function ($q) use ($request) {
                match ($request->status) {
                    'published'   => $q->whereNotNull('published_at'),
                    'unpublished' => $q->whereNull('published_at'),
                    'unassigned'  => $q->whereNull('issue_id'),
                    default       => null,
                };
            })
            ->when($request->filled('q'), fn ($q) => $q->where('title', 'like', '%' . $request->q . '%'))
            ->latest();

        $articles = $query->paginate(25)->withQueryString()->through(fn ($a) => $this->formatRow($a));

        $journals = Journal::where('is_active', true)->orderBy('title')->get(['id', 'title']);

        return Inertia::render('Articles/Index', [
            'articles' => $articles,
            'journals' => $journals,
            'filters'  => $request->only('journal_id', 'status', 'q'),
        ]);
    }

    public function show(Request $request, Article $article): Response
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $article->load(['journal', 'issue', 'files', 'submission.authors']);

        $availableIssues = Issue::where('journal_id', $article->journal_id)
            ->orderByDesc('year')->orderByDesc('number')
            ->get(['id', 'title', 'volume', 'number', 'year', 'is_published']);

        return Inertia::render('Articles/Show', [
            'article'         => $this->formatDetail($article),
            'availableIssues' => $availableIssues->map(fn ($i) => [
                'id'    => $i->id,
                'label' => "Vol. {$i->volume} No. {$i->number} ({$i->year})" . ($i->is_published ? ' ✓' : ''),
                'title' => $i->title,
            ]),
        ]);
    }

    private function formatRow(Article $a): array
    {
        $downloads = $a->files->sum('downloads_count');
        return [
            'id'           => $a->id,
            'slug'         => $a->slug,
            'title'        => $a->title,
            'doi'          => $a->doi,
            'page_start'   => $a->page_start,
            'page_end'     => $a->page_end,
            'published_at' => $a->published_at?->toDateString(),
            'journal'      => $a->journal?->title,
            'journal_slug' => $a->journal?->slug,
            'issue'        => $a->issue ? "Vol. {$a->issue->volume} No. {$a->issue->number} ({$a->issue->year})" : null,
            'issue_id'     => $a->issue_id,
            'downloads'    => $downloads,
            'files_count'  => $a->files->count(),
        ];
    }

    private function formatDetail(Article $a): array
    {
        return [
            'id'           => $a->id,
            'slug'         => $a->slug,
            'title'        => $a->title,
            'abstract'     => $a->abstract,
            'keywords'     => $a->keywords ?? [],
            'doi'          => $a->doi,
            'page_start'   => $a->page_start,
            'page_end'     => $a->page_end,
            'published_at' => $a->published_at?->toDateString(),
            'journal'      => ['id' => $a->journal_id, 'title' => $a->journal?->title, 'slug' => $a->journal?->slug],
            'issue'        => $a->issue ? [
                'id'    => $a->issue->id,
                'label' => "Vol. {$a->issue->volume} No. {$a->issue->number} ({$a->issue->year})",
                'title' => $a->issue->title,
            ] : null,
            'submission_id' => $a->submission_id,
            'authors'       => $a->submission?->authors->map(fn ($au) => [
                'id'          => $au->id,
                'name'        => $au->name,
                'email'       => $au->email,
                'affiliation' => $au->affiliation,
                'country'     => $au->country,
                'orcid'       => $au->orcid,
                'is_corresponding' => $au->is_corresponding,
            ]) ?? [],
            'files' => $a->files->map(fn ($f) => [
                'id'             => $f->id,
                'label'          => $f->label,
                'file_type'      => $f->file_type,
                'downloads_count'=> $f->downloads_count,
                'download_url'   => $f->downloadUrl(),
            ]),
        ];
    }

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
