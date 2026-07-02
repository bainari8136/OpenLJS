<?php

namespace App\Modules\Plugins\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plugin extends Model
{
    protected $fillable = ['name', 'category', 'class', 'version', 'is_site_wide'];

    protected $casts = [
        'is_site_wide' => 'boolean',
    ];

    public function settings(): HasMany
    {
        return $this->hasMany(PluginSetting::class);
    }

    public function enablements(): HasMany
    {
        return $this->hasMany(PluginEnablement::class);
    }

    public function isEnabledFor(?int $journalId = null): bool
    {
        return (bool) $this->enablements()
            ->where('journal_id', $journalId)
            ->value('enabled');
    }

    public function setEnabledFor(bool $enabled, ?int $journalId = null): void
    {
        $this->enablements()->updateOrCreate(
            ['journal_id' => $journalId],
            ['enabled' => $enabled],
        );
    }

    /**
     * A journal-scoped lookup falls back to the site-wide (journal_id = null)
     * setting when there's no per-journal override, then to $default.
     */
    public function getSetting(string $key, mixed $default = null, ?int $journalId = null): mixed
    {
        if ($journalId !== null) {
            $value = $this->settings()->where('journal_id', $journalId)->where('key', $key)->value('value');
            if ($value !== null) {
                return $value;
            }
        }

        $siteWide = $this->settings()->whereNull('journal_id')->where('key', $key)->value('value');

        return $siteWide ?? $default;
    }

    public function putSetting(string $key, mixed $value, ?int $journalId = null): void
    {
        $this->settings()->updateOrCreate(
            ['journal_id' => $journalId, 'key' => $key],
            ['value' => $value],
        );
    }
}
