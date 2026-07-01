<?php

namespace App\Notifications;

use App\Modules\Issues\Models\Article;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ArticlePublished extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Article $article) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $journal = $this->article->journal;
        $issue   = $this->article->issue;
        $url     = route('journal.article', [$journal->slug, $this->article->slug]);

        $message = (new MailMessage)
            ->subject("Your Article Has Been Published: {$this->article->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line('Congratulations! Your article has been published:')
            ->line("**{$this->article->title}**");

        if ($issue) {
            $message->line("**Issue:** {$issue->label()}");
        }

        if ($this->article->doi) {
            $message->line("**DOI:** {$this->article->doi}");
        }

        return $message
            ->action('View Published Article', $url)
            ->line("Thank you for publishing with {$journal->title}.");
    }

    public function toArray(object $notifiable): array
    {
        $journal = $this->article->journal;
        return [
            'type'  => 'article_published',
            'title' => 'Article Published',
            'body'  => "Your article \"{$this->article->title}\" has been published in {$journal->title}.",
            'url'   => route('journal.article', [$journal->slug, $this->article->slug]),
        ];
    }
}
