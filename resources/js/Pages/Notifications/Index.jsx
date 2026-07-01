import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const TYPE_ICONS = {
    submission_received: { bg: 'bg-blue-100', text: 'text-blue-600', char: '📄' },
    editor_assigned:     { bg: 'bg-purple-100', text: 'text-purple-600', char: '✍️' },
    reviewer_invited:    { bg: 'bg-amber-100', text: 'text-amber-600', char: '📩' },
    reviewer_responded:  { bg: 'bg-teal-100', text: 'text-teal-600', char: '↩️' },
    review_submitted:    { bg: 'bg-green-100', text: 'text-green-600', char: '✅' },
    decision_made:       { bg: 'bg-indigo-100', text: 'text-indigo-600', char: '⚖️' },
    revision_uploaded:   { bg: 'bg-orange-100', text: 'text-orange-600', char: '🔄' },
    article_published:   { bg: 'bg-emerald-100', text: 'text-emerald-600', char: '🌐' },
};

function NotificationIcon({ type }) {
    const config = TYPE_ICONS[type] ?? { bg: 'bg-gray-100', text: 'text-gray-500', char: '🔔' };
    return (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
            <span className="text-sm">{config.char}</span>
        </div>
    );
}

export default function Index({ notifications }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    function handleClick(n) {
        if (!n.read_at) {
            router.post(route('notifications.mark_read', n.id));
        } else if (n.url) {
            router.visit(n.url);
        }
    }

    function handleDelete(e, id) {
        e.stopPropagation();
        router.delete(route('notifications.destroy', id), { preserveScroll: true });
    }

    return (
        <DashboardLayout title="Notifications">
            <Head title="Notifications" />

            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    {notifications.data.length > 0 && (
                        <button
                            onClick={() => router.post(route('notifications.mark_all_read'), {}, { preserveScroll: true })}
                            className="text-sm text-blue-600 hover:underline">
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">No notifications yet.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <ul className="divide-y divide-gray-100">
                            {notifications.data.map(n => (
                                <li key={n.id}
                                    onClick={() => handleClick(n)}
                                    className={`flex cursor-pointer items-start gap-4 px-5 py-4 hover:bg-gray-50 ${!n.read_at ? 'bg-blue-50' : ''}`}>

                                    <NotificationIcon type={n.type} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className={`text-sm font-medium ${!n.read_at ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {n.title}
                                                {!n.read_at && (
                                                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500 align-middle" />
                                                )}
                                            </p>
                                            <span className="shrink-0 text-xs text-gray-400">{n.created_at}</span>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">{n.body}</p>
                                    </div>

                                    <button
                                        onClick={e => handleDelete(e, n.id)}
                                        className="shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        {(notifications.prev_page_url || notifications.next_page_url) && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                                <span className="text-xs text-gray-400">
                                    Page {notifications.current_page} of {notifications.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {notifications.prev_page_url && (
                                        <Link href={notifications.prev_page_url}
                                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                            Previous
                                        </Link>
                                    )}
                                    {notifications.next_page_url && (
                                        <Link href={notifications.next_page_url}
                                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                            Next
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
