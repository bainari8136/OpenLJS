<?php

namespace App\Modules\Users\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->can('view-users');
    }

    public function view(User $auth, User $user): bool
    {
        return $auth->can('view-users') || $auth->id === $user->id;
    }

    public function update(User $auth, User $user): bool
    {
        return $auth->can('manage-users') || $auth->id === $user->id;
    }

    public function assignRoles(User $auth): bool
    {
        return $auth->can('assign-roles');
    }

    public function delete(User $auth, User $user): bool
    {
        return $auth->can('manage-users') && $auth->id !== $user->id;
    }
}
