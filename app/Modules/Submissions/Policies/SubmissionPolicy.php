<?php

namespace App\Modules\Submissions\Policies;

use App\Models\User;
use App\Modules\Submissions\Models\Submission;

class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view-own-submissions') || $user->can('view-all-submissions');
    }

    public function view(User $user, Submission $submission): bool
    {
        if ($user->can('view-all-submissions')) return true;
        return $submission->submitting_author_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('submit-manuscript');
    }

    public function update(User $user, Submission $submission): bool
    {
        if ($user->can('manage-submissions')) return true;
        return $submission->submitting_author_id === $user->id && $submission->isDraft();
    }

    public function uploadFile(User $user, Submission $submission): bool
    {
        if ($user->can('manage-submissions')) return true;
        return $submission->submitting_author_id === $user->id;
    }

    public function downloadFile(User $user, Submission $submission): bool
    {
        if ($user->can('view-all-submissions')) return true;
        return $submission->submitting_author_id === $user->id;
    }
}
