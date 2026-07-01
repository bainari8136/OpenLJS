<?php

namespace App\Notifications;

use App\Modules\Reviews\Models\ReviewAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewerResponded extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public ReviewAssignment $assignment) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->assignment->submission;
        $reviewer   = $this->assignment->reviewer;
        $accepted   = $this->assignment->status === ReviewAssignment::STATUS_ACCEPTED;
        $url        = route('submissions.show', $submission->id);

        $message = (new MailMessage)
            ->subject(($accepted ? 'Review Accepted' : 'Review Declined') . ": {$submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line("**{$reviewer->name}** has " . ($accepted ? 'accepted' : 'declined') . " the review invitation for:")
            ->line("**{$submission->title}**");

        if (!$accepted && $this->assignment->decline_reason) {
            $message->line("**Reason:** {$this->assignment->decline_reason}");
        }

        return $message
            ->action('View Submission', $url)
            ->line($accepted
                ? 'The reviewer will submit their review by the due date.'
                : 'You may wish to invite another reviewer.');
    }

    public function toArray(object $notifiable): array
    {
        $submission = $this->assignment->submission;
        $reviewer   = $this->assignment->reviewer;
        $accepted   = $this->assignment->status === ReviewAssignment::STATUS_ACCEPTED;

        return [
            'type'  => 'reviewer_responded',
            'title' => $accepted ? 'Reviewer Accepted' : 'Reviewer Declined',
            'body'  => "{$reviewer->name} has " . ($accepted ? 'accepted' : 'declined') . " the review for \"{$submission->title}\".",
            'url'   => route('submissions.show', $submission->id),
        ];
    }
}
