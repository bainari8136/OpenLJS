<?php

namespace App\Modules\Reviews\Services;

use App\Models\User;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Reviews\Models\Review;
use App\Modules\Reviews\Models\ReviewAssignment;
use App\Modules\Submissions\Models\Submission;
use App\Notifications\ReviewerInvited;
use App\Notifications\ReviewerResponded;
use App\Notifications\ReviewSubmitted;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    public function invite(Submission $submission, User $reviewer, User $assignedBy, ?string $dueDate = null): ReviewAssignment
    {
        $existing = ReviewAssignment::where('submission_id', $submission->id)
            ->where('reviewer_id', $reviewer->id)
            ->whereNotIn('status', [ReviewAssignment::STATUS_DECLINED, ReviewAssignment::STATUS_CANCELLED])
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'reviewer_id' => 'This reviewer is already assigned to this submission.',
            ]);
        }

        $assignment = ReviewAssignment::create([
            'submission_id' => $submission->id,
            'reviewer_id'   => $reviewer->id,
            'assigned_by'   => $assignedBy->id,
            'status'        => ReviewAssignment::STATUS_INVITED,
            'due_date'      => $dueDate,
            'invited_at'    => now(),
        ]);

        ActivityLog::record(
            action: 'review.reviewer_invited',
            subject: $submission,
            description: "{$assignedBy->name} invited {$reviewer->name} to review this submission.",
            userId: $assignedBy->id,
            journalId: $submission->journal_id,
        );

        $reviewer->notify(new ReviewerInvited($assignment));

        return $assignment;
    }

    public function accept(ReviewAssignment $assignment): ReviewAssignment
    {
        $assignment->update([
            'status'       => ReviewAssignment::STATUS_ACCEPTED,
            'responded_at' => now(),
        ]);

        ActivityLog::record(
            action: 'review.invitation_accepted',
            subject: $assignment->submission,
            description: "{$assignment->reviewer->name} accepted the review invitation.",
            userId: $assignment->reviewer_id,
            journalId: $assignment->submission->journal_id,
        );

        $this->notifyEditors($assignment->fresh(['submission.editorialAssignments.editor']));

        return $assignment->fresh();
    }

    public function decline(ReviewAssignment $assignment, ?string $reason = null): ReviewAssignment
    {
        $assignment->update([
            'status'         => ReviewAssignment::STATUS_DECLINED,
            'responded_at'   => now(),
            'decline_reason' => $reason,
        ]);

        ActivityLog::record(
            action: 'review.invitation_declined',
            subject: $assignment->submission,
            description: "{$assignment->reviewer->name} declined the review invitation.",
            userId: $assignment->reviewer_id,
            journalId: $assignment->submission->journal_id,
        );

        $this->notifyEditors($assignment->fresh(['submission.editorialAssignments.editor']));

        return $assignment->fresh();
    }

    private function notifyEditors(ReviewAssignment $assignment): void
    {
        $assignment->submission->editorialAssignments->each(
            fn ($ea) => $ea->editor?->notify(new ReviewerResponded($assignment))
        );
    }

    public function submitReview(ReviewAssignment $assignment, array $data): Review
    {
        if ($assignment->status !== ReviewAssignment::STATUS_ACCEPTED) {
            throw ValidationException::withMessages([
                'review' => 'You must accept this review invitation before submitting a review.',
            ]);
        }

        $review = Review::create([
            'review_assignment_id' => $assignment->id,
            'recommendation'       => $data['recommendation'],
            'comments_to_editor'   => $data['comments_to_editor'] ?? null,
            'comments_to_author'   => $data['comments_to_author'] ?? null,
            'submitted_at'         => now(),
        ]);

        $assignment->update([
            'status'       => ReviewAssignment::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        $submission = $assignment->submission;

        ActivityLog::record(
            action: 'review.submitted',
            subject: $submission,
            description: "{$assignment->reviewer->name} submitted a review with recommendation: {$review->recommendationLabel()}.",
            userId: $assignment->reviewer_id,
            journalId: $submission->journal_id,
            metadata: ['recommendation' => $data['recommendation']],
        );

        // Notify assigned editors
        $submission->editorialAssignments->each(function ($editorial) use ($assignment) {
            $editorial->editor?->notify(new ReviewSubmitted($assignment));
        });

        return $review;
    }

    public function cancel(ReviewAssignment $assignment): void
    {
        $assignment->update(['status' => ReviewAssignment::STATUS_CANCELLED]);

        ActivityLog::record(
            action: 'review.cancelled',
            subject: $assignment->submission,
            description: "Review invitation to {$assignment->reviewer->name} was cancelled.",
            journalId: $assignment->submission->journal_id,
        );
    }

    public function availableReviewers(Submission $submission): array
    {
        $alreadyAssigned = ReviewAssignment::where('submission_id', $submission->id)
            ->whereNotIn('status', [ReviewAssignment::STATUS_DECLINED, ReviewAssignment::STATUS_CANCELLED])
            ->pluck('reviewer_id');

        return User::role('reviewer')
            ->whereNotIn('id', $alreadyAssigned)
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id'    => $u->id,
                'name'  => $u->name,
                'email' => $u->email,
            ])
            ->toArray();
    }
}
