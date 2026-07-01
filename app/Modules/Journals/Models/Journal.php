<?php

namespace App\Modules\Journals\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Journal extends Model
{
    protected $fillable = [
        'title', 'slug', 'acronym', 'country', 'publisher', 'website_url',
        'description', 'author_guidelines', 'review_policy', 'issn_print',
        'issn_online', 'logo_path', 'cover_image_path', 'is_active',
        'submissions_enabled', 'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'submissions_enabled' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (Journal $journal) {
            if (empty($journal->slug)) {
                $journal->slug = Str::slug($journal->title);
            }
        });
    }

    public function sections(): HasMany
    {
        return $this->hasMany(JournalSection::class)->orderBy('sort_order');
    }

    public function activeSections(): HasMany
    {
        return $this->hasMany(JournalSection::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function userRoles(): HasMany
    {
        return $this->hasMany(JournalUserRole::class);
    }

    public function editorialMembers(): HasMany
    {
        return $this->hasMany(JournalEditorialMember::class)->orderBy('sort_order');
    }

    public function activeEditorialMembers(): HasMany
    {
        return $this->hasMany(JournalEditorialMember::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
