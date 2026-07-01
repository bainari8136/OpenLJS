<?php

namespace App\Modules\Metrics\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\ArticleFile;
use App\Modules\Issues\Models\ArticleView;
use App\Modules\Journals\Models\Journal;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MetricsController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->can('view-all-submissions'), 403);

        // KPI counts
        $kpis = [
            'journals'     => Journal::where('is_active', true)->count(),
            'submissions'  => Submission::whereNotIn('status', [Submission::STATUS_DRAFT])->count(),
            'published'    => Article::whereNotNull('published_at')->count(),
            'downloads'    => ArticleFile::sum('downloads_count'),
            'total_views'  => ArticleView::count(),
        ];

        // Submissions by status
        $byStatus = Submission::whereNotIn('status', [Submission::STATUS_DRAFT])
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => [
                'status' => $r->status,
                'label'  => (new Submission(['status' => $r->status]))->statusLabel(),
                'count'  => $r->total,
            ]);

        // Top articles by downloads
        $topByDownloads = Article::whereNotNull('published_at')
            ->with(['journal', 'files'])
            ->get()
            ->map(fn ($a) => [
                'id'        => $a->id,
                'title'     => $a->title,
                'journal'   => $a->journal?->title,
                'downloads' => $a->files->sum('downloads_count'),
                'slug'      => $a->slug,
                'journal_slug' => $a->journal?->slug,
            ])
            ->sortByDesc('downloads')
            ->take(10)
            ->values();

        // Top articles by views
        $topByViews = ArticleView::select('article_id', DB::raw('count(*) as views'))
            ->groupBy('article_id')
            ->orderByDesc('views')
            ->limit(10)
            ->with('article.journal')
            ->get()
            ->map(fn ($r) => [
                'id'      => $r->article_id,
                'title'   => $r->article?->title,
                'journal' => $r->article?->journal?->title,
                'views'   => $r->views,
                'slug'    => $r->article?->slug,
                'journal_slug' => $r->article?->journal?->slug,
            ]);

        // Views per day (last 30 days)
        $viewsByDay = ArticleView::select(
            DB::raw('viewed_date as date'),
            DB::raw('count(*) as views')
        )
            ->where('viewed_date', '>=', today()->subDays(29))
            ->groupBy('viewed_date')
            ->orderBy('viewed_date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date->toDateString(), 'views' => $r->views]);

        // Recent activity
        $activity = ActivityLog::with('user')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'description' => $a->description,
                'user'        => $a->user?->name ?? 'System',
                'created_at'  => $a->created_at->diffForHumans(),
            ]);

        return Inertia::render('Metrics/Dashboard', [
            'kpis'           => $kpis,
            'byStatus'       => $byStatus,
            'topByDownloads' => $topByDownloads,
            'topByViews'     => $topByViews,
            'viewsByDay'     => $viewsByDay,
            'activity'       => $activity,
        ]);
    }
}
