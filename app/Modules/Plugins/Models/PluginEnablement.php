<?php

namespace App\Modules\Plugins\Models;

use App\Modules\Journals\Models\Journal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PluginEnablement extends Model
{
    protected $fillable = ['plugin_id', 'journal_id', 'enabled'];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public function plugin(): BelongsTo
    {
        return $this->belongsTo(Plugin::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
