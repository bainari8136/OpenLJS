<?php

namespace App\Modules\Plugins\Services;

use App\Modules\Plugins\Contracts\BlockPluginInterface;
use App\Modules\Plugins\Contracts\GatewayPluginInterface;
use App\Modules\Plugins\Contracts\GenericPluginInterface;
use App\Modules\Plugins\Contracts\PluginInterface;
use App\Modules\Plugins\Models\Plugin;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class PluginManager
{
    /**
     * Read the configured plugin class list (config/plugins.php) and upsert
     * each one into the `plugins` table. Newly-discovered plugins are
     * registered disabled — an explicit enable step is always required.
     *
     * This is the "disk" side of the disk/DB split described in PLUGINS.md §4:
     * it only runs when an operator asks for it (artisan command), never on
     * every request.
     *
     * @return Plugin[]
     */
    public function discover(): array
    {
        $discovered = [];

        foreach (config('plugins.registered', []) as $class) {
            $discovered[] = $this->register($class);
        }

        return $discovered;
    }

    public function register(string $class): Plugin
    {
        $instance = $this->instantiate($class);

        return Plugin::updateOrCreate(
            ['name' => $instance->name()],
            [
                'category' => $this->categoryFor($instance),
                'class' => $class,
                'version' => $instance->version(),
            ],
        );
    }

    public function enable(string $name, ?int $journalId = null): void
    {
        $this->findOrFail($name)->setEnabledFor(true, $journalId);
    }

    public function disable(string $name, ?int $journalId = null): void
    {
        $this->findOrFail($name)->setEnabledFor(false, $journalId);
    }

    public function isEnabled(string $name, ?int $journalId = null): bool
    {
        return $this->findOrFail($name)->isEnabledFor($journalId);
    }

    /**
     * Instantiate and boot() every plugin enabled for the given context.
     * Site-wide (journal_id = null) plugins boot on every request; a
     * journal-scoped $journalId additionally boots plugins enabled for that
     * journal. Safe to call before migrations have run (fresh install).
     */
    public function bootEnabled(?int $journalId = null): void
    {
        if (! Schema::hasTable('plugins')) {
            return;
        }

        $query = Plugin::query()->whereHas('enablements', function ($q) use ($journalId) {
            $q->where('enabled', true)->where('journal_id', $journalId);
        });

        if ($journalId !== null) {
            $query->orWhereHas('enablements', function ($q) {
                $q->where('enabled', true)->whereNull('journal_id');
            });
        }

        foreach ($query->get() as $plugin) {
            $this->instantiate($plugin->class)->boot();
        }
    }

    protected function instantiate(string $class): PluginInterface
    {
        $instance = app($class);

        if (! $instance instanceof PluginInterface) {
            throw new InvalidArgumentException("{$class} must implement PluginInterface.");
        }

        return $instance;
    }

    protected function categoryFor(PluginInterface $instance): string
    {
        return match (true) {
            $instance instanceof BlockPluginInterface => 'blocks',
            $instance instanceof GatewayPluginInterface => 'gateways',
            $instance instanceof GenericPluginInterface => 'generic',
            default => throw new InvalidArgumentException(
                $instance::class.' must implement one of the category interfaces (Generic/Block/Gateway).'
            ),
        };
    }

    protected function findOrFail(string $name): Plugin
    {
        return Plugin::where('name', $name)->firstOrFail();
    }
}
