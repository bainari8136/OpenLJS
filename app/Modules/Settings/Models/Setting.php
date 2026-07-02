<?php

namespace App\Modules\Settings\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = ['key', 'value'];

    public const DATE_FORMATS = [
        'Y-m-d' => '2026-07-02',
        'd/m/Y' => '02/07/2026',
        'm/d/Y' => '07/02/2026',
        'F j, Y' => 'July 2, 2026',
        'j F Y' => '2 July 2026',
    ];

    public static array $defaults = [
        // General
        'site_name' => 'OpenLJS',
        'site_tagline' => 'Open Journal System',
        'site_description' => '',
        'institution_name' => '',
        'contact_email' => '',
        'support_email' => '',

        // Submissions
        'max_file_size_mb' => '50',
        'default_review_days' => '21',
        'submissions_open' => '1',

        // Website
        'site_logo_path' => '',
        'site_favicon_path' => '',
        'footer_text' => '',
        'social_twitter' => '',
        'social_facebook' => '',
        'social_linkedin' => '',
        'social_instagram' => '',
        'maintenance_mode' => '0',
        'maintenance_message' => '',
        'site_url' => '',
        'default_timezone' => 'UTC',
        'default_date_format' => 'Y-m-d',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $record = static::find($key);
        if ($record !== null) {
            return $record->value;
        }

        return $default ?? static::$defaults[$key] ?? null;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function allKeyed(): array
    {
        $stored = static::all()->pluck('value', 'key')->toArray();

        return array_merge(static::$defaults, $stored);
    }
}
