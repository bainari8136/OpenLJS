<?php

namespace App\Http\Middleware;

use App\Modules\Settings\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Route patterns that stay reachable for guests during maintenance:
     * auth flows (so admins can still log in) and machine-readable feeds/harvesting endpoints.
     */
    protected array $except = [
        'login', 'register', 'logout', 'forgot-password', 'reset-password/*', 'verify-email/*', 'confirm-password',
        'oai', 'j/*/feed/*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            return $next($request);
        }

        $settings = Setting::allKeyed();

        if (($settings['maintenance_mode'] ?? '0') !== '1') {
            return $next($request);
        }

        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                return $next($request);
            }
        }

        return Inertia::render('Maintenance', [
            'message' => $settings['maintenance_message'] ?? '',
        ])->toResponse($request)->setStatusCode(503);
    }
}
