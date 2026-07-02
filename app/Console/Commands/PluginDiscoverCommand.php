<?php

namespace App\Console\Commands;

use App\Modules\Plugins\Services\PluginManager;
use Illuminate\Console\Command;

class PluginDiscoverCommand extends Command
{
    protected $signature = 'plugin:discover';

    protected $description = 'Register every plugin listed in config/plugins.php (disabled by default)';

    public function handle(PluginManager $plugins): int
    {
        $discovered = $plugins->discover();

        if (empty($discovered)) {
            $this->info('No plugins registered in config/plugins.php.');

            return self::SUCCESS;
        }

        $this->table(
            ['Name', 'Category', 'Version'],
            array_map(fn ($plugin) => [$plugin->name, $plugin->category, $plugin->version], $discovered),
        );

        return self::SUCCESS;
    }
}
