<?php

namespace App\Modules\Editorial\Services;

use App\Models\User;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Validation\ValidationException;

class SubmissionStatusService
{
    private const TRANSITIONS = [
        'pass_initial_check' => [
            'from'        => [Submission::STATUS_SUBMITTED],
            'to'          => Submission::STATUS_INITIAL_CHECK,
            'description' => 'Passed initial screening.',
            'action'      => 'editorial.initial_check_passed',
        ],
        'send_to_review' => [
            'from'        => [Submission::STATUS_INITIAL_CHECK, Submission::STATUS_EDITOR_ASSIGNED],
            'to'          => Submission::STATUS_UNDER_REVIEW,
            'description' => 'Submission sent to peer review.',
            'action'      => 'editorial.sent_to_review',
        ],
        'request_revision' => [
            'from'        => [Submission::STATUS_UNDER_REVIEW, Submission::STATUS_REVISED],
            'to'          => Submission::STATUS_REVISION_REQUIRED,
            'description' => 'Revision requested from author.',
            'action'      => 'editorial.revision_requested',
        ],
        'accept' => [
            'from'        => [
                Submission::STATUS_UNDER_REVIEW,
                Submission::STATUS_REVISION_REQUIRED,
                Submission::STATUS_REVISED,
                Submission::STATUS_EDITOR_ASSIGNED,
            ],
            'to'          => Submission::STATUS_ACCEPTED,
            'description' => 'Submission accepted for publication.',
            'action'      => 'editorial.accepted',
        ],
        'reject' => [
            'from'        => [
                Submission::STATUS_SUBMITTED,
                Submission::STATUS_INITIAL_CHECK,
                Submission::STATUS_EDITOR_ASSIGNED,
                Submission::STATUS_UNDER_REVIEW,
                Submission::STATUS_REVISION_REQUIRED,
                Submission::STATUS_REVISED,
            ],
            'to'          => Submission::STATUS_REJECTED,
            'description' => 'Submission rejected.',
            'action'      => 'editorial.rejected',
        ],
        'send_back_to_review' => [
            'from'        => [Submission::STATUS_REVISED],
            'to'          => Submission::STATUS_UNDER_REVIEW,
            'description' => 'Revised submission sent back to peer review.',
            'action'      => 'editorial.sent_back_to_review',
        ],
        'move_to_copyediting' => [
            'from'        => [Submission::STATUS_ACCEPTED],
            'to'          => Submission::STATUS_COPYEDITING,
            'description' => 'Submission moved to copyediting.',
            'action'      => 'copyediting.started',
        ],
        'move_to_production' => [
            'from'        => [Submission::STATUS_COPYEDITING],
            'to'          => Submission::STATUS_PRODUCTION,
            'description' => 'Copyediting complete. Submission moved to production.',
            'action'      => 'production.started',
        ],
        'approve_for_scheduling' => [
            'from'        => [Submission::STATUS_PRODUCTION],
            'to'          => Submission::STATUS_SCHEDULED,
            'description' => 'Production complete. Submission scheduled for publication.',
            'action'      => 'production.scheduled',
        ],
    ];

    public function transition(Submission $submission, string $transition, User $editor, ?string $comments = null): Submission
    {
        $def = self::TRANSITIONS[$transition] ?? null;

        if (!$def) {
            throw ValidationException::withMessages(['transition' => 'Unknown transition.']);
        }

        if (!in_array($submission->status, $def['from'])) {
            throw ValidationException::withMessages([
                'transition' => "Cannot apply '{$transition}' from status '{$submission->status}'.",
            ]);
        }

        $submission->update(['status' => $def['to']]);

        ActivityLog::record(
            action: $def['action'],
            subject: $submission,
            description: $def['description'] . ($comments ? " Comments: {$comments}" : ''),
            userId: $editor->id,
            journalId: $submission->journal_id,
            metadata: $comments ? ['comments' => $comments] : [],
        );

        return $submission->fresh();
    }

    public function availableTransitions(Submission $submission): array
    {
        return collect(self::TRANSITIONS)
            ->filter(fn ($def) => in_array($submission->status, $def['from']))
            ->keys()
            ->values()
            ->toArray();
    }
}
