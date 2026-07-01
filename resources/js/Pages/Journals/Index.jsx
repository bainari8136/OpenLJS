import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';

function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

export default function Index({ journals }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title="Journals">
            <Head title="Journals" />

            <div className="space-y-4">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{journals.length} journal{journals.length !== 1 ? 's' : ''}</p>
                    <Link
                        href="/journals/create"
                        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                    >
                        + New Journal
                    </Link>
                </div>

                {journals.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                        <p className="text-gray-500">No journals yet.</p>
                        <Link href="/journals/create" className="mt-3 inline-block text-sm font-medium text-blue-900 hover:underline">
                            Create your first journal
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {journals.map((journal) => (
                            <div key={journal.id} className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        {journal.logo_url ? (
                                            <img src={journal.logo_url} alt={journal.title} className="h-10 w-10 rounded object-contain" />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-900 text-sm font-bold text-white">
                                                {journal.acronym?.[0] ?? journal.title[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 leading-tight">{journal.title}</h3>
                                            {journal.acronym && <p className="text-xs text-gray-500">{journal.acronym}</p>}
                                        </div>
                                    </div>
                                    <StatusBadge active={journal.is_active} />
                                </div>

                                <div className="flex gap-3 text-xs text-gray-500">
                                    <span>{journal.sections_count} section{journal.sections_count !== 1 ? 's' : ''}</span>
                                    {journal.submissions_enabled
                                        ? <span className="text-green-600">Accepting submissions</span>
                                        : <span className="text-amber-600">Submissions closed</span>
                                    }
                                </div>

                                <div className="flex gap-2 pt-1 border-t border-gray-100">
                                    <Link
                                        href={`/journals/${journal.slug}/edit`}
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Settings
                                    </Link>
                                    <a
                                        href={`/j/${journal.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        View Site ↗
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
