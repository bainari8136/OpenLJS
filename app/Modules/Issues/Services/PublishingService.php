<?php

namespace App\Modules\Issues\Services;

use App\Modules\Core\Facades\Hook;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\ArticleFile;
use App\Modules\Issues\Models\Issue;
use App\Modules\Journals\Models\Journal;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Models\SubmissionFile;
use App\Notifications\ArticlePublished;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PublishingService
{
    public function createIssue(Journal $journal, array $data): Issue
    {
        return Issue::create([
            'journal_id' => $journal->id,
            'title' => $data['title'],
            'volume' => $data['volume'] ?? null,
            'number' => $data['number'] ?? null,
            'year' => $data['year'],
            'description' => $data['description'] ?? null,
        ]);
    }

    public function updateIssue(Issue $issue, array $data): Issue
    {
        $issue->update([
            'title' => $data['title'],
            'volume' => $data['volume'] ?? null,
            'number' => $data['number'] ?? null,
            'year' => $data['year'],
            'description' => $data['description'] ?? null,
        ]);

        return $issue->fresh();
    }

    public function convertToArticle(Submission $submission): Article
    {
        if ($submission->status !== Submission::STATUS_SCHEDULED) {
            throw ValidationException::withMessages([
                'submission' => 'Only scheduled submissions can be converted to articles.',
            ]);
        }

        if (Article::where('submission_id', $submission->id)->exists()) {
            throw ValidationException::withMessages([
                'submission' => 'This submission has already been converted to an article.',
            ]);
        }

        return DB::transaction(function () use ($submission) {
            $article = Article::create([
                'submission_id' => $submission->id,
                'journal_id' => $submission->journal_id,
                'title' => $submission->title,
                'abstract' => $submission->abstract,
                'keywords' => $submission->keywords,
                'slug' => Article::generateSlug($submission->title, $submission->journal_id),
            ]);

            // Copy galley files to article_files
            $galleys = SubmissionFile::where('submission_id', $submission->id)
                ->where('file_stage', 'galley')
                ->get();

            foreach ($galleys as $galley) {
                $ext = strtolower(pathinfo($galley->original_name, PATHINFO_EXTENSION));
                $fileType = in_array($ext, ['pdf', 'html', 'xml', 'epub']) ? $ext : 'pdf';
                ArticleFile::create([
                    'article_id' => $article->id,
                    'label' => strtoupper($fileType),
                    'file_type' => $fileType,
                    'storage_path' => $galley->storage_path,
                ]);
            }

            ActivityLog::record(
                action: 'publishing.article_created',
                subject: $submission,
                description: "Submission converted to article: {$article->title}",
                journalId: $submission->journal_id,
            );

            return $article;
        });
    }

    public function assignToIssue(Article $article, Issue $issue): Article
    {
        abort_unless($article->journal_id === $issue->journal_id, 422);
        $article->update(['issue_id' => $issue->id]);

        return $article->fresh();
    }

    public function removeFromIssue(Article $article): Article
    {
        $article->update(['issue_id' => null]);

        return $article->fresh();
    }

    public function publishIssue(Issue $issue): Issue
    {
        if ($issue->is_published) {
            throw ValidationException::withMessages(['issue' => 'Issue is already published.']);
        }

        DB::transaction(function () use ($issue) {
            $now = now();
            $issue->update(['is_published' => true, 'published_at' => $now]);

            $issue->articles()->with(['journal', 'issue', 'submission.submittingAuthor'])->get()->each(function (Article $article) use ($now) {
                $article->update(['published_at' => $now]);
                $article->submission?->update(['status' => Submission::STATUS_PUBLISHED]);
                $article->submission?->submittingAuthor?->notify(new ArticlePublished($article));

                Hook::action('Issues::PublishingService::afterPublish', $article);
            });

            ActivityLog::record(
                action: 'publishing.issue_published',
                subject: $issue->journal,
                description: "Issue published: {$issue->label()}",
                journalId: $issue->journal_id,
            );
        });

        return $issue->fresh();
    }

    public function unpublishIssue(Issue $issue): Issue
    {
        DB::transaction(function () use ($issue) {
            $issue->update(['is_published' => false, 'published_at' => null]);
            $issue->articles()->update(['published_at' => null]);
        });

        return $issue->fresh();
    }
}
