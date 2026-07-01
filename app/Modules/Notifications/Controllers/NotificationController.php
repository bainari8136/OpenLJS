<?php

namespace App\Modules\Notifications\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(30)
            ->through(fn ($n) => $this->format($n));

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        $url = $notification->data['url'] ?? route('notifications.index');
        return redirect($url);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $request->user()->notifications()->findOrFail($id)->delete();
        return back();
    }

    private function format($n): array
    {
        return [
            'id'         => $n->id,
            'type'       => $n->data['type'] ?? 'notification',
            'title'      => $n->data['title'] ?? 'Notification',
            'body'       => $n->data['body'] ?? '',
            'url'        => $n->data['url'] ?? null,
            'read_at'    => $n->read_at?->toIso8601String(),
            'created_at' => $n->created_at->diffForHumans(),
        ];
    }
}
