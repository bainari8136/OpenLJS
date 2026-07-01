<?php

namespace App\Notifications;

use App\Modules\Submissions\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RevisionUploaded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Submission $submission) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = route('submissions.show', $this->submission->id);

        return (new MailMessage)
            ->subject("Revision Uploaded: {$this->submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line('The author has uploaded a revised manuscript for your review:')
            ->line("**{$this->submission->title}**")
            ->action('View Revised Manuscript', $url)
            ->line('Please review the revision and make an editorial decision.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'  => 'revision_uploaded',
            'title' => 'Revision Uploaded',
            'body'  => "The author uploaded a revised manuscript for \"{$this->submission->title}\".",
            'url'   => route('submissions.show', $this->submission->id),
        ];
    }
}
