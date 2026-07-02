<?php

namespace App\Http\Middleware;

use App\Modules\Settings\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? [],
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'notifications' => fn () => $request->user() ? [
                'unread_count' => $request->user()->unreadNotifications()->count(),
                'recent' => $request->user()->notifications()->limit(8)->get()->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'Notification',
                    'body' => $n->data['body'] ?? '',
                    'url' => $n->data['url'] ?? null,
                    'read_at' => $n->read_at?->toIso8601String(),
                    'created_at' => $n->created_at->diffForHumans(),
                ]),
            ] : ['unread_count' => 0, 'recent' => []],
            'site' => function () {
                $settings = Setting::allKeyed();

                return [
                    'name' => $settings['site_name'] ?? 'OpenLJS',
                    'footer_text' => $settings['footer_text'] ?? '',
                    'social' => [
                        'twitter' => $settings['social_twitter'] ?? '',
                        'facebook' => $settings['social_facebook'] ?? '',
                        'linkedin' => $settings['social_linkedin'] ?? '',
                        'instagram' => $settings['social_instagram'] ?? '',
                    ],
                    'logo_url' => ! empty($settings['site_logo_path']) ? asset('storage/'.$settings['site_logo_path']) : null,
                    'favicon_url' => ! empty($settings['site_favicon_path']) ? asset('storage/'.$settings['site_favicon_path']) : null,
                ];
            },
        ];
    }
}
