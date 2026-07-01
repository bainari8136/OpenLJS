<?php

namespace App\Modules\Feeds\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Issues\Models\Article;
use App\Modules\Issues\Models\Issue;
use App\Modules\Journals\Models\Journal;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;

class FeedController extends Controller
{
    private const ITEM_LIMIT = 30;

    public function journalRss(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return $this->rss(
            title: $journal->title,
            link: route('journal.home', $journal->slug),
            selfUrl: route('journal.feed.rss', $journal->slug),
            description: $journal->description ?? "Latest articles from {$journal->title}",
            articles: $this->latestArticles($journal),
        );
    }

    public function journalAtom(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return $this->atom(
            title: $journal->title,
            link: route('journal.home', $journal->slug),
            selfUrl: route('journal.feed.atom', $journal->slug),
            articles: $this->latestArticles($journal),
        );
    }

    public function issueRss(Journal $journal, Issue $issue): Response
    {
        abort_unless($journal->is_active, 404);
        abort_unless($issue->journal_id === $journal->id && $issue->is_published, 404);

        return $this->rss(
            title: "{$journal->title} — {$issue->label()}",
            link: route('journal.archive', $journal->slug),
            selfUrl: route('journal.issue.feed.rss', [$journal->slug, $issue->id]),
            description: $issue->description ?? "Table of contents for {$issue->label()}",
            articles: $this->issueArticles($issue),
        );
    }

    public function issueAtom(Journal $journal, Issue $issue): Response
    {
        abort_unless($journal->is_active, 404);
        abort_unless($issue->journal_id === $journal->id && $issue->is_published, 404);

        return $this->atom(
            title: "{$journal->title} — {$issue->label()}",
            link: route('journal.archive', $journal->slug),
            selfUrl: route('journal.issue.feed.atom', [$journal->slug, $issue->id]),
            articles: $this->issueArticles($issue),
        );
    }

    // -------------------------------------------------------------------------

    private function latestArticles(Journal $journal): Collection
    {
        return Article::where('journal_id', $journal->id)
            ->whereNotNull('published_at')
            ->with(['journal', 'submission.authors'])
            ->orderByDesc('published_at')
            ->limit(self::ITEM_LIMIT)
            ->get();
    }

    private function issueArticles(Issue $issue): Collection
    {
        return $issue->articles()
            ->whereNotNull('published_at')
            ->with(['journal', 'submission.authors'])
            ->get();
    }

    private function rss(string $title, string $link, string $selfUrl, string $description, Collection $articles): Response
    {
        $items = $articles->map(fn (Article $a) => $this->rssItem($a))->implode("\n");
        $lastBuildDate = $articles->max('published_at')?->toRfc2822String() ?? now()->toRfc2822String();

        $xml = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
          <channel>
            <title>{$this->e($title)}</title>
            <link>{$this->e($link)}</link>
            <atom:link href="{$this->e($selfUrl)}" rel="self" type="application/rss+xml" />
            <description>{$this->e($description)}</description>
            <language>en</language>
            <lastBuildDate>{$lastBuildDate}</lastBuildDate>
            {$items}
          </channel>
        </rss>
        XML;

        return response($xml, 200, ['Content-Type' => 'application/rss+xml; charset=utf-8']);
    }

    private function rssItem(Article $a): string
    {
        $url = route('journal.article', [$a->journal->slug, $a->slug]);
        $authors = $a->submission?->authors->map(fn ($au) => "<dc:creator>{$this->e($au->name)}</dc:creator>")->implode("\n") ?? '';
        $categories = collect($a->keywords ?? [])->map(fn ($kw) => "<category>{$this->e($kw)}</category>")->implode("\n");
        $pubDate = $a->published_at?->toRfc2822String() ?? now()->toRfc2822String();

        return <<<XML
        <item>
          <title>{$this->e($a->title)}</title>
          <link>{$this->e($url)}</link>
          <guid isPermaLink="true">{$this->e($url)}</guid>
          <pubDate>{$pubDate}</pubDate>
          <description>{$this->e($a->abstract ?? '')}</description>
          {$authors}
          {$categories}
        </item>
        XML;
    }

    private function atom(string $title, string $link, string $selfUrl, Collection $articles): Response
    {
        $entries = $articles->map(fn (Article $a) => $this->atomEntry($a))->implode("\n");
        $updated = $articles->max('published_at')?->toIso8601String() ?? now()->toIso8601String();

        $xml = <<<XML
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>{$this->e($title)}</title>
          <link href="{$this->e($selfUrl)}" rel="self" />
          <link href="{$this->e($link)}" />
          <id>{$this->e($selfUrl)}</id>
          <updated>{$updated}</updated>
          {$entries}
        </feed>
        XML;

        return response($xml, 200, ['Content-Type' => 'application/atom+xml; charset=utf-8']);
    }

    private function atomEntry(Article $a): string
    {
        $url = route('journal.article', [$a->journal->slug, $a->slug]);
        $authors = $a->submission?->authors->map(fn ($au) => "<author><name>{$this->e($au->name)}</name></author>")->implode("\n") ?? '';
        $updated = $a->published_at?->toIso8601String() ?? now()->toIso8601String();

        return <<<XML
        <entry>
          <title>{$this->e($a->title)}</title>
          <link href="{$this->e($url)}" />
          <id>{$this->e($url)}</id>
          <updated>{$updated}</updated>
          <summary>{$this->e($a->abstract ?? '')}</summary>
          {$authors}
        </entry>
        XML;
    }

    private function e(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_COMPAT, 'UTF-8');
    }
}
