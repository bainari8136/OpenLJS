<?php

namespace App\Console\Commands;

use App\Modules\Plugins\Services\PluginManager;
use Illuminate\Console\Command;

class PluginEnableCommand extends Command
{
    protected $signature = 'plugin:enable {name} {--journal= : Journal ID to scope enablement to (omit for site-wide)}';

    protected $description = 'Enable a registered plugin, site-wide or for one journal';

    public function handle(PluginManager $plugins): int
    {
        $journalId = $this->option('journal') !== null ? (int) $this->option('journal') : null;

        $plugins->enable($this->argument('name'), $journalId);

        $this->info($journalId
            ? "Enabled '{$this->argument('name')}' for journal #{$journalId}."
            : "Enabled '{$this->argument('name')}' site-wide.");

        return self::SUCCESS;
    }
}
