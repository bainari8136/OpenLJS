<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // System
            'manage-system',
            'manage-journals',
            'view-journals',

            // Users
            'manage-users',
            'assign-roles',
            'view-users',

            // Submissions
            'submit-manuscript',
            'view-own-submissions',
            'view-all-submissions',
            'manage-submissions',
            'assign-editor',

            // Reviews
            'review-manuscript',
            'assign-reviewer',
            'manage-reviews',
            'view-reviews',

            // Editorial
            'make-editorial-decision',
            'request-revision',

            // Copyediting & Production
            'manage-copyediting',
            'manage-production',

            // Issues & Articles
            'manage-issues',
            'publish-articles',
            'view-published-articles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $rolePermissions = [
            'super-admin' => $permissions,

            'journal-manager' => [
                'manage-journals',
                'view-journals',
                'manage-users',
                'assign-roles',
                'view-users',
                'view-all-submissions',
                'manage-submissions',
                'assign-editor',
                'assign-reviewer',
                'manage-reviews',
                'view-reviews',
                'make-editorial-decision',
                'request-revision',
                'manage-copyediting',
                'manage-production',
                'manage-issues',
                'publish-articles',
                'view-published-articles',
            ],

            'editor' => [
                'view-journals',
                'view-users',
                'view-all-submissions',
                'manage-submissions',
                'assign-editor',
                'assign-reviewer',
                'manage-reviews',
                'view-reviews',
                'make-editorial-decision',
                'request-revision',
                'manage-copyediting',
                'manage-production',
                'manage-issues',
                'publish-articles',
                'view-published-articles',
            ],

            'section-editor' => [
                'view-journals',
                'view-users',
                'view-all-submissions',
                'manage-submissions',
                'assign-reviewer',
                'manage-reviews',
                'view-reviews',
                'make-editorial-decision',
                'request-revision',
                'view-published-articles',
            ],

            'author' => [
                'submit-manuscript',
                'view-own-submissions',
                'view-published-articles',
            ],

            'reviewer' => [
                'review-manuscript',
                'view-reviews',
                'view-published-articles',
            ],

            'copyeditor' => [
                'manage-copyediting',
                'view-published-articles',
            ],

            'production-editor' => [
                'manage-production',
                'publish-articles',
                'view-published-articles',
            ],

            'reader' => [
                'view-published-articles',
            ],
        ];

        foreach ($rolePermissions as $roleName => $rolePerms) {
            $role = Role::findByName($roleName);
            $role->syncPermissions($rolePerms);
        }
    }
}
