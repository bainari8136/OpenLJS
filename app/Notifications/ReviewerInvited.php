<?php

namespace App\Notifications;

use App\Modules\Reviews\Models\ReviewAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewerInvited extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ReviewAssignment $assignment) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toArray(object $notifiable): array
    {
        $submission = $this->assignment->submission;
        return [
            'type'  => 'reviewer_invited',
            'title' => 'Review Invitation',
            'body'  => "You have been invited to review \"{$submission->title}\".",
            'url'   => route('reviews.show', $this->assignment->id),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->assignment->submission;
        $url = route('reviews.show', $this->assignment->id);
        $due = $this->assignment->due_date?->format('F j, Y');

        return (new MailMessage)
            ->subject("Review Invitation: {$submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line("You have been invited to review the following manuscript:")
            ->line("**{$submission->title}**")
            ->when($due, fn ($m) => $m->line("Review due: {$due}"))
            ->action('View Invitation', $url)
            ->line('You may accept or decline this invitation from the review page.')
            ->line('Thank you for contributing to the peer review process.');
    }
}
