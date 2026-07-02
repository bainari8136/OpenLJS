<?php

namespace Tests\Feature\Plugins;

use App\Modules\Core\Facades\Hook;
use App\Modules\Journals\Models\Journal;
use App\Modules\Plugins\Contracts\GenericPluginInterface;
use App\Modules\Plugins\Services\PluginManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PluginManagerTest extends TestCase
{
    use RefreshDatabase;

    public function test_discover_registers_configured_plugins_disabled_by_default(): void
    {
        config(['plugins.registered' => [ExamplePlugin::class]]);

        $plugins = app(PluginManager::class)->discover();

        $this->assertCount(1, $plugins);
        $this->assertSame('example', $plugins[0]->name);
        $this->assertSame('generic', $plugins[0]->category);
        $this->assertFalse($plugins[0]->isEnabledFor());
    }

    public function test_discover_is_idempotent(): void
    {
        config(['plugins.registered' => [ExamplePlugin::class]]);
        $plugins = app(PluginManager::class);

        $plugins->discover();
        $plugins->discover();

        $this->assertDatabaseCount('plugins', 1);
    }

    public function test_enable_and_disable_toggle_site_wide_state(): void
    {
        config(['plugins.registered' => [ExamplePlugin::class]]);
        $manager = app(PluginManager::class);
        $manager->discover();

        $this->assertFalse($manager->isEnabled('example'));

        $manager->enable('example');
        $this->assertTrue($manager->isEnabled('example'));

        $manager->disable('example');
        $this->assertFalse($manager->isEnabled('example'));
    }

    public function test_boot_enabled_only_boots_plugins_that_are_enabled(): void
    {
        config(['plugins.registered' => [ExamplePlugin::class]]);
        $manager = app(PluginManager::class);
        $manager->discover();

        $manager->bootEnabled();
        $this->assertFalse(Hook::hasListeners('example.booted'));

        $manager->enable('example');
        $manager->bootEnabled();
        $this->assertTrue(Hook::hasListeners('example.booted'));
    }

    public function test_get_setting_falls_back_from_journal_scoped_to_site_wide(): void
    {
        config(['plugins.registered' => [ExamplePlugin::class]]);
        $manager = app(PluginManager::class);
        $plugin = $manager->register(ExamplePlugin::class);

        $journalA = Journal::create(['title' => 'Journal A', 'slug' => 'journal-a']);
        $journalB = Journal::create(['title' => 'Journal B', 'slug' => 'journal-b']);

        $this->assertSame('fallback', $plugin->getSetting('mode', 'fallback', journalId: $journalA->id));

        $plugin->putSetting('mode', 'site-wide-value');
        $this->assertSame('site-wide-value', $plugin->getSetting('mode', 'fallback', journalId: $journalA->id));

        $plugin->putSetting('mode', 'journal-a-value', journalId: $journalA->id);
        $this->assertSame('journal-a-value', $plugin->getSetting('mode', 'fallback', journalId: $journalA->id));
        $this->assertSame('site-wide-value', $plugin->getSetting('mode', 'fallback', journalId: $journalB->id));
    }
}

class ExamplePlugin implements GenericPluginInterface
{
    public function name(): string
    {
        return 'example';
    }

    public function displayName(): string
    {
        return 'Example Plugin';
    }

    public function description(): string
    {
        return 'A plugin used only by PluginManagerTest.';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function boot(): void
    {
        Hook::listen('example.booted', fn () => null);
    }
}
