<?php

namespace App\Modules\Search\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $query = trim($request->get('q', ''));
        $type  = $request->get('type', 'all'); // submissions, articles, all

        $submissions = collect();
        $articles    = collect();

        if ($query !== '') {
            $user = $request->user();

            // Submissions: only for authenticated users with appropriate access
            if ($user && in_array($type, ['submissions', 'all'])) {
                $canViewAll = $user->can('view-all-submissions');

                $submissionsQuery = Submission::search($query)
                    ->query(fn ($q) => $q->with(['journal', 'section', 'submittingAuthor'])
                        ->when(!$canViewAll, fn ($q) => $q->where('submitting_author_id', $user->id))
                        ->whereNotIn('status', [Submission::STATUS_DRAFT])
                    );

                $submissions = $submissionsQuery->get()->map(fn ($s) => [
                    'id'           => $s->id,
                    'title'        => $s->title ?? '(Untitled)',
                    'abstract'     => \Str::limit($s->abstract ?? '', 200),
                    'status'       => $s->status,
                    'status_label' => $s->statusLabel(),
                    'journal'      => $s->journal?->title,
                    'submitted_at' => $s->submitted_at?->toDateString(),
                    'url'          => route('submissions.show', $s->id),
                ]);
            }

            // Articles: published ones are public; authenticated users with manage-issues see all
            if (in_array($type, ['articles', 'all'])) {
                $user = $request->user();
                $canSeeUnpublished = $user?->can('manage-issues');

                $articlesQuery = Article::search($query)
                    ->query(fn ($q) => $q->with(['journal', 'issue', 'submission.authors'])
                        ->when(!$canSeeUnpublished, fn ($q) => $q->whereNotNull('published_at'))
                    );

                $articles = $articlesQuery->get()->map(fn ($a) => [
                    'id'           => $a->id,
                    'title'        => $a->title,
                    'abstract'     => \Str::limit($a->abstract ?? '', 200),
                    'authors'      => $a->submission?->authors->pluck('name')->join(', '),
                    'journal'      => $a->journal?->title,
                    'journal_slug' => $a->journal?->slug,
                    'issue_label'  => $a->issue?->label(),
                    'doi'          => $a->doi,
                    'published_at' => $a->published_at?->format('F j, Y'),
                    'url'          => $a->journal
                        ? route('journal.article', [$a->journal->slug, $a->slug])
                        : null,
                ]);
            }
        }

        return Inertia::render('Search/Index', [
            'query'       => $query,
            'type'        => $type,
            'submissions' => $submissions,
            'articles'    => $articles,
            'isAuth'      => (bool) $request->user(),
        ]);
    }
}
