<?php

namespace App\Modules\Issues\Models;

use App\Modules\Journals\Models\Journal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Issue extends Model
{
    protected $fillable = [
        'journal_id', 'title', 'volume', 'number', 'year',
        'description', 'cover_path', 'is_published', 'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'year'         => 'integer',
    ];

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class)->orderBy('page_start');
    }

    public function label(): string
    {
        $parts = [];
        if ($this->volume) $parts[] = "Vol. {$this->volume}";
        if ($this->number) $parts[] = "No. {$this->number}";
        $parts[] = "({$this->year})";
        return implode(' ', $parts);
    }
}
