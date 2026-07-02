<?php

namespace App\Modules\Journals\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class JournalSection extends Model
{
    protected $fillable = [
        'journal_id', 'title', 'abbreviation', 'slug', 'description', 'policy',
        'submission_guidelines', 'word_count_limit', 'identify_as',
        'is_peer_reviewed', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_peer_reviewed' => 'boolean',
        'sort_order' => 'integer',
        'word_count_limit' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (JournalSection $section) {
            if (empty($section->slug)) {
                $section->slug = Str::slug($section->title);
            }
        });
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
