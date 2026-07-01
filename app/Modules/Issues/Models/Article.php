<?php

namespace App\Modules\Issues\Models;

use App\Modules\Journals\Models\Journal;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    protected $fillable = [
        'submission_id', 'journal_id', 'issue_id',
        'title', 'abstract', 'keywords', 'doi', 'slug',
        'page_start', 'page_end', 'published_at',
    ];

    protected $casts = [
        'keywords'     => 'array',
        'published_at' => 'datetime',
    ];

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ArticleFile::class);
    }

    public function authors(): HasMany
    {
        return $this->hasMany(\App\Modules\Submissions\Models\SubmissionAuthor::class, 'submission_id', 'submission_id')
            ->orderBy('author_order');
    }

    public function toSearchableArray(): array
    {
        // Only real table columns — database driver does LIKE queries against these.
        // For Meilisearch in production, enrich with author/journal data.
        return [
            'title'    => $this->title ?? '',
            'abstract' => $this->abstract ?? '',
            'doi'      => $this->doi ?? '',
            'slug'     => $this->slug ?? '',
        ];
    }

    public function shouldBeSearchable(): bool
    {
        return $this->published_at !== null;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public static function generateSlug(string $title, int $journalId): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 2;
        while (self::where('journal_id', $journalId)->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }
}
