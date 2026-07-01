<?php

namespace App\Modules\Oai\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Journals\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class OaiController extends Controller
{
    private const PAGE_SIZE = 100;

    public function __invoke(Request $request): Response
    {
        $verb = $request->get('verb', '');

        $xml = match ($verb) {
            'Identify'            => $this->identify($request),
            'ListMetadataFormats' => $this->listMetadataFormats($request),
            'ListSets'            => $this->listSets($request),
            'ListIdentifiers'     => $this->listIdentifiers($request),
            'ListRecords'         => $this->listRecords($request),
            'GetRecord'           => $this->getRecord($request),
            default               => $this->error($request, 'badVerb', 'Illegal OAI verb.'),
        };

        return response($xml, 200, ['Content-Type' => 'text/xml; charset=utf-8']);
    }

    // -------------------------------------------------------------------------

    private function identify(Request $request): string
    {
        $earliest = Article::whereNotNull('published_at')->min('published_at') ?? now()->toIso8601String();

        return $this->envelope($request, 'Identify', <<<XML
        <repositoryName>{$this->e(config('app.name'))}</repositoryName>
        <baseURL>{$this->e(route('oai'))}</baseURL>
        <protocolVersion>2.0</protocolVersion>
        <adminEmail>{$this->e(config('mail.from.address'))}</adminEmail>
        <earliestDatestamp>{$this->toOaiDate($earliest)}</earliestDatestamp>
        <deletedRecord>no</deletedRecord>
        <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
        XML);
    }

    private function listMetadataFormats(Request $request): string
    {
        return $this->envelope($request, 'ListMetadataFormats', <<<XML
        <metadataFormat>
          <metadataPrefix>oai_dc</metadataPrefix>
          <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
          <metadataNamespace>http://purl.org/dc/elements/1.1/</metadataNamespace>
        </metadataFormat>
        XML);
    }

    private function listSets(Request $request): string
    {
        $sets = Journal::where('is_active', true)->orderBy('title')->get()
            ->map(fn ($j) => "<set><setSpec>journal:{$j->id}</setSpec><setName>{$this->e($j->title)}</setName></set>")
            ->implode("\n");

        if (empty(trim($sets))) {
            return $this->error($request, 'noSetHierarchy', 'No sets are available.');
        }

        return $this->envelope($request, 'ListSets', $sets);
    }

    private function listIdentifiers(Request $request): string
    {
        [$query, $error] = $this->buildArticleQuery($request);
        if ($error) return $error;

        [$articles, $token] = $this->paginate($query, $request->get('resumptionToken'));

        if ($articles->isEmpty()) {
            return $this->error($request, 'noRecordsMatch', 'No records match the given criteria.');
        }

        $headers = $articles->map(fn ($a) => $this->articleHeader($a))->implode("\n");
        $tokenXml = $token ? "<resumptionToken>{$token}</resumptionToken>" : '';

        return $this->envelope($request, 'ListIdentifiers', $headers . "\n" . $tokenXml);
    }

    private function listRecords(Request $request): string
    {
        [$query, $error] = $this->buildArticleQuery($request);
        if ($error) return $error;

        [$articles, $token] = $this->paginate($query->with(['journal', 'issue', 'files', 'submission.authors']), $request->get('resumptionToken'));

        if ($articles->isEmpty()) {
            return $this->error($request, 'noRecordsMatch', 'No records match the given criteria.');
        }

        $records  = $articles->map(fn ($a) => $this->articleRecord($a))->implode("\n");
        $tokenXml = $token ? "<resumptionToken>{$token}</resumptionToken>" : '';

        return $this->envelope($request, 'ListRecords', $records . "\n" . $tokenXml);
    }

    private function getRecord(Request $request): string
    {
        $prefix = $request->get('metadataPrefix', '');
        if ($prefix !== 'oai_dc') {
            return $this->error($request, 'cannotDisseminateFormat', 'Only oai_dc is supported.');
        }

        $identifier = $request->get('identifier', '');
        $id = $this->parseIdentifier($identifier);
        if (!$id) {
            return $this->error($request, 'idDoesNotExist', 'The identifier does not exist.');
        }

        $article = Article::with(['journal', 'issue', 'files', 'submission.authors'])
            ->whereNotNull('published_at')
            ->find($id);

        if (!$article) {
            return $this->error($request, 'idDoesNotExist', 'The identifier does not exist.');
        }

        return $this->envelope($request, 'GetRecord', $this->articleRecord($article));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function buildArticleQuery(Request $request): array
    {
        $prefix = $request->get('metadataPrefix', '');
        if ($prefix && $prefix !== 'oai_dc') {
            return [null, $this->error($request, 'cannotDisseminateFormat', 'Only oai_dc is supported.')];
        }

        $query = Article::whereNotNull('published_at')->orderBy('published_at');

        if ($from = $request->get('from')) {
            $query->whereDate('published_at', '>=', $from);
        }
        if ($until = $request->get('until')) {
            $query->whereDate('published_at', '<=', $until);
        }
        if ($set = $request->get('set')) {
            if (str_starts_with($set, 'journal:')) {
                $journalId = (int) substr($set, 8);
                $query->where('journal_id', $journalId);
            }
        }

        return [$query, null];
    }

    private function paginate($query, ?string $token): array
    {
        $offset = 0;
        if ($token) {
            $decoded = base64_decode($token, strict: true);
            $offset  = (int) ($decoded ?: 0);
        }

        $total    = $query->count();
        $articles = $query->skip($offset)->take(self::PAGE_SIZE)->get();
        $nextOffset = $offset + self::PAGE_SIZE;
        $nextToken  = $nextOffset < $total ? base64_encode((string) $nextOffset) : null;

        return [$articles, $nextToken];
    }

    private function articleHeader(Article $a): string
    {
        return sprintf(
            '<header><identifier>%s</identifier><datestamp>%s</datestamp></header>',
            $this->e($this->makeIdentifier($a)),
            $this->toOaiDate($a->published_at)
        );
    }

    private function articleRecord(Article $a): string
    {
        $authors = $a->submission?->authors->map(fn ($au) => "<dc:creator>{$this->e($au->name)}</dc:creator>")->implode("\n") ?? '';
        $keywords = collect($a->keywords ?? [])->map(fn ($kw) => "<dc:subject>{$this->e($kw)}</dc:subject>")->implode("\n");
        $identifier = $a->doi ? "<dc:identifier>https://doi.org/{$this->e($a->doi)}</dc:identifier>"
            : "<dc:identifier>{$this->e(route('journal.article', [$a->journal?->slug ?? '', $a->slug]))}</dc:identifier>";

        return <<<XML
        <record>
          {$this->articleHeader($a)}
          <metadata>
            <oai_dc:dc
              xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
              xmlns:dc="http://purl.org/dc/elements/1.1/"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
              <dc:title>{$this->e($a->title)}</dc:title>
              {$authors}
              <dc:description>{$this->e($a->abstract ?? '')}</dc:description>
              {$keywords}
              <dc:date>{$this->toOaiDate($a->published_at)}</dc:date>
              <dc:type>journal article</dc:type>
              <dc:source>{$this->e($a->journal?->title ?? '')}</dc:source>
              <dc:language>en</dc:language>
              {$identifier}
            </oai_dc:dc>
          </metadata>
        </record>
        XML;
    }

    private function envelope(Request $request, string $verb, string $inner): string
    {
        $date = now()->toIso8601String();
        $url  = $this->e(route('oai'));

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
          <responseDate>{$date}</responseDate>
          <request verb="{$verb}">{$url}</request>
          <{$verb}>
            {$inner}
          </{$verb}>
        </OAI-PMH>
        XML;
    }

    private function error(Request $request, string $code, string $message): string
    {
        $date = now()->toIso8601String();
        $url  = $this->e(route('oai'));

        return <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
          <responseDate>{$date}</responseDate>
          <request>{$url}</request>
          <error code="{$code}">{$this->e($message)}</error>
        </OAI-PMH>
        XML;
    }

    private function makeIdentifier(Article $a): string
    {
        return 'oai:' . parse_url(config('app.url'), PHP_URL_HOST) . ':article/' . $a->id;
    }

    private function parseIdentifier(string $identifier): ?int
    {
        if (preg_match('/^oai:[^:]+:article\/(\d+)$/', $identifier, $m)) {
            return (int) $m[1];
        }
        return null;
    }

    private function toOaiDate(mixed $date): string
    {
        if (!$date) return now()->toIso8601String();
        if (is_string($date)) $date = \Carbon\Carbon::parse($date);
        return $date->toIso8601String();
    }

    private function e(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
