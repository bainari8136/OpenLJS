<?php

namespace App\Modules\Plugins\Contracts;

interface GatewayPluginInterface extends PluginInterface
{
    /**
     * Route definitions this plugin owns, mounted under
     * /j/{journal:slug}/plugin/{name}/... Same shape as Route::get()/post()
     * arguments: [['GET', 'uri', [Handler::class, 'method']], ...].
     */
    public function routes(): array;
}
