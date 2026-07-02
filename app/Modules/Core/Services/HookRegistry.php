<?php

namespace App\Modules\Core\Services;

class HookRegistry
{
    /** @var array<string, array<int, array<int, callable>>> */
    protected array $listeners = [];

    public function listen(string $hook, callable $listener, int $priority = 256): void
    {
        $this->listeners[$hook][$priority][] = $listener;
    }

    public function clear(string $hook): void
    {
        unset($this->listeners[$hook]);
    }

    public function hasListeners(string $hook): bool
    {
        return ! empty($this->listeners[$hook]);
    }

    /**
     * Call every listener registered against $hook. Return values are ignored.
     */
    public function action(string $hook, mixed ...$args): void
    {
        foreach ($this->orderedListeners($hook) as $listener) {
            $listener(...$args);
        }
    }

    /**
     * Pipe $value through every listener registered against $hook, in priority
     * order, each receiving the previous listener's return value.
     */
    public function filter(string $hook, mixed $value, mixed ...$args): mixed
    {
        foreach ($this->orderedListeners($hook) as $listener) {
            $value = $listener($value, ...$args);
        }

        return $value;
    }

    /** @return array<int, callable> */
    protected function orderedListeners(string $hook): array
    {
        $buckets = $this->listeners[$hook] ?? [];
        ksort($buckets, SORT_NUMERIC);

        return array_merge(...array_values($buckets ?: [[]]));
    }
}
