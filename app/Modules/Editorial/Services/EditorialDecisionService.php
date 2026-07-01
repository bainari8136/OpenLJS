<?php

namespace App\Modules\Editorial\Services;

use App\Models\User;
use App\Modules\Editorial\Models\EditorialDecision;
use App\Modules\Submissions\Models\Submission;
use App\Notifications\DecisionMadeNotification;

class EditorialDecisionService
{
    public function record(Submission $submission, User $editor, string $decision, ?string $comments = null): EditorialDecision
    {
        $record = EditorialDecision::create([
            'submission_id' => $submission->id,
            'editor_id'     => $editor->id,
            'decision'      => $decision,
            'comments'      => $comments,
            'decided_at'    => now(),
        ]);

        // Notify the submitting author
        $submission->load('submittingAuthor');
        $submission->submittingAuthor?->notify(new DecisionMadeNotification($record));

        return $record;
    }

    public function isFormalDecision(string $transition): bool
    {
        return in_array($transition, EditorialDecision::FORMAL_DECISIONS);
    }
}
