<?php

use OpenLJS\Plugins\CrossrefDoi\CrossrefDoiPlugin;

return [
    /*
    |--------------------------------------------------------------------
    | Registered plugins
    |--------------------------------------------------------------------
    |
    | Fully-qualified class names of every plugin available to this
    | installation, one per Composer package under plugins/<category>/<name>
    | (see PLUGINS.md §4). `php artisan plugin:discover` reads this list and
    | upserts each one into the `plugins` table, disabled by default.
    |
    */
    'registered' => [
        CrossrefDoiPlugin::class,
    ],
];
