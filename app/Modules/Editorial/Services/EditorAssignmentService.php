<?php

namespace App\Modules\Editorial\Services;

use App\Models\User;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Editorial\Models\EditorialAssignment;
use App\Modules\Submissions\Models\Submission;
use App\Notifications\EditorAssigned;

class EditorAssignmentService
{
    public function assign(Submission $submission, User $editor, User $assignedBy, string $role = 'editor'): EditorialAssignment
    {
        $assignment = EditorialAssignment::updateOrCreate(
            ['submission_id' => $submission->id, 'editor_id' => $editor->id],
            ['assigned_by' => $assignedBy->id, 'role' => $role, 'assigned_at' => now()]
        );

        if ($submission->status === Submission::STATUS_SUBMITTED ||
            $submission->status === Submission::STATUS_INITIAL_CHECK) {
            $submission->update(['status' => Submission::STATUS_EDITOR_ASSIGNED]);
        }

        ActivityLog::record(
            action: 'editorial.editor_assigned',
            subject: $submission,
            description: "{$assignedBy->name} assigned {$editor->name} as {$role}.",
            userId: $assignedBy->id,
            journalId: $submission->journal_id,
        );

        $editor->notify(new EditorAssigned($assignment->load('submission')));

        return $assignment;
    }

    public function unassign(Submission $submission, User $editor): void
    {
        EditorialAssignment::where('submission_id', $submission->id)
            ->where('editor_id', $editor->id)
            ->delete();

        ActivityLog::record(
            action: 'editorial.editor_unassigned',
            subject: $submission,
            description: "{$editor->name} was removed from this submission.",
            journalId: $submission->journal_id,
        );
    }

    public function availableEditors(Submission $submission): array
    {
        return User::role(['editor', 'section-editor', 'journal-manager'])
            ->orderBy('name')
            ->get()
            ->map(fn ($u) => [
                'id'          => $u->id,
                'name'        => $u->name,
                'email'       => $u->email,
                'roles'       => $u->getRoleNames(),
            ])
            ->toArray();
    }
}
