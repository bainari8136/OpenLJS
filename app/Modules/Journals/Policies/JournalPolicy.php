<?php

namespace App\Modules\Journals\Policies;

use App\Models\User;
use App\Modules\Journals\Models\Journal;

class JournalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view-journals');
    }

    public function view(User $user, Journal $journal): bool
    {
        return $user->can('view-journals');
    }

    public function create(User $user): bool
    {
        return $user->can('manage-journals');
    }

    public function update(User $user, Journal $journal): bool
    {
        return $user->can('manage-journals');
    }

    public function delete(User $user, Journal $journal): bool
    {
        return $user->hasRole('super-admin');
    }

    public function manageSections(User $user, Journal $journal): bool
    {
        return $user->can('manage-journals');
    }
}
