<?php

namespace App\Console\Commands;

use App\Modules\Plugins\Services\PluginManager;
use Illuminate\Console\Command;

class PluginDisableCommand extends Command
{
    protected $signature = 'plugin:disable {name} {--journal= : Journal ID to scope disablement to (omit for site-wide)}';

    protected $description = 'Disable a registered plugin, site-wide or for one journal';

    public function handle(PluginManager $plugins): int
    {
        $journalId = $this->option('journal') !== null ? (int) $this->option('journal') : null;

        $plugins->disable($this->argument('name'), $journalId);

        $this->info($journalId
            ? "Disabled '{$this->argument('name')}' for journal #{$journalId}."
            : "Disabled '{$this->argument('name')}' site-wide.");

        return self::SUCCESS;
    }
}
