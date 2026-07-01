<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('manage-system'), 403);

        $settings = Setting::allKeyed();

        $mail = [
            'mailer'       => config('mail.default'),
            'host'         => config('mail.mailers.smtp.host', '—'),
            'port'         => config('mail.mailers.smtp.port', '—'),
            'from_address' => config('mail.from.address'),
            'from_name'    => config('mail.from.name'),
            'encryption'   => config('mail.mailers.smtp.encryption', 'none'),
        ];

        $system = [
            'php_version'      => PHP_VERSION,
            'laravel_version'  => app()->version(),
            'db_driver'        => config('database.default'),
            'queue_connection' => config('queue.default'),
            'scout_driver'     => config('scout.driver'),
            'storage_default'  => config('filesystems.default'),
            'app_env'          => config('app.env'),
            'app_debug'        => config('app.debug') ? 'true' : 'false',
            'app_url'          => config('app.url'),
        ];

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'mail'     => $mail,
            'system'   => $system,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->can('manage-system'), 403);

        $tab = $request->input('tab', 'general');

        if ($tab === 'general') {
            $data = $request->validate([
                'site_name'        => ['required', 'string', 'max:150'],
                'site_tagline'     => ['nullable', 'string', 'max:255'],
                'site_description' => ['nullable', 'string', 'max:2000'],
                'institution_name' => ['nullable', 'string', 'max:255'],
                'contact_email'    => ['nullable', 'email', 'max:255'],
                'support_email'    => ['nullable', 'email', 'max:255'],
            ]);
        } elseif ($tab === 'submissions') {
            $data = $request->validate([
                'max_file_size_mb'    => ['required', 'integer', 'min:1', 'max:500'],
                'default_review_days' => ['required', 'integer', 'min:1', 'max:365'],
                'submissions_open'    => ['required', 'boolean'],
            ]);
            $data['submissions_open'] = $data['submissions_open'] ? '1' : '0';
            $data['max_file_size_mb'] = (string) $data['max_file_size_mb'];
            $data['default_review_days'] = (string) $data['default_review_days'];
        } else {
            return back();
        }

        foreach ($data as $key => $value) {
            Setting::set($key, $value ?? '');
        }

        return back()->with('success', 'Settings saved.');
    }
}
