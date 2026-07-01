import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Article({ journal, article, issue }) {
    const correspondingAuthor = article.authors.find(a => a.is_corresponding);

    return (
        <AppLayout>
            <Head title={`${article.title} — ${journal.title}`} />

            <div className="mx-auto max-w-3xl px-4 py-12">
                {/* Breadcrumb */}
                <nav className="mb-8 flex gap-2 text-xs text-gray-400">
                    <Link href={route('journal.current_issue', journal.slug)} className="hover:text-blue-900">{journal.title}</Link>
                    {issue && (
                        <>
                            <span>/</span>
                            <Link href={route('journal.archive', journal.slug)} className="hover:text-blue-900">{issue.label}</Link>
                        </>
                    )}
                </nav>

                {/* Article header */}
                <h1 className="text-2xl font-bold leading-snug text-gray-900">{article.title}</h1>

                {/* Authors */}
                {article.authors.length > 0 && (
                    <div className="mt-4 space-y-1">
                        {article.authors.map((a, i) => (
                            <div key={i} className="text-sm text-gray-700">
                                <span className="font-medium">{a.name}</span>
                                {a.affiliation && <span className="text-gray-400"> · {a.affiliation}</span>}
                                {a.orcid && (
                                    <a href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noreferrer"
                                        className="ml-2 text-xs text-green-700 hover:underline">
                                        ORCID
                                    </a>
                                )}
                                {a.is_corresponding && <span className="ml-1 text-xs text-gray-400">(corresponding)</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* Meta row */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400 border-y border-gray-200 py-3">
                    {article.published_at && <span>Published: {article.published_at}</span>}
                    {issue && <span>{issue.label}</span>}
                    {article.page_start && <span>pp. {article.page_start}–{article.page_end}</span>}
                    {article.doi && <span>DOI: {article.doi}</span>}
                </div>

                {/* Downloads */}
                {article.files.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                        {article.files.map(f => (
                            <a key={f.id} href={f.download_url}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                                {f.label}
                                <span className="text-xs text-blue-400">({f.downloads} downloads)</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Abstract */}
                {article.abstract && (
                    <div className="mt-8">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Abstract</h2>
                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{article.abstract}</p>
                    </div>
                )}

                {/* Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Keywords</h2>
                        <div className="flex flex-wrap gap-2">
                            {article.keywords.map((kw, i) => (
                                <span key={i} className="rounded-full bg-gray-100 px-3 py-0.5 text-xs text-gray-600">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
