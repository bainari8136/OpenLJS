<?php

namespace Tests\Feature\Plugins;

use App\Models\User;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\Issue;
use App\Modules\Issues\Services\PublishingService;
use App\Modules\Journals\Models\Journal;
use App\Modules\Plugins\Models\Plugin;
use App\Modules\Plugins\Services\PluginManager;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Models\SubmissionAuthor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use OpenLJS\Plugins\CrossrefDoi\CrossrefDoiPlugin;
use OpenLJS\Plugins\CrossrefDoi\Jobs\DepositCrossrefDoiJob;
use OpenLJS\Plugins\CrossrefDoi\Models\CrossrefDeposit;
use Tests\TestCase;

class CrossrefDoiPluginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The plugin owns its schema — its migration lives outside
        // database/migrations, so RefreshDatabase doesn't pick it up.
        $this->artisan('migrate', [
            '--path' => 'plugins/generic/crossref-doi/database/migrations',
            '--force' => true,
        ]);
    }

    private function registerAndEnablePlugin(): Plugin
    {
        config(['plugins.registered' => [CrossrefDoiPlugin::class]]);

        $manager = app(PluginManager::class);
        $manager->discover();
        $manager->enable('crossref-doi');

        // AppServiceProvider::boot() already ran once (before this test body)
        // and found nothing enabled — enabling only takes effect on the next
        // boot in real request/response terms, so re-run it explicitly here.
        $manager->bootEnabled();

        return Plugin::where('name', 'crossref-doi')->firstOrFail();
    }

    private function makePublishableIssue(): Issue
    {
        $journal = Journal::create([
            'title' => 'Test Journal',
            'slug' => 'test-journal',
            'acronym' => 'TJ',
            'issn_online' => '1234-5678',
        ]);

        $issue = Issue::create([
            'journal_id' => $journal->id,
            'title' => 'Volume 1, Issue 2',
            'volume' => '1',
            'number' => '2',
            'year' => 2026,
        ]);

        $author = User::factory()->create();

        $submission = Submission::create([
            'journal_id' => $journal->id,
            'submitting_author_id' => $author->id,
            'title' => 'A Test Submission',
            'status' => Submission::STATUS_SCHEDULED,
        ]);

        SubmissionAuthor::create([
            'submission_id' => $submission->id,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'author_order' => 1,
        ]);

        Article::create([
            'submission_id' => $submission->id,
            'journal_id' => $journal->id,
            'issue_id' => $issue->id,
            'title' => 'A Test Article',
            'slug' => 'a-test-article',
        ]);

        return $issue;
    }

    public function test_publishing_an_issue_generates_a_doi_and_queues_a_deposit_when_the_plugin_is_enabled(): void
    {
        $plugin = $this->registerAndEnablePlugin();
        $plugin->putSetting('doi_prefix', '10.9999');

        $issue = $this->makePublishableIssue();

        Queue::fake();

        app(PublishingService::class)->publishIssue($issue);

        $article = Article::where('issue_id', $issue->id)->firstOrFail();

        $this->assertNotNull($article->doi);
        $this->assertStringStartsWith('10.9999/tj.v1i2.', $article->doi);

        Queue::assertPushed(
            DepositCrossrefDoiJob::class,
            fn (DepositCrossrefDoiJob $job) => $job->articleId === $article->id && $job->doi === $article->doi,
        );
    }

    public function test_publishing_does_not_generate_a_doi_when_the_plugin_has_no_prefix_configured(): void
    {
        $this->registerAndEnablePlugin();

        $issue = $this->makePublishableIssue();

        app(PublishingService::class)->publishIssue($issue);

        $article = Article::where('issue_id', $issue->id)->firstOrFail();

        $this->assertNull($article->doi);
    }

    public function test_publishing_does_nothing_when_the_plugin_is_registered_but_disabled(): void
    {
        config(['plugins.registered' => [CrossrefDoiPlugin::class]]);
        app(PluginManager::class)->discover(); // registered, left disabled

        $issue = $this->makePublishableIssue();

        Queue::fake();

        app(PublishingService::class)->publishIssue($issue);

        $article = Article::where('issue_id', $issue->id)->firstOrFail();

        $this->assertNull($article->doi);
        Queue::assertNotPushed(DepositCrossrefDoiJob::class);
    }

    public function test_oai_dublin_core_output_gets_a_relation_element_once_crossref_has_confirmed_a_deposit(): void
    {
        $this->registerAndEnablePlugin();
        $issue = $this->makePublishableIssue();
        $article = Article::where('issue_id', $issue->id)->firstOrFail();
        $article->update(['doi' => '10.9999/tj.v1i2.'.$article->id, 'published_at' => now()]);

        CrossrefDeposit::create([
            'article_id' => $article->id,
            'doi' => $article->doi,
            'status' => 'deposited',
            'deposited_at' => now(),
        ]);

        $identifier = 'oai:'.parse_url(config('app.url'), PHP_URL_HOST).':article/'.$article->id;

        $response = $this->get('/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier='.urlencode($identifier));

        $response->assertStatus(200);
        $response->assertSee("Registered with Crossref: https://doi.org/{$article->doi}", false);
        $response->assertSee("<dc:identifier>https://doi.org/{$article->doi}</dc:identifier>", false);
    }

    public function test_oai_output_has_no_relation_element_when_the_plugin_is_not_enabled(): void
    {
        $issue = $this->makePublishableIssue();
        $article = Article::where('issue_id', $issue->id)->firstOrFail();
        $article->update(['doi' => '10.9999/tj.v1i2.'.$article->id, 'published_at' => now()]);

        $identifier = 'oai:'.parse_url(config('app.url'), PHP_URL_HOST).':article/'.$article->id;

        $response = $this->get('/oai?verb=GetRecord&metadataPrefix=oai_dc&identifier='.urlencode($identifier));

        $response->assertStatus(200);
        $response->assertDontSee('Registered with Crossref', false);
    }
}
