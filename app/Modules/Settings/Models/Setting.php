<?php

namespace App\Modules\Settings\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $primaryKey = 'key';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['key', 'value'];

    public static array $defaults = [
        // General
        'site_name'         => 'OpenLJS',
        'site_tagline'      => 'Open Journal System',
        'site_description'  => '',
        'institution_name'  => '',
        'contact_email'     => '',
        'support_email'     => '',

        // Submissions
        'max_file_size_mb'      => '50',
        'default_review_days'   => '21',
        'submissions_open'      => '1',
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
