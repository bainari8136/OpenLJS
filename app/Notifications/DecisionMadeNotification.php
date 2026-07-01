<?php

namespace App\Notifications;

use App\Modules\Editorial\Models\EditorialDecision;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DecisionMadeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public EditorialDecision $decision) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toArray(object $notifiable): array
    {
        $submission = $this->decision->submission;
        return [
            'type'  => 'decision_made',
            'title' => 'Editorial Decision',
            'body'  => "Decision on \"{$submission->title}\": {$this->decision->decisionLabel()}.",
            'url'   => route('submissions.show', $submission->id),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->decision->submission;
        $label      = $this->decision->decisionLabel();
        $url        = route('submissions.show', $submission->id);

        $message = (new MailMessage)
            ->subject("Editorial Decision: {$submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line("An editorial decision has been made on your manuscript:")
            ->line("**{$submission->title}**")
            ->line("**Decision:** {$label}");

        if ($this->decision->comments) {
            $message->line("**Editor's Comments:**")
                    ->line($this->decision->comments);
        }

        if ($this->decision->decision === EditorialDecision::DECISION_REQUEST_REVISION) {
            $message->line('Please log in to upload your revised manuscript.');
        }

        return $message
            ->action('View Submission', $url)
            ->line('Thank you for submitting to our journal.');
    }
}
