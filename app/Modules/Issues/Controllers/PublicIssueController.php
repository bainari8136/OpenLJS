<?php

namespace App\Modules\Issues\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\ArticleView;
use App\Modules\Issues\Models\Issue;
use App\Modules\Journals\Models\Journal;
use Inertia\Inertia;
use Inertia\Response;

class PublicIssueController extends Controller
{
    public function current(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        $issue = Issue::where('journal_id', $journal->id)
            ->where('is_published', true)
            ->latest('published_at')
            ->first();

        $articles = $issue
            ? $issue->articles()->with('files', 'submission.authors')->get()->map(fn ($a) => $this->formatArticle($a, $journal))
            : collect();

        return Inertia::render('Public/CurrentIssue', [
            'journal' => ['id' => $journal->id, 'title' => $journal->title, 'slug' => $journal->slug],
            'issue'   => $issue ? [
                'id'           => $issue->id,
                'title'        => $issue->title,
                'label'        => $issue->label(),
                'description'  => $issue->description,
                'published_at' => $issue->published_at?->format('F j, Y'),
            ] : null,
            'articles' => $articles,
        ]);
    }

    public function archive(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        $issues = Issue::where('journal_id', $journal->id)
            ->where('is_published', true)
            ->withCount('articles')
            ->orderByDesc('year')
            ->orderByDesc('volume')
            ->orderByDesc('number')
            ->get()
            ->map(fn ($i) => [
                'id'            => $i->id,
                'title'         => $i->title,
                'label'         => $i->label(),
                'year'          => $i->year,
                'published_at'  => $i->published_at?->format('F Y'),
                'articles_count'=> $i->articles_count,
            ]);

        return Inertia::render('Public/Archive', [
            'journal' => ['id' => $journal->id, 'title' => $journal->title, 'slug' => $journal->slug],
            'issues'  => $issues,
        ]);
    }

    public function article(Journal $journal, Article $article): Response
    {
        abort_unless($journal->is_active, 404);
        abort_unless($article->journal_id === $journal->id, 404);
        abort_unless($article->published_at !== null, 404);

        $article->load(['issue', 'files', 'submission.authors']);

        // Record view (deduplicated per IP per day)
        ArticleView::record($article, request()->ip() ?? '0.0.0.0');

        return Inertia::render('Public/Article', [
            'journal' => ['id' => $journal->id, 'title' => $journal->title, 'slug' => $journal->slug],
            'article' => $this->formatArticle($article, $journal),
            'issue'   => $article->issue ? [
                'id'    => $article->issue->id,
                'title' => $article->issue->title,
                'label' => $article->issue->label(),
            ] : null,
        ]);
    }

    private function formatArticle(Article $a, Journal $journal): array
    {
        return [
            'id'           => $a->id,
            'title'        => $a->title,
            'slug'         => $a->slug,
            'abstract'     => $a->abstract,
            'keywords'     => $a->keywords ?? [],
            'doi'          => $a->doi,
            'page_start'   => $a->page_start,
            'page_end'     => $a->page_end,
            'published_at' => $a->published_at?->format('F j, Y'),
            'url'          => route('journal.article', [$journal->slug, $a->slug]),
            'authors'      => $a->submission?->authors->map(fn ($au) => [
                'name'        => $au->name,
                'affiliation' => $au->affiliation,
                'orcid'       => $au->orcid,
                'is_corresponding' => $au->is_corresponding,
            ]) ?? [],
            'files' => $a->files->map(fn ($f) => [
                'id'           => $f->id,
                'label'        => $f->label,
                'file_type'    => $f->file_type,
                'download_url' => $f->downloadUrl(),
                'downloads'    => $f->downloads_count,
            ]),
        ];
    }
}
