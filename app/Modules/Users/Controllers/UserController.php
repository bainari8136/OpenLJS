<?php

namespace App\Modules\Users\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Users\Requests\AssignRoleRequest;
use App\Modules\Users\Requests\UpdateUserRequest;
use App\Modules\Users\Services\UserRoleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(private UserRoleService $roleService) {}

    public function index(): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::with('roles')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn ($user) => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'affiliation' => $user->affiliation,
                'country'     => $user->country,
                'roles'       => $user->getRoleNames(),
                'created_at'  => $user->created_at->toDateString(),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function show(User $user): Response
    {
        $this->authorize('view', $user);

        return Inertia::render('Users/Show', [
            'user'           => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'affiliation' => $user->affiliation,
                'country'     => $user->country,
                'bio'         => $user->bio,
                'orcid'       => $user->orcid,
                'roles'       => $user->getRoleNames(),
                'created_at'  => $user->created_at->toDateString(),
            ],
            'availableRoles' => $this->roleService->availableRoles(),
            'canAssignRoles' => request()->user()->can('assign-roles'),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $user->update($request->validated());

        return back()->with('success', 'User updated.');
    }

    public function assignRole(AssignRoleRequest $request, User $user): RedirectResponse
    {
        $this->roleService->assignGlobalRole($user, $request->validated('role'));

        return back()->with('success', 'Role assigned.');
    }
}
