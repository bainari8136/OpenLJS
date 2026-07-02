<?php

namespace OpenLJS\Plugins\CrossrefDoi;

use App\Modules\Core\Facades\Hook;
use App\Modules\Issues\Models\Article;
use App\Modules\Plugins\Contracts\GenericPluginInterface;
use App\Modules\Plugins\Models\Plugin;
use OpenLJS\Plugins\CrossrefDoi\Jobs\DepositCrossrefDoiJob;
use OpenLJS\Plugins\CrossrefDoi\Models\CrossrefDeposit;
use OpenLJS\Plugins\CrossrefDoi\Services\DoiGenerator;

class CrossrefDoiPlugin implements GenericPluginInterface
{
    public function name(): string
    {
        return 'crossref-doi';
    }

    public function displayName(): string
    {
        return 'Crossref DOI';
    }

    public function description(): string
    {
        return 'Generates DOIs for published articles from a per-journal pattern and deposits them with Crossref.';
    }

    public function version(): string
    {
        return '1.0.0';
    }

    public function boot(): void
    {
        Hook::listen('Issues::PublishingService::afterPublish', [$this, 'onArticlePublished']);
        Hook::listen('Oai::DublinCore::fields', [$this, 'addCrossrefRelation']);
    }

    /**
     * Fires once per article when an issue is published (see
     * PublishingService::publishIssue()). Generates a DOI from this
     * journal's configured pattern if the article doesn't already have one,
     * then queues the Crossref deposit.
     */
    public function onArticlePublished(Article $article): void
    {
        $plugin = $this->pluginModel();

        if (! $article->doi) {
            $prefix = $plugin->getSetting('doi_prefix', null, $article->journal_id);
            if (! $prefix) {
                return; // not configured for this journal — nothing to do
            }

            $pattern = $plugin->getSetting('doi_pattern', '%p/%j.v%vi%i.%a', $article->journal_id);
            $article->update(['doi' => app(DoiGenerator::class)->generate($article, $prefix, $pattern)]);
        }

        DepositCrossrefDoiJob::dispatch($article->id, $article->doi)->afterCommit();
    }

    /**
     * Oai::DublinCore::fields filter — adds a dc:relation element pointing at
     * the DOI once Crossref has actually confirmed the deposit (as opposed to
     * dc:identifier, which core already populates from articles.doi
     * regardless of whether this plugin — or any deposit — is involved).
     */
    public function addCrossrefRelation(array $fields, Article $article): array
    {
        $deposit = CrossrefDeposit::where('article_id', $article->id)
            ->where('status', 'deposited')
            ->first();

        if ($deposit) {
            $fields['relation'][] = "Registered with Crossref: https://doi.org/{$deposit->doi}";
        }

        return $fields;
    }

    private function pluginModel(): Plugin
    {
        return Plugin::where('name', $this->name())->firstOrFail();
    }
}
