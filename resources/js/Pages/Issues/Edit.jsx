import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

function ArticleMetaEditor({ article }) {
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
            <div className="flex items-center gap-3 text-xs text-gray-400">
                {article.page_start && <span>pp. {article.page_start}–{article.page_end}</span>}
                {article.doi && <span className="font-mono">{article.doi}</span>}
                <button onClick={() => setEditing(true)} className="text-blue-500 hover:underline">Edit</button>
            </div>
        );
    }

    return (
        <form onSubmit={save} className="mt-2 flex flex-wrap gap-2 items-end">
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">DOI</label>
                <input value={form.data.doi} onChange={e => form.setData('doi', e.target.value)}
                    placeholder="10.xxxx/..."
                    className="w-48 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none" />
                {form.errors.doi && <p className="text-xs text-red-500 mt-0.5">{form.errors.doi}</p>}
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">Page start</label>
                <input type="number" min="1" value={form.data.page_start} onChange={e => form.setData('page_start', e.target.value)}
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none" />
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-0.5">Page end</label>
                <input type="number" min="1" value={form.data.page_end} onChange={e => form.setData('page_end', e.target.value)}
                    className="w-20 rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none" />
            </div>
            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                    {form.processing ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default function Edit({ issue, unassignedArticles }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    const metaForm = useForm({
        title:       issue.title,
        volume:      issue.volume ?? '',
        number:      issue.number ?? '',
        year:        issue.year,
        description: issue.description ?? '',
    });

    const assignForm = useForm({ issue_id: issue.id, page_start: '', page_end: '' });
    const [assigningArticleId, setAssigningArticleId] = useState('');

    function handleMeta(e) {
        e.preventDefault();
        metaForm.patch(route('issues.update', issue.id));
    }

    function handleAssign(e) {
        e.preventDefault();
        if (!assigningArticleId) return;
        router.patch(route('articles.assign_issue', assigningArticleId), {
            issue_id:   issue.id,
            page_start: assignForm.data.page_start || null,
            page_end:   assignForm.data.page_end || null,
        }, { onSuccess: () => { setAssigningArticleId(''); assignForm.reset('page_start', 'page_end'); } });
    }

    function handlePublish() {
        if (!confirm(issue.is_published ? 'Unpublish this issue?' : `Publish "${issue.title}" and all its articles?`)) return;
        const routeName = issue.is_published ? 'issues.unpublish' : 'issues.publish';
        router.post(route(routeName, issue.id));
    }

    function handleRemove(articleId) {
        if (!confirm('Remove this article from the issue?')) return;
        router.patch(route('articles.remove_issue', articleId));
    }

    return (
        <DashboardLayout title={`Edit Issue — ${issue.title}`}>
            <Head title={`Edit Issue — ${issue.title}`} />

            <div className="space-y-8">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Link href={route('issues.index')} className="text-xs text-gray-400 hover:text-gray-600">
                            ← Back to Issues
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold text-gray-900">{issue.title}</h1>
                        <p className="text-sm text-gray-500">{issue.label} · {issue.journal?.title}</p>
                    </div>
                    <button onClick={handlePublish}
                        className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${
                            issue.is_published
                                ? 'border border-red-300 text-red-600 hover:bg-red-50'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}>
                        {issue.is_published ? 'Unpublish' : 'Publish Issue'}
                    </button>
                </div>

                {/* Status banner */}
                {issue.is_published && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        This issue was published on <strong>{issue.published_at}</strong>. Editing is still possible; changes reflect immediately.
                    </div>
                )}

                {/* Metadata form */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Issue Metadata</h2>
                    <form onSubmit={handleMeta} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                                <input type="text" value={metaForm.data.title} onChange={e => metaForm.setData('title', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
                                {metaForm.errors.title && <p className="mt-1 text-xs text-red-500">{metaForm.errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Volume</label>
                                <input type="text" value={metaForm.data.volume} onChange={e => metaForm.setData('volume', e.target.value)}
                                    placeholder="e.g. 12"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
                                <input type="text" value={metaForm.data.number} onChange={e => metaForm.setData('number', e.target.value)}
                                    placeholder="e.g. 3"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                                <input type="number" value={metaForm.data.year} onChange={e => metaForm.setData('year', e.target.value)}
                                    min="1900" max="2100"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
                                {metaForm.errors.year && <p className="mt-1 text-xs text-red-500">{metaForm.errors.year}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea value={metaForm.data.description} onChange={e => metaForm.setData('description', e.target.value)}
                                    rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={metaForm.processing}
                                className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                                {metaForm.processing ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Articles in this issue */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Articles in This Issue ({issue.articles.length})</h2>
                    </div>
                    {issue.articles.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No articles assigned yet.</div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {issue.articles.map(a => (
                                <li key={a.id} className="flex items-start gap-4 px-6 py-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{a.authors}</p>
                                        <div className="mt-1 flex gap-2 flex-wrap items-center">
                                            {a.files.map(f => (
                                                <span key={f.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 uppercase">{f.label}</span>
                                            ))}
                                        </div>
                                        <ArticleMetaEditor article={a} />
                                    </div>
                                    <button onClick={() => handleRemove(a.id)}
                                        className="shrink-0 text-xs text-red-400 hover:text-red-600">
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Assign article */}
                {unassignedArticles.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Add Article to This Issue</h2>
                        <form onSubmit={handleAssign} className="flex flex-wrap gap-3 items-end">
                            <div className="flex-1 min-w-48">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Article</label>
                                <select value={assigningArticleId} onChange={e => setAssigningArticleId(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required>
                                    <option value="">Select article…</option>
                                    {unassignedArticles.map(a => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Page start</label>
                                <input type="number" min="1" value={assignForm.data.page_start}
                                    onChange={e => assignForm.setData('page_start', e.target.value)}
                                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Page end</label>
                                <input type="number" min="1" value={assignForm.data.page_end}
                                    onChange={e => assignForm.setData('page_end', e.target.value)}
                                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <button type="submit"
                                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                                Add Article
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
