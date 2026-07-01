<?php

namespace App\Modules\Journals\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEditorialMember extends Model
{
    protected $fillable = [
        'journal_id', 'name', 'title', 'affiliation', 'email', 'orcid', 'bio',
        'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
