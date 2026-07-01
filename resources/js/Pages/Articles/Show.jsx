import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function MetaEditor({ article }) {
    const [editing, setEditing] = useState(false);
    const form = useForm({
        doi:        article.doi ?? '',
        page_start: article.page_start ?? '',
        page_end:   article.page_end ?? '',
    });

    function save(e) {
        e.preventDefault();
        form.patch(route('articles.update_meta', article.id), {
            onSuccess: () => setEditing(false),
        });
    }

    if (!editing) {
        return (
            <div className="flex flex-wrap items-center gap-4 mt-1">
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">DOI</p>
                    <p className="text-sm text-gray-700 font-mono">{article.doi || <span className="text-gray-300">Not set</span>}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Pages</p>
                    <p className="text-sm text-gray-700">
                        {article.page_start ? `${article.page_start}–${article.page_end}` : <span className="text-gray-300">Not set</span>}
                    </p>
                </div>
                <button onClick={() => setEditing(true)}
                    className="self-end text-xs text-blue-600 hover:underline">
                    Edit
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={save} className="mt-3 flex flex-wrap gap-3 items-end">
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">DOI</label>
                <input value={form.data.doi} onChange={e => form.setData('doi', e.target.value)}
                    placeholder="10.xxxx/…"
                    className="w-52 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                {form.errors.doi && <p className="text-xs text-red-500 mt-0.5">{form.errors.doi}</p>}
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">Page start</label>
                <input type="number" min="1" value={form.data.page_start}
                    onChange={e => form.setData('page_start', e.target.value)}
                    className="w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">Page end</label>
                <input type="number" min="1" value={form.data.page_end}
                    onChange={e => form.setData('page_end', e.target.value)}
                    className="w-24 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                    {form.processing ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

function IssuePanel({ article, availableIssues }) {
    const [assigning, setAssigning] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState('');

    function handleAssign(e) {
        e.preventDefault();
        if (!selectedIssueId) return;
        router.patch(route('articles.assign_issue', article.id), { issue_id: selectedIssueId }, {
            onSuccess: () => { setAssigning(false); setSelectedIssueId(''); },
        });
    }

    function handleRemove() {
        if (!confirm('Remove this article from its issue?')) return;
        router.patch(route('articles.remove_issue', article.id));
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Issue</h2>

            {article.issue ? (
                <div>
                    <p className="text-sm font-medium text-gray-800">{article.issue.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{article.issue.label}</p>
                    <div className="flex gap-3 mt-3">
                        <button onClick={() => setAssigning(true)}
                            className="text-xs text-blue-600 hover:underline">
                            Reassign
                        </button>
                        <button onClick={handleRemove}
                            className="text-xs text-red-400 hover:text-red-600 hover:underline">
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-400">Not assigned to an issue.</p>
            )}

            {(!article.issue || assigning) && (
                <form onSubmit={handleAssign} className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="block text-xs font-medium text-gray-600">
                        {article.issue ? 'Move to issue' : 'Assign to issue'}
                    </label>
                    <select value={selectedIssueId} onChange={e => setSelectedIssueId(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                        required>
                        <option value="">Select issue…</option>
                        {availableIssues.map(i => (
                            <option key={i.id} value={i.id}>{i.title} — {i.label}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <button type="submit"
                            className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800">
                            Assign
                        </button>
                        {assigning && (
                            <button type="button" onClick={() => setAssigning(false)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}

export default function Show({ article, availableIssues }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const isPublished = !!article.published_at;

    return (
        <DashboardLayout title={article.title}>
            <Head title={article.title} />

            <div className="space-y-6">
                {/* Breadcrumb + header */}
                <div>
                    <Link href={route('articles.index')}
                        className="text-xs text-gray-400 hover:text-gray-600">
                        ← Back to Articles
                    </Link>
                    <div className="mt-2 flex flex-wrap items-start gap-3">
                        <h1 className="flex-1 text-2xl font-bold text-gray-900 min-w-0">{article.title}</h1>
                        <div className="flex items-center gap-2 shrink-0">
                            {isPublished ? (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                                    Published {article.published_at}
                                </span>
                            ) : (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                    Draft
                                </span>
                            )}
                            {isPublished && article.journal?.slug && (
                                <a href={route('journal.article', [article.journal.slug, article.slug])}
                                    target="_blank" rel="noreferrer"
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
                                    View public page ↗
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{article.journal?.title}</p>
                </div>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left column — main content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Metadata */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
                            <h2 className="text-sm font-semibold text-gray-900">Metadata</h2>

                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Abstract</p>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {article.abstract || <span className="text-gray-300">No abstract.</span>}
                                </p>
                            </div>

                            {article.keywords?.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Keywords</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {article.keywords.map((kw, i) => (
                                            <span key={i}
                                                className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">DOI & Page Range</p>
                                <MetaEditor article={article} />
                            </div>
                        </div>

                        {/* Authors */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <h2 className="text-sm font-semibold text-gray-900 mb-4">
                                Authors ({article.authors.length})
                            </h2>
                            {article.authors.length === 0 ? (
                                <p className="text-sm text-gray-400">No authors recorded.</p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {article.authors.map(au => (
                                        <li key={au.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                                                {au.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {au.name}
                                                    {au.is_corresponding && (
                                                        <span className="ml-1.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">Corresponding</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500">{au.email}</p>
                                                {au.affiliation && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{au.affiliation}{au.country ? `, ${au.country}` : ''}</p>
                                                )}
                                                {au.orcid && (
                                                    <a href={`https://orcid.org/${au.orcid}`} target="_blank" rel="noreferrer"
                                                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                                                        <span className="font-mono">{au.orcid}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right column — sidebar */}
                    <div className="space-y-5">
                        {/* Issue */}
                        <IssuePanel article={article} availableIssues={availableIssues} />

                        {/* Galley Files */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">
                                Galley Files ({article.files.length})
                            </h2>
                            {article.files.length === 0 ? (
                                <p className="text-sm text-gray-400">No files attached.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {article.files.map(f => (
                                        <li key={f.id}
                                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-700 truncate">
                                                    {f.label || f.file_type?.toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {f.downloads_count.toLocaleString()} download{f.downloads_count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <a href={f.download_url}
                                                className="shrink-0 rounded bg-blue-900 px-2 py-1 text-xs font-medium text-white hover:bg-blue-800">
                                                Download
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Links */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Links</h2>
                            {article.submission_id && (
                                <Link href={route('submissions.show', article.submission_id)}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    View original submission
                                </Link>
                            )}
                            {article.issue?.id && (
                                <Link href={route('issues.edit', article.issue.id)}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Edit issue
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
