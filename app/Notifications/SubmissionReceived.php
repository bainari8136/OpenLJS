<?php

namespace App\Notifications;

use App\Modules\Submissions\Models\Submission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionReceived extends Notification implements ShouldQueue
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
            ->subject("Submission Received: {$this->submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line('Thank you for submitting your manuscript. We have received it and it is now under editorial review.')
            ->line("**Manuscript title:** {$this->submission->title}")
            ->line("**Submitted:** {$this->submission->submitted_at->format('F j, Y')}")
            ->action('View Submission', $url)
            ->line('You will receive updates as your submission progresses through the editorial process.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'  => 'submission_received',
            'title' => 'Submission Received',
            'body'  => "Your manuscript \"{$this->submission->title}\" has been received and is under review.",
            'url'   => route('submissions.show', $this->submission->id),
        ];
    }
}
