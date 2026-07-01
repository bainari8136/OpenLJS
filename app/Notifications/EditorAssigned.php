<?php

namespace App\Notifications;

use App\Modules\Editorial\Models\EditorialAssignment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EditorAssigned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public EditorialAssignment $assignment) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $submission = $this->assignment->submission;
        $url = route('submissions.show', $submission->id);
        $role = ucwords(str_replace('-', ' ', $this->assignment->role));

        return (new MailMessage)
            ->subject("Editorial Assignment: {$submission->title}")
            ->greeting("Dear {$notifiable->name},")
            ->line("You have been assigned as **{$role}** for the following manuscript:")
            ->line("**{$submission->title}**")
            ->line('Please log in to review the submission and take appropriate action.')
            ->action('View Submission', $url)
            ->line('Thank you for your contribution to the editorial process.');
    }

    public function toArray(object $notifiable): array
    {
        $submission = $this->assignment->submission;
        return [
            'type'  => 'editor_assigned',
            'title' => 'Editorial Assignment',
            'body'  => "You have been assigned to review \"{$submission->title}\".",
            'url'   => route('submissions.show', $submission->id),
        ];
    }
}
