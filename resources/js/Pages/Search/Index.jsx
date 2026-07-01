import DashboardLayout from '@/Layouts/DashboardLayout';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_COLORS = {
    submitted:         'bg-blue-100 text-blue-700',
    initial_check:     'bg-yellow-100 text-yellow-700',
    editor_assigned:   'bg-indigo-100 text-indigo-700',
    under_review:      'bg-purple-100 text-purple-700',
    revision_required: 'bg-orange-100 text-orange-700',
    revised:           'bg-amber-100 text-amber-700',
    accepted:          'bg-green-100 text-green-700',
    rejected:          'bg-red-100 text-red-700',
    copyediting:       'bg-teal-100 text-teal-700',
    production:        'bg-cyan-100 text-cyan-700',
    scheduled:         'bg-lime-100 text-lime-700',
    published:         'bg-emerald-100 text-emerald-700',
};

function SubmissionCard({ s }) {
    return (
        <Link href={s.url} className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {s.status_label}
                        </span>
                        {s.journal && <span className="text-xs text-gray-400">{s.journal}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
                    {s.abstract && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{s.abstract}</p>}
                    {s.submitted_at && <p className="mt-2 text-xs text-gray-400">Submitted {s.submitted_at}</p>}
                </div>
                <svg className="h-4 w-4 shrink-0 text-gray-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

function ArticleCard({ a }) {
    if (!a.url) return null;
    return (
        <Link href={a.url} className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        {a.published_at && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                Published {a.published_at}
                            </span>
                        )}
                        {a.journal && <span className="text-xs text-gray-400">{a.journal}</span>}
                        {a.issue_label && <span className="text-xs text-gray-400">{a.issue_label}</span>}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                    {a.authors && <p className="mt-0.5 text-xs text-gray-500">{a.authors}</p>}
                    {a.abstract && <p className="mt-1 text-xs text-gray-400 line-clamp-2">{a.abstract}</p>}
                    {a.doi && <p className="mt-1.5 text-xs font-mono text-gray-400">{a.doi}</p>}
                </div>
                <svg className="h-4 w-4 shrink-0 text-gray-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

function SearchContent({ query, type, submissions, articles, isAuth }) {
    const [q, setQ] = useState(query);
    const [activeType, setActiveType] = useState(type);

    const totalResults = submissions.length + articles.length;

    function handleSearch(e) {
        e.preventDefault();
        if (!q.trim()) return;
        router.get(route('search'), { q: q.trim(), type: activeType });
    }

    const tabs = isAuth
        ? [
            { key: 'all', label: 'All', count: totalResults },
            { key: 'submissions', label: 'Submissions', count: submissions.length },
            { key: 'articles', label: 'Articles', count: articles.length },
          ]
        : [
            { key: 'articles', label: 'Articles', count: articles.length },
          ];

    const showSubmissions = isAuth && (activeType === 'all' || activeType === 'submissions');
    const showArticles = activeType === 'all' || activeType === 'articles';

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
            <Head title={query ? `Search: ${query}` : 'Search'} />

            {/* Search form */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="search"
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Search submissions, articles, authors…"
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button type="submit"
                    className="rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
                    Search
                </button>
            </form>

            {/* Results */}
            {query ? (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-gray-200">
                        {tabs.map(t => (
                            <button key={t.key}
                                onClick={() => { setActiveType(t.key); router.get(route('search'), { q: query, type: t.key }); }}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    activeType === t.key
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}>
                                {t.label}
                                {query && (
                                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                                        activeType === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                    }`}>{t.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-gray-400">
                        {totalResults} result{totalResults !== 1 ? 's' : ''} for <strong>"{query}"</strong>
                    </p>

                    {totalResults === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                            <p className="text-sm font-medium text-gray-500">No results found for "{query}".</p>
                            <p className="mt-1 text-xs text-gray-400">Try different keywords or check spelling.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {showSubmissions && submissions.length > 0 && (
                                <section>
                                    {activeType === 'all' && (
                                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                                            Submissions ({submissions.length})
                                        </h2>
                                    )}
                                    <div className="space-y-3">
                                        {submissions.map(s => <SubmissionCard key={s.id} s={s} />)}
                                    </div>
                                </section>
                            )}

                            {showArticles && articles.length > 0 && (
                                <section>
                                    {activeType === 'all' && (
                                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                                            Articles ({articles.length})
                                        </h2>
                                    )}
                                    <div className="space-y-3">
                                        {articles.map(a => <ArticleCard key={a.id} a={a} />)}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
                    <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">Enter a search term to get started.</p>
                </div>
            )}
        </div>
    );
}

export default function Index({ query, type, submissions, articles, isAuth }) {
    if (isAuth) {
        return (
            <DashboardLayout title="Search">
                <SearchContent query={query} type={type} submissions={submissions} articles={articles} isAuth={isAuth} />
            </DashboardLayout>
        );
    }

    return (
        <AppLayout>
            <SearchContent query={query} type={type} submissions={[]} articles={articles} isAuth={false} />
        </AppLayout>
    );
}
