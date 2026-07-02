<?php

namespace OpenLJS\Plugins\CrossrefDoi\Jobs;

use App\Modules\Issues\Models\Article;
use App\Modules\Plugins\Models\Plugin;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use OpenLJS\Plugins\CrossrefDoi\Models\CrossrefDeposit;
use OpenLJS\Plugins\CrossrefDoi\Support\DepositXmlBuilder;

class DepositCrossrefDoiJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $articleId, public string $doi) {}

    public function handle(DepositXmlBuilder $xmlBuilder): void
    {
        $article = Article::with(['journal', 'issue', 'submission.authors'])->find($this->articleId);

        if (! $article) {
            return;
        }

        $plugin = Plugin::where('name', 'crossref-doi')->first();
        $username = $plugin?->getSetting('crossref_username', null, $article->journal_id);
        $password = $plugin?->getSetting('crossref_password', null, $article->journal_id);

        $deposit = CrossrefDeposit::updateOrCreate(
            ['article_id' => $article->id],
            ['doi' => $this->doi, 'status' => 'pending'],
        );

        if (! $username || ! $password) {
            $deposit->update([
                'status' => 'skipped',
                'response_body' => 'No Crossref credentials configured for this journal — DOI generated but not deposited.',
            ]);

            return;
        }

        $xml = $xmlBuilder->build(
            $article,
            $this->doi,
            $plugin->getSetting('depositor_name', config('app.name'), $article->journal_id),
            $plugin->getSetting('depositor_email', config('mail.from.address'), $article->journal_id),
            $plugin->getSetting('registrant', $article->journal?->title ?? config('app.name'), $article->journal_id),
        );

        $response = Http::attach('fname', $xml, 'deposit.xml', ['Content-Type' => 'application/xml'])
            ->post('https://doi.crossref.org/servlet/deposit', [
                'operation' => 'doMDUpload',
                'login_id' => $username,
                'login_passwd' => $password,
            ]);

        $deposit->update([
            'status' => $response->successful() ? 'deposited' : 'failed',
            'response_status' => $response->status(),
            'response_body' => substr($response->body(), 0, 2000),
            'deposited_at' => $response->successful() ? now() : null,
        ]);
    }
}
