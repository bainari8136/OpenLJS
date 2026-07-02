<?php

namespace App\Modules\Journals\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class JournalCategory extends Model
{
    protected $fillable = [
        'journal_id', 'parent_id', 'name', 'slug', 'path', 'description',
        'article_ordering', 'cover_image_path', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (JournalCategory $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
            $category->path = $category->buildPath();
        });

        static::updating(function (JournalCategory $category) {
            if ($category->isDirty(['slug', 'parent_id'])) {
                $category->path = $category->buildPath();
            }
        });
    }

    protected function buildPath(): string
    {
        $parent = $this->parent_id ? static::find($this->parent_id) : null;

        return $parent ? "{$parent->path}/{$this->slug}" : $this->slug;
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }
}
