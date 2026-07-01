<?php

namespace App\Modules\Issues\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\Issue;
use App\Modules\Issues\Services\PublishingService;
use App\Modules\Journals\Models\Journal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IssueController extends Controller
{
    public function __construct(private PublishingService $publisher) {}

    public function index(): Response
    {
        $issues = Issue::with('journal')
            ->withCount('articles')
            ->latest()
            ->paginate(20)
            ->through(fn ($i) => [
                'id'            => $i->id,
                'title'         => $i->title,
                'label'         => $i->label(),
                'journal'       => $i->journal?->title,
                'journal_id'    => $i->journal_id,
                'is_published'  => $i->is_published,
                'published_at'  => $i->published_at?->toDateString(),
                'articles_count'=> $i->articles_count,
                'year'          => $i->year,
            ]);

        $journals = Journal::where('is_active', true)->orderBy('title')->get(['id', 'title']);

        return Inertia::render('Issues/Index', [
            'issues'   => $issues,
            'journals' => $journals,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $data = $request->validate([
            'journal_id'  => ['required', 'exists:journals,id'],
            'title'       => ['required', 'string', 'max:255'],
            'volume'      => ['nullable', 'string', 'max:50'],
            'number'      => ['nullable', 'string', 'max:50'],
            'year'        => ['required', 'integer', 'min:1900', 'max:2100'],
            'description' => ['nullable', 'string'],
        ]);

        $journal = Journal::findOrFail($data['journal_id']);
        $issue = $this->publisher->createIssue($journal, $data);

        return redirect()->route('issues.edit', $issue)->with('success', 'Issue created.');
    }

    public function edit(Issue $issue): Response
    {
        abort_unless(auth()->user()->can('manage-issues'), 403);

        $issue->load(['journal', 'articles.files', 'articles.submission.authors']);

        $unassigned = Article::where('journal_id', $issue->journal_id)
            ->whereNull('issue_id')
            ->get()
            ->map(fn ($a) => ['id' => $a->id, 'title' => $a->title]);

        return Inertia::render('Issues/Edit', [
            'issue' => [
                'id'           => $issue->id,
                'title'        => $issue->title,
                'label'        => $issue->label(),
                'volume'       => $issue->volume,
                'number'       => $issue->number,
                'year'         => $issue->year,
                'description'  => $issue->description,
                'is_published' => $issue->is_published,
                'published_at' => $issue->published_at?->toDateString(),
                'journal'      => ['id' => $issue->journal_id, 'title' => $issue->journal?->title],
                'articles'     => $issue->articles->map(fn ($a) => $this->formatArticle($a)),
            ],
            'unassignedArticles' => $unassigned,
        ]);
    }

    public function update(Request $request, Issue $issue): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'volume'      => ['nullable', 'string', 'max:50'],
            'number'      => ['nullable', 'string', 'max:50'],
            'year'        => ['required', 'integer', 'min:1900', 'max:2100'],
            'description' => ['nullable', 'string'],
        ]);

        $this->publisher->updateIssue($issue, $data);

        return back()->with('success', 'Issue updated.');
    }

    public function destroy(Request $request, Issue $issue): RedirectResponse
    {
        abort_unless($request->user()->can('manage-issues'), 403);
        abort_if($issue->is_published, 422);

        $issue->delete();

        return redirect()->route('issues.index')->with('success', 'Issue deleted.');
    }

    public function publish(Request $request, Issue $issue): RedirectResponse
    {
        abort_unless($request->user()->can('publish-articles'), 403);

        $this->publisher->publishIssue($issue);

        return back()->with('success', "Issue published: {$issue->label()}");
    }

    public function unpublish(Request $request, Issue $issue): RedirectResponse
    {
        abort_unless($request->user()->can('publish-articles'), 403);

        $this->publisher->unpublishIssue($issue);

        return back()->with('success', 'Issue unpublished.');
    }

    private function formatArticle(Article $a): array
    {
        return [
            'id'        => $a->id,
            'title'     => $a->title,
            'slug'      => $a->slug,
            'doi'       => $a->doi,
            'page_start'=> $a->page_start,
            'page_end'  => $a->page_end,
            'authors'   => $a->submission?->authors->map(fn ($au) => $au->name)->join(', '),
            'files'     => $a->files->map(fn ($f) => [
                'id'    => $f->id,
                'label' => $f->label,
                'type'  => $f->file_type,
            ]),
        ];
    }
}
