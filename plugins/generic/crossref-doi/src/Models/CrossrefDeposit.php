<?php

namespace OpenLJS\Plugins\CrossrefDoi\Models;

use App\Modules\Issues\Models\Article;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CrossrefDeposit extends Model
{
    protected $table = 'crossref_doi_deposits';

    protected $fillable = [
        'article_id', 'doi', 'status', 'response_status', 'response_body', 'deposited_at',
    ];

    protected $casts = [
        'deposited_at' => 'datetime',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
