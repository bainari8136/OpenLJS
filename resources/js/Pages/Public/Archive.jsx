import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Archive({ journal, issues }) {
    // Group by year
    const byYear = {};
    issues.forEach(i => {
        if (!byYear[i.year]) byYear[i.year] = [];
        byYear[i.year].push(i);
    });
    const years = Object.keys(byYear).sort((a, b) => b - a);

    return (
        <AppLayout>
            <Head title={`Archive — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12">
                {/* Journal nav */}
                <nav className="mb-8 flex gap-4 text-sm text-gray-500 border-b border-gray-200 pb-4">
                    <Link href={route('journal.current_issue', journal.slug)} className="hover:text-gray-700">Current Issue</Link>
                    <Link href={route('journal.archive', journal.slug)} className="font-medium text-blue-900">Archive</Link>
                </nav>

                <h1 className="text-3xl font-bold text-gray-900">{journal.title}</h1>
                <p className="mt-1 text-sm text-gray-500">Archive — all published issues</p>

                {years.length === 0 ? (
                    <p className="mt-8 text-gray-500">No published issues yet.</p>
                ) : (
                    <div className="mt-8 space-y-8">
                        {years.map(year => (
                            <div key={year}>
                                <h2 className="text-lg font-semibold text-gray-700 mb-3">{year}</h2>
                                <ul className="space-y-2">
                                    {byYear[year].map(i => (
                                        <li key={i.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{i.title}</p>
                                                <p className="text-xs text-gray-400">{i.label} · Published {i.published_at}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">{i.articles_count} articles</span>
                                                <Link href={route('journal.current_issue', journal.slug) + `?issue=${i.id}`}
                                                    className="text-xs font-medium text-blue-900 hover:underline">
                                                    View →
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
