import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const STATUS_COLORS = {
    submitted:         'bg-blue-100 text-blue-800',
    initial_check:     'bg-sky-100 text-sky-800',
    editor_assigned:   'bg-indigo-100 text-indigo-800',
    under_review:      'bg-violet-100 text-violet-800',
    revision_required: 'bg-amber-100 text-amber-800',
    revised:           'bg-orange-100 text-orange-800',
    accepted:          'bg-green-100 text-green-800',
    rejected:          'bg-red-100 text-red-800',
};

const QUEUE_TABS = [
    { key: 'unassigned',        label: 'Unassigned' },
    { key: 'my_queue',          label: 'My Queue' },
    { key: 'under_review',      label: 'Under Review' },
    { key: 'awaiting_decision', label: 'Awaiting Decision' },
    { key: 'accepted',          label: 'Accepted' },
    { key: 'rejected',          label: 'Rejected' },
];

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

function EditorChips({ editors }) {
    if (!editors?.length) {
        return <span className="text-xs italic text-gray-400">Unassigned</span>;
    }
    return (
        <div className="flex flex-wrap gap-1">
            {editors.map((e, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                    {e.name}
                </span>
            ))}
        </div>
    );
}

export default function Index({ submissions, queue, counts }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    function switchQueue(key) {
        router.get(route('editorial.index'), { queue: key }, { preserveState: true, replace: true });
    }

    return (
        <DashboardLayout title="Editorial Queue">
            <Head title="Editorial Queue" />

            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Editorial Queue</h1>
                </div>

                {/* Queue tabs */}
                <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {QUEUE_TABS.map(tab => {
                        const count = counts[tab.key];
                        return (
                            <button
                                key={tab.key}
                                onClick={() => switchQueue(tab.key)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    queue === tab.key
                                        ? 'bg-white text-blue-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                                {count != null && (
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                                        queue === tab.key ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Submissions table */}
                {submissions.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-500">No submissions in this queue.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">#</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Title</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">Author</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden lg:table-cell">Journal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">Assigned To</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden lg:table-cell">Submitted</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {submissions.data.map(s => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.id}</td>
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900 leading-tight line-clamp-2 max-w-xs">{s.title}</p>
                                            {s.section && (
                                                <p className="text-xs text-gray-400 mt-0.5">{s.section}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{s.author ?? '—'}</td>
                                        <td className="px-5 py-3 text-gray-600 hidden lg:table-cell">{s.journal ?? '—'}</td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={s.status} label={s.status_label} />
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <EditorChips editors={s.editors} />
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">{s.submitted_at ?? '—'}</td>
                                        <td className="px-5 py-3 text-right">
                                            <Link
                                                href={route('submissions.show', s.id)}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {submissions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
                                <p className="text-xs text-gray-400">
                                    Showing {submissions.from}–{submissions.to} of {submissions.total}
                                </p>
                                <div className="flex gap-1">
                                    {submissions.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, { queue }, { preserveState: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                                link.active
                                                    ? 'bg-blue-900 text-white'
                                                    : link.url
                                                        ? 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                                        : 'border border-gray-200 text-gray-300 cursor-not-allowed'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
