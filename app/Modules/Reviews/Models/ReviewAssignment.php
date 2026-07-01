<?php

namespace App\Modules\Reviews\Models;

use App\Models\User;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ReviewAssignment extends Model
{
    const STATUS_INVITED   = 'invited';
    const STATUS_ACCEPTED  = 'accepted';
    const STATUS_DECLINED  = 'declined';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'submission_id', 'reviewer_id', 'assigned_by',
        'status', 'due_date', 'decline_reason',
        'invited_at', 'responded_at', 'completed_at',
    ];

    protected $casts = [
        'due_date'     => 'date',
        'invited_at'   => 'datetime',
        'responded_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function statusLabel(): string
    {
        return match ($this->status) {
            self::STATUS_INVITED   => 'Invited',
            self::STATUS_ACCEPTED  => 'Accepted',
            self::STATUS_DECLINED  => 'Declined',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELLED => 'Cancelled',
            default                => ucfirst($this->status),
        };
    }
}
