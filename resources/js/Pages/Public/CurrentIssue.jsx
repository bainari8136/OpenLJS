import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function CurrentIssue({ journal, issue, articles }) {
    return (
        <AppLayout>
            <Head title={`Current Issue — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12">
                {/* Journal nav */}
                <nav className="mb-8 flex gap-4 text-sm text-gray-500 border-b border-gray-200 pb-4">
                    <Link href={route('journal.current_issue', journal.slug)} className="font-medium text-blue-900">Current Issue</Link>
                    <Link href={route('journal.archive', journal.slug)} className="hover:text-gray-700">Archive</Link>
                </nav>

                <h1 className="text-3xl font-bold text-gray-900">{journal.title}</h1>

                {!issue ? (
                    <p className="mt-8 text-gray-500">No published issues yet.</p>
                ) : (
                    <div className="mt-4 space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{issue.title}</h2>
                            <p className="text-sm text-gray-400 mt-0.5">{issue.label} · Published {issue.published_at}</p>
                            {issue.description && <p className="mt-2 text-sm text-gray-600">{issue.description}</p>}
                        </div>

                        {articles.length === 0 ? (
                            <p className="text-sm text-gray-400">No articles in this issue.</p>
                        ) : (
                            <ul className="space-y-6">
                                {articles.map(a => (
                                    <li key={a.id} className="border-l-2 border-blue-200 pl-4">
                                        <Link href={a.url} className="text-base font-medium text-blue-900 hover:underline">
                                            {a.title}
                                        </Link>
                                        {a.authors.length > 0 && (
                                            <p className="mt-1 text-sm text-gray-600">
                                                {a.authors.map(au => au.name).join(', ')}
                                            </p>
                                        )}
                                        {a.abstract && (
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-3">{a.abstract}</p>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-2 items-center">
                                            {a.page_start && (
                                                <span className="text-xs text-gray-400">pp. {a.page_start}–{a.page_end}</span>
                                            )}
                                            {a.doi && (
                                                <span className="text-xs text-gray-400">DOI: {a.doi}</span>
                                            )}
                                            {a.files.map(f => (
                                                <a key={f.id} href={f.download_url}
                                                    className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-200">
                                                    {f.label} ↓
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
