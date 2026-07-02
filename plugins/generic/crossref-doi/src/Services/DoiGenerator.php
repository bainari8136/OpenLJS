<?php

namespace OpenLJS\Plugins\CrossrefDoi\Services;

use App\Modules\Issues\Models\Article;
use Illuminate\Support\Str;

class DoiGenerator
{
    /**
     * Expand a DOI pattern for an article. Supported tokens:
     *   %p  DOI prefix (e.g. "10.1234")
     *   %j  journal acronym (slugified), falls back to the journal title
     *   %v  issue volume
     *   %i  issue number
     *   %a  article id
     */
    public function generate(Article $article, string $prefix, string $pattern): string
    {
        $journal = $article->journal;
        $issue = $article->issue;

        return strtr($pattern, [
            '%p' => trim($prefix, '/'),
            '%j' => Str::slug($journal?->acronym ?: $journal?->title ?: 'journal'),
            '%v' => (string) ($issue?->volume ?? '0'),
            '%i' => (string) ($issue?->number ?? '0'),
            '%a' => (string) $article->id,
        ]);
    }
}
