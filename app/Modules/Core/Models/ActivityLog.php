<?php

namespace App\Modules\Core\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id', 'journal_id', 'subject_type', 'subject_id',
        'action', 'description', 'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public static function record(
        string $action,
        Model $subject,
        string $description = '',
        ?int $userId = null,
        ?int $journalId = null,
        array $metadata = []
    ): self {
        return self::create([
            'user_id'      => $userId ?? auth()->id(),
            'journal_id'   => $journalId,
            'subject_type' => get_class($subject),
            'subject_id'   => $subject->getKey(),
            'action'       => $action,
            'description'  => $description,
            'metadata'     => $metadata ?: null,
        ]);
    }
}
