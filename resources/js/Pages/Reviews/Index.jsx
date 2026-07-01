import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const STATUS_COLORS = {
    invited:   'bg-blue-100 text-blue-800',
    accepted:  'bg-green-100 text-green-800',
    declined:  'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-gray-100 text-gray-400',
};

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

export default function Index({ assignments }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title="My Reviews">
            <Head title="My Reviews" />

            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
                </div>

                {assignments.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                        <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <p className="mt-3 text-sm font-medium text-gray-500">No review assignments yet.</p>
                        <p className="text-xs text-gray-400">You will receive an email when a manuscript is assigned to you for review.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Manuscript</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">Journal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden lg:table-cell">Due</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assignments.data.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900 leading-tight line-clamp-2 max-w-sm">
                                                {a.submission.title}
                                            </p>
                                            {a.submission.section && (
                                                <p className="text-xs text-gray-400 mt-0.5">{a.submission.section}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                                            {a.submission.journal ?? '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={a.status} label={a.status_label} />
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 hidden lg:table-cell whitespace-nowrap">
                                            {a.due_date ?? '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link
                                                href={route('reviews.show', a.id)}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                {a.status === 'invited' ? 'Respond' : a.status === 'accepted' ? 'Submit Review' : 'View'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {assignments.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
                                <p className="text-xs text-gray-400">
                                    Showing {assignments.from}–{assignments.to} of {assignments.total}
                                </p>
                                <div className="flex gap-1">
                                    {assignments.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
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
