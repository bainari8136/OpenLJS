<?php

namespace App\Modules\Core\Facades;

use App\Modules\Core\Services\HookRegistry;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void listen(string $hook, callable $listener, int $priority = 256)
 * @method static void clear(string $hook)
 * @method static bool hasListeners(string $hook)
 * @method static void action(string $hook, mixed ...$args)
 * @method static mixed filter(string $hook, mixed $value, mixed ...$args)
 *
 * @see HookRegistry
 */
class Hook extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'hook';
    }
}
