import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ issues, journals }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const [showCreate, setShowCreate] = useState(false);

    const form = useForm({
        journal_id:  '',
        title:       '',
        volume:      '',
        number:      '',
        year:        new Date().getFullYear(),
        description: '',
    });

    function handleCreate(e) {
        e.preventDefault();
        form.post(route('issues.store'), {
            onSuccess: () => { setShowCreate(false); form.reset(); },
        });
    }

    return (
        <DashboardLayout title="Issues">
            <Head title="Issues" />

            <div className="space-y-6">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
                    <button onClick={() => setShowCreate(v => !v)}
                        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                        + New Issue
                    </button>
                </div>

                {/* Create form */}
                {showCreate && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Create New Issue</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Journal *</label>
                                    <select value={form.data.journal_id} onChange={e => form.setData('journal_id', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required>
                                        <option value="">Select journal…</option>
                                        {journals.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                                    </select>
                                    {form.errors.journal_id && <p className="mt-1 text-xs text-red-500">{form.errors.journal_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Issue Title *</label>
                                    <input type="text" value={form.data.title} onChange={e => form.setData('title', e.target.value)}
                                        placeholder="e.g. Special Issue on AI"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
                                    {form.errors.title && <p className="mt-1 text-xs text-red-500">{form.errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Volume</label>
                                    <input type="text" value={form.data.volume} onChange={e => form.setData('volume', e.target.value)}
                                        placeholder="e.g. 12"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Number</label>
                                    <input type="text" value={form.data.number} onChange={e => form.setData('number', e.target.value)}
                                        placeholder="e.g. 3"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Year *</label>
                                    <input type="number" value={form.data.year} onChange={e => form.setData('year', e.target.value)}
                                        min="1900" max="2100"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" required />
                                    {form.errors.year && <p className="mt-1 text-xs text-red-500">{form.errors.year}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                <textarea value={form.data.description} onChange={e => form.setData('description', e.target.value)}
                                    rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={form.processing}
                                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                                    {form.processing ? 'Creating…' : 'Create Issue'}
                                </button>
                                <button type="button" onClick={() => setShowCreate(false)}
                                    className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Issues table */}
                {issues.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                        <p className="text-sm font-medium text-gray-500">No issues yet. Create the first one.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Issue</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 hidden md:table-cell">Journal</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Articles</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {issues.data.map(i => (
                                    <tr key={i.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-gray-900">{i.title}</p>
                                            <p className="text-xs text-gray-400">{i.label}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{i.journal}</td>
                                        <td className="px-5 py-3 text-gray-600">{i.articles_count}</td>
                                        <td className="px-5 py-3">
                                            {i.is_published ? (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                    Published {i.published_at}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={route('issues.edit', i.id)}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
