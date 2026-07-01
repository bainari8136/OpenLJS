import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function StatusBadge({ publishedAt }) {
    if (publishedAt) {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Published
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Draft
        </span>
    );
}

function FilterBar({ filters, journals }) {
    const [q, setQ] = useState(filters.q ?? '');

    function apply(patch) {
        router.get(route('articles.index'), { ...filters, ...patch, page: 1 }, { preserveScroll: false, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        apply({ q });
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                    type="search"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    placeholder="Search by title…"
                    className="w-56 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button type="submit"
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200">
                    Search
                </button>
            </form>

            <select
                value={filters.journal_id ?? ''}
                onChange={e => apply({ journal_id: e.target.value || undefined })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
                <option value="">All journals</option>
                {journals.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                ))}
            </select>

            <select
                value={filters.status ?? ''}
                onChange={e => apply({ status: e.target.value || undefined })}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="unassigned">Unassigned to issue</option>
            </select>

            {(filters.q || filters.journal_id || filters.status) && (
                <button onClick={() => router.get(route('articles.index'))}
                    className="text-xs text-gray-400 hover:text-gray-600 hover:underline">
                    Clear filters
                </button>
            )}
        </div>
    );
}

export default function Index({ articles, journals, filters }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title="Articles">
            <Head title="Articles" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {articles.total} article{articles.total !== 1 ? 's' : ''} across all journals
                        </p>
                    </div>
                    <Link href={route('issues.index')}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
                        Manage Issues
                    </Link>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <FilterBar filters={filters} journals={journals} />

                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {articles.data.length === 0 ? (
                        <div className="py-16 text-center text-sm text-gray-400">
                            No articles match the current filters.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Journal</th>
                                    <th className="px-4 py-3 text-left hidden lg:table-cell">Issue</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left hidden xl:table-cell">DOI</th>
                                    <th className="px-4 py-3 text-right hidden sm:table-cell">Downloads</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {articles.data.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <Link href={route('articles.show', a.slug)}
                                                className="font-medium text-blue-900 hover:underline line-clamp-2 max-w-xs">
                                                {a.title}
                                            </Link>
                                            {(a.page_start || a.page_end) && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    pp. {a.page_start}–{a.page_end}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell text-gray-600 max-w-[160px] truncate">
                                            {a.journal ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                                            {a.issue ? (
                                                <Link href={route('issues.index')}
                                                    className="hover:underline">{a.issue}</Link>
                                            ) : (
                                                <span className="text-gray-300">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge publishedAt={a.published_at} />
                                            {a.published_at && (
                                                <p className="text-xs text-gray-400 mt-0.5">{a.published_at}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden xl:table-cell">
                                            {a.doi ? (
                                                <span className="font-mono text-xs text-gray-500 break-all">{a.doi}</span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-right text-gray-500">
                                            {a.downloads.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('articles.show', a.slug)}
                                                    className="text-xs text-blue-600 hover:underline">
                                                    Edit
                                                </Link>
                                                {a.published_at && a.journal_slug && (
                                                    <a href={route('journal.article', [a.journal_slug, a.slug])}
                                                        target="_blank" rel="noreferrer"
                                                        className="text-xs text-gray-400 hover:text-gray-600">
                                                        View ↗
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {articles.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                            Showing {articles.from}–{articles.to} of {articles.total}
                        </span>
                        <div className="flex gap-1">
                            {articles.links.map((link, i) => (
                                link.url ? (
                                    <Link key={i} href={link.url}
                                        className={`rounded px-3 py-1 ${link.active ? 'bg-blue-900 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i}
                                        className="rounded border border-gray-200 px-3 py-1 text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
