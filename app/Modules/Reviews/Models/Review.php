<?php

namespace App\Modules\Reviews\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    const RECOMMENDATION_ACCEPT         = 'accept';
    const RECOMMENDATION_MINOR_REVISION = 'minor_revision';
    const RECOMMENDATION_MAJOR_REVISION = 'major_revision';
    const RECOMMENDATION_REJECT         = 'reject';

    protected $fillable = [
        'review_assignment_id', 'recommendation',
        'comments_to_editor', 'comments_to_author', 'submitted_at',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ReviewAssignment::class, 'review_assignment_id');
    }

    public function recommendationLabel(): string
    {
        return match ($this->recommendation) {
            self::RECOMMENDATION_ACCEPT         => 'Accept',
            self::RECOMMENDATION_MINOR_REVISION => 'Minor Revision',
            self::RECOMMENDATION_MAJOR_REVISION => 'Major Revision',
            self::RECOMMENDATION_REJECT         => 'Reject',
            default                             => ucfirst($this->recommendation),
        };
    }
}
