<?php

namespace App\Modules\Plugins\Contracts;

interface PluginInterface
{
    /**
     * Unique, stable identifier for this plugin (used as the `plugins.name` key).
     */
    public function name(): string;

    public function displayName(): string;

    public function description(): string;

    public function version(): string;

    /**
     * Register this plugin's hook listeners. Called once per request, only for
     * plugins that are enabled for the current context.
     */
    public function boot(): void;
}
