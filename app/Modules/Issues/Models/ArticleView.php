<?php

namespace App\Modules\Issues\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleView extends Model
{
    protected $fillable = ['article_id', 'ip_hash', 'viewed_date'];

    protected $casts = ['viewed_date' => 'date'];

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public static function record(Article $article, string $ip): bool
    {
        $hash = hash('sha256', $ip . '|' . today()->toDateString());

        try {
            self::firstOrCreate([
                'article_id'  => $article->id,
                'ip_hash'     => $hash,
                'viewed_date' => today(),
            ]);
            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}
