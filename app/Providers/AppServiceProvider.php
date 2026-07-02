<?php

namespace App\Providers;

use App\Models\User;
use App\Modules\Core\Services\HookRegistry;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Policies\JournalPolicy;
use App\Modules\Plugins\Services\PluginManager;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Policies\SubmissionPolicy;
use App\Modules\Users\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('hook', fn () => new HookRegistry);
        $this->app->singleton(HookRegistry::class, fn ($app) => $app->make('hook'));
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Journal::class, JournalPolicy::class);
        Gate::policy(Submission::class, SubmissionPolicy::class);

        // Super admin bypasses all gates
        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('super-admin')) {
                return true;
            }
        });

        $this->app->make(PluginManager::class)->bootEnabled();
    }
}
