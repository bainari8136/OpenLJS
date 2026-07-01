<?php

namespace App\Modules\Submissions\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionAuthor extends Model
{
    protected $fillable = [
        'submission_id', 'user_id', 'name', 'email',
        'affiliation', 'country', 'orcid',
        'author_order', 'is_corresponding',
    ];

    protected $casts = [
        'is_corresponding' => 'boolean',
        'author_order'     => 'integer',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
