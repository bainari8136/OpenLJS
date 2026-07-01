<?php

namespace App\Modules\Issues\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleFile extends Model
{
    protected $fillable = [
        'article_id', 'label', 'file_type', 'storage_path', 'downloads_count',
    ];

    protected $casts = [
        'downloads_count' => 'integer',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function downloadUrl(): string
    {
        return route('issues.articles.download', [$this->article_id, $this->id]);
    }
}
