<?php

namespace App\Modules\Plugins\Models;

use App\Modules\Journals\Models\Journal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PluginSetting extends Model
{
    protected $fillable = ['plugin_id', 'journal_id', 'key', 'value'];

    public function plugin(): BelongsTo
    {
        return $this->belongsTo(Plugin::class);
    }

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class);
    }
}
