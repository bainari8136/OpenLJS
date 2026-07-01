<?php

namespace App\Modules\Editorial\Models;

use App\Models\User;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EditorialDecision extends Model
{
    const DECISION_ACCEPT             = 'accept';
    const DECISION_REJECT             = 'reject';
    const DECISION_REQUEST_REVISION   = 'request_revision';
    const DECISION_SEND_BACK_TO_REVIEW = 'send_back_to_review';

    const FORMAL_DECISIONS = [
        self::DECISION_ACCEPT,
        self::DECISION_REJECT,
        self::DECISION_REQUEST_REVISION,
        self::DECISION_SEND_BACK_TO_REVIEW,
    ];

    protected $fillable = [
        'submission_id', 'editor_id', 'decision', 'comments', 'decided_at',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    public function decisionLabel(): string
    {
        return match ($this->decision) {
            self::DECISION_ACCEPT              => 'Accepted',
            self::DECISION_REJECT              => 'Rejected',
            self::DECISION_REQUEST_REVISION    => 'Revision Requested',
            self::DECISION_SEND_BACK_TO_REVIEW => 'Sent Back to Review',
            default                            => ucfirst($this->decision),
        };
    }
}
