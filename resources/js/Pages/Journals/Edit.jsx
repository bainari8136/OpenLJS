import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TABS = ['General', 'Sections', 'Guidelines', 'Policies'];

// ── General settings tab ──────────────────────────────────────────────────────
function GeneralTab({ journal }) {
    const { data, setData, patch, post, processing, errors } = useForm({
        title:               journal.title,
        acronym:             journal.acronym ?? '',
        description:         journal.description ?? '',
        issn_print:          journal.issn_print ?? '',
        issn_online:         journal.issn_online ?? '',
        is_active:           journal.is_active,
        submissions_enabled: journal.submissions_enabled,
        logo:                null,
    });

    const submit = (e) => {
        e.preventDefault();
        if (data.logo) {
            post(`/journals/${journal.slug}?_method=PATCH`, { forceFormData: true });
        } else {
            patch(`/journals/${journal.slug}`);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            {/* Logo */}
            <div className="flex items-center gap-4">
                {journal.logo_url ? (
                    <img src={journal.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-contain border border-gray-200" />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-900 text-xl font-bold text-white">
                        {journal.acronym?.[0] ?? journal.title[0]}
                    </div>
                )}
                <div>
                    <InputLabel value="Journal Logo" />
                    <input
                        type="file"
                        accept="image/*"
                        className="mt-1 text-sm text-gray-500"
                        onChange={(e) => setData('logo', e.target.files[0])}
                    />
                    <InputError className="mt-1" message={errors.logo} />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="title" value="Journal Title *" />
                <TextInput id="title" className="mt-1 block w-full" value={data.title}
                    onChange={(e) => setData('title', e.target.value)} required />
                <InputError className="mt-2" message={errors.title} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                    <InputLabel htmlFor="acronym" value="Acronym" />
                    <TextInput id="acronym" className="mt-1 block w-full" value={data.acronym}
                        onChange={(e) => setData('acronym', e.target.value)} placeholder="e.g. JAS" />
                </div>
                <div>
                    <InputLabel htmlFor="issn_print" value="ISSN Print" />
                    <TextInput id="issn_print" className="mt-1 block w-full" value={data.issn_print}
                        onChange={(e) => setData('issn_print', e.target.value)} placeholder="0000-0000" />
                </div>
                <div>
                    <InputLabel htmlFor="issn_online" value="ISSN Online" />
                    <TextInput id="issn_online" className="mt-1 block w-full" value={data.issn_online}
                        onChange={(e) => setData('issn_online', e.target.value)} placeholder="0000-0000" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="description" value="Description" />
                <textarea id="description" rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={data.description} onChange={(e) => setData('description', e.target.value)} />
                <InputError className="mt-2" message={errors.description} />
            </div>

            <div className="flex gap-6 rounded-lg border border-gray-200 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-900" />
                    Journal is active
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={data.submissions_enabled}
                        onChange={(e) => setData('submissions_enabled', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-900" />
                    Accept submissions
                </label>
            </div>

            <PrimaryButton disabled={processing}>Save Changes</PrimaryButton>
        </form>
    );
}

// ── Sections tab ──────────────────────────────────────────────────────────────
function SectionsTab({ journal }) {
    const [adding, setAdding] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm({
        title: '', description: '', is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/journals/${journal.slug}/sections`, {
            onSuccess: () => { reset(); setAdding(false); },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{journal.sections.length} section{journal.sections.length !== 1 ? 's' : ''}</p>
                <button onClick={() => setAdding(!adding)}
                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">
                    + Add Section
                </button>
            </div>

            {adding && (
                <form onSubmit={submit} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">New Section</h4>
                    <div>
                        <InputLabel htmlFor="s-title" value="Title *" />
                        <TextInput id="s-title" className="mt-1 block w-full" value={data.title}
                            onChange={(e) => setData('title', e.target.value)} required isFocused
                            placeholder="e.g. Research Articles" />
                        <InputError className="mt-1" message={errors.title} />
                    </div>
                    <div>
                        <InputLabel htmlFor="s-desc" value="Description" />
                        <textarea id="s-desc" rows={2}
                            className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <PrimaryButton disabled={processing}>Add</PrimaryButton>
                        <button type="button" onClick={() => setAdding(false)}
                            className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                </form>
            )}

            {journal.sections.length === 0 && !adding ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                    No sections yet. Add one to organise submissions.
                </div>
            ) : (
                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {journal.sections.map((section) => (
                        <div key={section.id} className="flex items-center justify-between px-5 py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{section.title}</p>
                                {section.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.description}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${section.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {section.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <Link
                                    href={`/journals/${journal.slug}/sections/${section.id}`}
                                    method="delete" as="button"
                                    className="text-xs text-red-500 hover:text-red-700"
                                    onClick={(e) => { if (!confirm('Delete this section?')) e.preventDefault(); }}
                                >
                                    Delete
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Guidelines tab ────────────────────────────────────────────────────────────
function GuidelinesTab({ journal }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title:             journal.title,
        author_guidelines: journal.author_guidelines ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/journals/${journal.slug}`);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <InputLabel htmlFor="author_guidelines" value="Author Guidelines" />
                <p className="mt-1 text-xs text-gray-500">Markdown supported. Displayed on the public Author Guidelines page.</p>
                <textarea id="author_guidelines" rows={18}
                    className="mt-2 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={data.author_guidelines}
                    onChange={(e) => setData('author_guidelines', e.target.value)} />
                <InputError className="mt-2" message={errors.author_guidelines} />
            </div>
            <div className="flex items-center gap-3">
                <PrimaryButton disabled={processing}>Save Guidelines</PrimaryButton>
                {recentlySuccessful && <span className="text-sm text-green-600">Saved.</span>}
            </div>
        </form>
    );
}

// ── Review policy tab ─────────────────────────────────────────────────────────
function PoliciesTab({ journal }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title:         journal.title,
        review_policy: journal.review_policy ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/journals/${journal.slug}`);
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <InputLabel htmlFor="review_policy" value="Review Policy" />
                <p className="mt-1 text-xs text-gray-500">Describe the peer review process, blind review type, and editorial standards.</p>
                <textarea id="review_policy" rows={18}
                    className="mt-2 block w-full rounded-md border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={data.review_policy}
                    onChange={(e) => setData('review_policy', e.target.value)} />
                <InputError className="mt-2" message={errors.review_policy} />
            </div>
            <div className="flex items-center gap-3">
                <PrimaryButton disabled={processing}>Save Policy</PrimaryButton>
                {recentlySuccessful && <span className="text-sm text-green-600">Saved.</span>}
            </div>
        </form>
    );
}

// ── Main Edit page ─────────────────────────────────────────────────────────────
export default function Edit({ journal }) {
    const [activeTab, setActiveTab] = useState('General');
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title={`${journal.title} — Settings`}>
            <Head title={`${journal.title} Settings`} />

            <div className="mx-auto max-w-3xl space-y-4">
                <Link href="/journals" className="text-sm text-blue-900 hover:underline">← Back to Journals</Link>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Tab bar */}
                <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {TABS.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab
                                    ? 'bg-white text-blue-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    {activeTab === 'General'    && <GeneralTab journal={journal} />}
                    {activeTab === 'Sections'   && <SectionsTab journal={journal} />}
                    {activeTab === 'Guidelines' && <GuidelinesTab journal={journal} />}
                    {activeTab === 'Policies'   && <PoliciesTab journal={journal} />}
                </div>
            </div>
        </DashboardLayout>
    );
}
