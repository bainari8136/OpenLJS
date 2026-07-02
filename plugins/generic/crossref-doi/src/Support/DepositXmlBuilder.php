<?php

namespace OpenLJS\Plugins\CrossrefDoi\Support;

use App\Modules\Issues\Models\Article;

/**
 * Builds a minimal Crossref "journal_article" deposit (schema 4.4.2 subset).
 * Enough structure to be accepted by the Crossref deposit endpoint for a
 * straightforward journal article; does not attempt to cover every optional
 * element (abstracts, funding data, license refs, etc.) of the full schema.
 */
class DepositXmlBuilder
{
    public function build(Article $article, string $doi, string $depositorName, string $depositorEmail, string $registrant): string
    {
        $batchId = 'openljs-'.$article->id.'-'.now()->timestamp;
        $journalTitle = $this->e($article->journal?->title ?? '');
        $issn = $this->e($article->journal?->issn_online ?: $article->journal?->issn_print ?: '');
        $articleTitle = $this->e($article->title);
        $year = $this->e((string) ($article->published_at?->year ?? now()->year));
        $resourceUrl = $this->e(route('journal.article', [$article->journal?->slug ?? '', $article->slug]));
        $contributors = $this->contributors($article);
        $issnXml = $issn !== '' ? "<issn media_type=\"electronic\">{$issn}</issn>" : '';

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <doi_batch xmlns="http://www.crossref.org/schema/4.4.2" version="4.4.2">
          <head>
            <doi_batch_id>{$this->e($batchId)}</doi_batch_id>
            <timestamp>{$this->e((string) now()->timestamp)}</timestamp>
            <depositor>
              <depositor_name>{$this->e($depositorName)}</depositor_name>
              <email_address>{$this->e($depositorEmail)}</email_address>
            </depositor>
            <registrant>{$this->e($registrant)}</registrant>
          </head>
          <body>
            <journal>
              <journal_metadata>
                <full_title>{$journalTitle}</full_title>
                {$issnXml}
              </journal_metadata>
              <journal_article publication_type="full_text">
                <titles>
                  <title>{$articleTitle}</title>
                </titles>
                <contributors>
                  {$contributors}
                </contributors>
                <publication_date>
                  <year>{$year}</year>
                </publication_date>
                <doi_data>
                  <doi>{$this->e($doi)}</doi>
                  <resource>{$resourceUrl}</resource>
                </doi_data>
              </journal_article>
            </journal>
          </body>
        </doi_batch>
        XML;
    }

    private function contributors(Article $article): string
    {
        $authors = $article->submission?->authors ?? collect();

        return $authors->map(function ($author, $index) {
            $sequence = $index === 0 ? 'first' : 'additional';
            [$given, $surname] = $this->splitName($author->name);

            return "<person_name sequence=\"{$sequence}\" contributor_role=\"author\">"
                ."<given_name>{$this->e($given)}</given_name>"
                ."<surname>{$this->e($surname)}</surname>"
                .'</person_name>';
        })->implode("\n");
    }

    /** @return array{0: string, 1: string} */
    private function splitName(string $name): array
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [$name];
        $surname = array_pop($parts);

        return [implode(' ', $parts) ?: $surname, $surname];
    }

    private function e(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
