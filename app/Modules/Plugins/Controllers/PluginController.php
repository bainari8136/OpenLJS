<?php

namespace App\Modules\Plugins\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Plugins\Models\Plugin;
use App\Modules\Plugins\Services\PluginManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PluginController extends Controller
{
    public function __construct(private PluginManager $plugins) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('manage-plugins'), 403);

        $plugins = Plugin::orderBy('category')->orderBy('name')->get()
            ->map(fn (Plugin $plugin) => [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'category' => $plugin->category,
                'version' => $plugin->version,
                'enabled' => $plugin->isEnabledFor(),
            ])
            ->groupBy('category');

        return Inertia::render('Plugins/Index', [
            'plugins' => $plugins,
        ]);
    }

    public function enable(Request $request, Plugin $plugin): RedirectResponse
    {
        abort_unless($request->user()->can('manage-plugins'), 403);

        $this->plugins->enable($plugin->name);

        return back()->with('success', "{$plugin->name} enabled.");
    }

    public function disable(Request $request, Plugin $plugin): RedirectResponse
    {
        abort_unless($request->user()->can('manage-plugins'), 403);

        $this->plugins->disable($plugin->name);

        return back()->with('success', "{$plugin->name} disabled.");
    }
}
