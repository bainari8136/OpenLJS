<?php

namespace App\Modules\Users\Services;

use App\Models\User;
use App\Modules\Journals\Models\JournalUserRole;
use Spatie\Permission\Models\Role;

class UserRoleService
{
    public function assignGlobalRole(User $user, string $role): void
    {
        $user->syncRoles([$role]);
    }

    public function assignJournalRole(User $user, int $journalId, string $roleName): void
    {
        JournalUserRole::firstOrCreate([
            'journal_id' => $journalId,
            'user_id'    => $user->id,
            'role_name'  => $roleName,
        ]);
    }

    public function removeJournalRole(User $user, int $journalId, string $roleName): void
    {
        JournalUserRole::where([
            'journal_id' => $journalId,
            'user_id'    => $user->id,
            'role_name'  => $roleName,
        ])->delete();
    }

    public function getUserJournalRoles(User $user, int $journalId): array
    {
        return JournalUserRole::where('journal_id', $journalId)
            ->where('user_id', $user->id)
            ->pluck('role_name')
            ->toArray();
    }

    public function availableRoles(): array
    {
        return Role::orderBy('name')->pluck('name')->toArray();
    }
}
