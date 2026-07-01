import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const STATUS_COLORS = {
    draft:             'bg-gray-100 text-gray-600',
    submitted:         'bg-blue-100 text-blue-800',
    initial_check:     'bg-sky-100 text-sky-800',
    editor_assigned:   'bg-indigo-100 text-indigo-800',
    under_review:      'bg-violet-100 text-violet-800',
    revision_required: 'bg-amber-100 text-amber-800',
    revised:           'bg-orange-100 text-orange-800',
    accepted:          'bg-green-100 text-green-800',
    rejected:          'bg-red-100 text-red-800',
    copyediting:       'bg-teal-100 text-teal-800',
    production:        'bg-cyan-100 text-cyan-800',
    scheduled:         'bg-emerald-100 text-emerald-800',
    published:         'bg-green-200 text-green-900',
};

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'revision_required', label: 'Revision Required' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'published', label: 'Published' },
];

export default function Index({ submissions, filters, canViewAll }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const filterByStatus = (status) => {
        router.get('/submissions', { status }, { preserveState: true, replace: true });
    };

    return (
        <DashboardLayout title={canViewAll ? 'All Submissions' : 'My Submissions'}>
            <Head title="Submissions" />

            <div className="space-y-4">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Status filter */}
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => filterByStatus(opt.value)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                    (filters.status ?? '') === opt.value
                                        ? 'bg-blue-900 text-white'
                                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <Link href="/submissions/create"
                        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        + New Submission
                    </Link>
                </div>

                {submissions.data.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                        <p className="text-gray-500">No submissions found.</p>
                        <Link href="/submissions/create"
                            className="mt-3 inline-block text-sm font-medium text-blue-900 hover:underline">
                            Start your first submission
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Journal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Date</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">View</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {submissions.data.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{sub.title}</p>
                                            {sub.section && <p className="text-xs text-gray-400 mt-0.5">{sub.section}</p>}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{sub.journal}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <StatusBadge status={sub.status} label={sub.status_label} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {sub.submitted_at ?? sub.created_at}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                            <Link href={`/submissions/${sub.id}`}
                                                className="font-medium text-blue-900 hover:text-blue-700">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {submissions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                                <p className="text-sm text-gray-500">Showing {submissions.from}–{submissions.to} of {submissions.total}</p>
                                <div className="flex gap-2">
                                    {submissions.links.map((link, i) => (
                                        <Link key={i} href={link.url ?? '#'}
                                            className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
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
