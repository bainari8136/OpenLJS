<?php

namespace App\Notifications;

use App\Modules\Reviews\Models\ReviewAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReviewSubmitted extends Notification implements ShouldQueue
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
        $reviewer   = $this->assignment->reviewer;
        $review     = $this->assignment->review;
        return [
            'type'  => 'review_submitted',
            'title' => 'Review Submitted',
            'body'  => "{$reviewer->name} submitted a review for \"{$submission->title}\" — {$review?->recommendationLabel()}.",
            'url'   => route('submissions.show', $submission->id),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->assignment->submission;
        $reviewer   = $this->assignment->reviewer;
        $review     = $this->assignment->review;
        $url = route('submissions.show', $submission->id);

        return (new MailMessage)
            ->subject("Review Submitted: {$submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line("A reviewer has submitted their review for the following manuscript:")
            ->line("**{$submission->title}**")
            ->line("Reviewer: {$reviewer->name}")
            ->line("Recommendation: {$review?->recommendationLabel()}")
            ->action('View Submission', $url)
            ->line('Please log in to the editorial system to view the full review.');
    }
}
