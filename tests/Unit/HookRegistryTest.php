<?php

namespace Tests\Unit;

use App\Modules\Core\Facades\Hook;
use App\Modules\Core\Services\HookRegistry;
use Tests\TestCase;

class HookRegistryTest extends TestCase
{
    public function test_action_calls_every_listener_in_priority_order(): void
    {
        $order = [];

        Hook::listen('test.action', function () use (&$order) {
            $order[] = 'late';
        }, 512);

        Hook::listen('test.action', function () use (&$order) {
            $order[] = 'early';
        }, 10);

        Hook::action('test.action');

        $this->assertSame(['early', 'late'], $order);
    }

    public function test_filter_pipes_the_value_through_each_listener(): void
    {
        Hook::listen('test.filter', fn (array $fields) => [...$fields, 'identifier']);
        Hook::listen('test.filter', fn (array $fields) => [...$fields, 'title']);

        $result = Hook::filter('test.filter', ['creator']);

        $this->assertSame(['creator', 'identifier', 'title'], $result);
    }

    public function test_filter_with_no_listeners_returns_the_value_unchanged(): void
    {
        $this->assertSame('unchanged', Hook::filter('test.unused-filter', 'unchanged'));
    }

    public function test_has_listeners(): void
    {
        $registry = new HookRegistry;

        $this->assertFalse($registry->hasListeners('unused'));

        $registry->listen('used', fn () => null);

        $this->assertTrue($registry->hasListeners('used'));
    }
}
