<?php

namespace App\Console\Commands;

use App\Modules\Plugins\Models\Plugin;
use Illuminate\Console\Command;

class PluginMigrateCommand extends Command
{
    protected $signature = 'plugin:migrate {name}';

    protected $description = "Run a registered plugin's own migrations (plugins/<category>/<name>/database/migrations)";

    public function handle(): int
    {
        $plugin = Plugin::where('name', $this->argument('name'))->first();

        if (! $plugin) {
            $this->error("No plugin named '{$this->argument('name')}' is registered. Run plugin:discover first.");

            return self::FAILURE;
        }

        $path = "plugins/{$plugin->category}/{$plugin->name}/database/migrations";

        if (! is_dir(base_path($path))) {
            $this->info("{$plugin->name} has no migrations directory ({$path}) — nothing to do.");

            return self::SUCCESS;
        }

        $this->call('migrate', ['--path' => $path, '--force' => true]);

        return self::SUCCESS;
    }
}
