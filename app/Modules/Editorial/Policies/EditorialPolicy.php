<?php

namespace App\Modules\Editorial\Policies;

use App\Models\User;
use App\Modules\Submissions\Models\Submission;

class EditorialPolicy
{
    public function assignEditor(User $user): bool
    {
        return $user->can('assign-editor');
    }

    public function makeDecision(User $user, Submission $submission): bool
    {
        return $user->can('make-editorial-decision');
    }

    public function initialCheck(User $user): bool
    {
        return $user->can('manage-submissions');
    }
}
