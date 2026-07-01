<?php

namespace App\Modules\Submissions\Models;

use App\Models\User;
use App\Modules\Editorial\Models\EditorialAssignment;
use App\Modules\Editorial\Models\EditorialDecision;
use App\Modules\Issues\Models\Article;
use App\Modules\Reviews\Models\ReviewAssignment;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Models\JournalSection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Submission extends Model
{
    use Searchable;

    protected $fillable = [
        'journal_id', 'section_id', 'submitting_author_id',
        'title', 'abstract', 'keywords',
        'status', 'current_stage', 'submitted_at',
    ];

    protected $casts = [
        'keywords'     => 'array',
        'submitted_at' => 'datetime',
    ];

    const STATUS_DRAFT            = 'draft';
    const STATUS_SUBMITTED        = 'submitted';
    const STATUS_INITIAL_CHECK    = 'initial_check';
    const STATUS_EDITOR_ASSIGNED  = 'editor_assigned';
    const STATUS_UNDER_REVIEW     = 'under_review';
    const STATUS_REVISION_REQUIRED = 'revision_required';
    const STATUS_REVISED          = 'revised';
    const STATUS_ACCEPTED         = 'accepted';
    const STATUS_REJECTED         = 'rejected';
    const STATUS_COPYEDITING      = 'copyediting';
    const STATUS_PRODUCTION       = 'production';
    const STATUS_SCHEDULED        = 'scheduled';
    const STATUS_PUBLISHED        = 'published';

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(JournalSection::class, 'section_id');
    }

    public function submittingAuthor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitting_author_id');
    }

    public function authors(): HasMany
    {
        return $this->hasMany(SubmissionAuthor::class)->orderBy('author_order');
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class)->latest();
    }

    public function submissionFiles(): HasMany
    {
        return $this->hasMany(SubmissionFile::class)->where('file_stage', 'submission')->latest();
    }

    public function editorialAssignments(): HasMany
    {
        return $this->hasMany(EditorialAssignment::class)->with('editor');
    }

    public function reviewAssignments(): HasMany
    {
        return $this->hasMany(ReviewAssignment::class)->with('reviewer', 'review')->latest();
    }

    public function editorialDecisions(): HasMany
    {
        return $this->hasMany(EditorialDecision::class)->with('editor')->latest('decided_at');
    }

    public function article(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Article::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(\App\Modules\Core\Models\ActivityLog::class, 'subject_id')
            ->where('subject_type', self::class)
            ->latest();
    }

    public function toSearchableArray(): array
    {
        // Only real table columns here — database driver does LIKE queries against these.
        // For Meilisearch in production, enrich this with author/journal data.
        return [
            'title'    => $this->title ?? '',
            'abstract' => $this->abstract ?? '',
            'status'   => $this->status ?? '',
        ];
    }

    public function shouldBeSearchable(): bool
    {
        // Only index non-draft submissions
        return $this->status !== self::STATUS_DRAFT;
    }

    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            'draft'             => 'Draft',
            'submitted'         => 'Submitted',
            'initial_check'     => 'Initial Check',
            'editor_assigned'   => 'Editor Assigned',
            'under_review'      => 'Under Review',
            'revision_required' => 'Revision Required',
            'revised'           => 'Revised',
            'accepted'          => 'Accepted',
            'rejected'          => 'Rejected',
            'copyediting'       => 'Copyediting',
            'production'        => 'Production',
            'scheduled'         => 'Scheduled',
            'published'         => 'Published',
            default             => ucfirst($this->status),
        };
    }
}
