import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Strips markup for short list-preview text (the editor stores/renders HTML, but previews are plain).
function stripHtml(html) {
    return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

const TABS = ['General', 'Contact', 'Sections', 'Categories', 'Editorial Team', 'Guidelines', 'Policies'];

const ARTICLE_ORDERINGS = [
    { value: 'sequential', label: 'Sequential (manual order)' },
    { value: 'title', label: 'Title' },
    { value: 'date_published', label: 'Date Published' },
    { value: 'author', label: 'Author' },
];

// Flattens the category tree into a depth-annotated list for select dropdowns and nested display.
function flattenCategories(categories, parentId = null, depth = 0) {
    return categories
        .filter((c) => c.parent_id === parentId)
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap((c) => [{ ...c, depth }, ...flattenCategories(categories, c.id, depth + 1)]);
}

// ── General settings tab ──────────────────────────────────────────────────────
function GeneralTab({ journal }) {
    const { data, setData, patch, post, processing, errors } = useForm({
        title:               journal.title,
        acronym:             journal.acronym ?? '',
        country:             journal.country ?? '',
        publisher:           journal.publisher ?? '',
        website_url:         journal.website_url ?? '',
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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                    <InputLabel htmlFor="country" value="Country" />
                    <TextInput id="country" className="mt-1 block w-full" value={data.country}
                        onChange={(e) => setData('country', e.target.value)} placeholder="e.g. United States" />
                </div>
                <div>
                    <InputLabel htmlFor="publisher" value="Publisher" />
                    <TextInput id="publisher" className="mt-1 block w-full" value={data.publisher}
                        onChange={(e) => setData('publisher', e.target.value)} placeholder="e.g. University Press" />
                </div>
                <div>
                    <InputLabel htmlFor="website_url" value="Publisher Website" />
                    <TextInput id="website_url" type="url" className="mt-1 block w-full" value={data.website_url}
                        onChange={(e) => setData('website_url', e.target.value)} placeholder="https://…" />
                    <InputError className="mt-1" message={errors.website_url} />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="description" value="Description" />
                <RichTextEditor id="description" rows={4} className="mt-1" value={data.description}
                    onChange={(html) => setData('description', html)} />
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

// ── Contact tab ────────────────────────────────────────────────────────────────
function ContactTab({ journal }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        title:                              journal.title,
        principal_contact_name:             journal.principal_contact_name ?? '',
        principal_contact_email:            journal.principal_contact_email ?? '',
        principal_contact_phone:            journal.principal_contact_phone ?? '',
        principal_contact_affiliation:      journal.principal_contact_affiliation ?? '',
        principal_contact_mailing_address:  journal.principal_contact_mailing_address ?? '',
        tech_support_name:                  journal.tech_support_name ?? '',
        tech_support_email:                 journal.tech_support_email ?? '',
        tech_support_phone:                 journal.tech_support_phone ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(`/journals/${journal.slug}`);
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">Principal Contact</h4>
                    <p className="mt-1 text-xs text-gray-500">Displayed on the public About page.</p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="pc-name" value="Name" />
                        <TextInput id="pc-name" className="mt-1 block w-full" value={data.principal_contact_name}
                            onChange={(e) => setData('principal_contact_name', e.target.value)} />
                        <InputError className="mt-1" message={errors.principal_contact_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pc-email" value="Email" />
                        <TextInput id="pc-email" type="email" className="mt-1 block w-full" value={data.principal_contact_email}
                            onChange={(e) => setData('principal_contact_email', e.target.value)} />
                        <InputError className="mt-1" message={errors.principal_contact_email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pc-phone" value="Phone" />
                        <TextInput id="pc-phone" className="mt-1 block w-full" value={data.principal_contact_phone}
                            onChange={(e) => setData('principal_contact_phone', e.target.value)} />
                        <InputError className="mt-1" message={errors.principal_contact_phone} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pc-affiliation" value="Affiliation" />
                        <TextInput id="pc-affiliation" className="mt-1 block w-full" value={data.principal_contact_affiliation}
                            onChange={(e) => setData('principal_contact_affiliation', e.target.value)} />
                        <InputError className="mt-1" message={errors.principal_contact_affiliation} />
                    </div>
                </div>
                <div>
                    <InputLabel htmlFor="pc-address" value="Mailing Address" />
                    <textarea id="pc-address" rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={data.principal_contact_mailing_address}
                        onChange={(e) => setData('principal_contact_mailing_address', e.target.value)} />
                    <InputError className="mt-1" message={errors.principal_contact_mailing_address} />
                </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">Technical Support</h4>
                    <p className="mt-1 text-xs text-gray-500">
                        Assists editors, authors and reviewers with submission problems. Not shown publicly.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="ts-name" value="Name" />
                        <TextInput id="ts-name" className="mt-1 block w-full" value={data.tech_support_name}
                            onChange={(e) => setData('tech_support_name', e.target.value)} />
                        <InputError className="mt-1" message={errors.tech_support_name} />
                    </div>
                    <div>
                        <InputLabel htmlFor="ts-email" value="Email" />
                        <TextInput id="ts-email" type="email" className="mt-1 block w-full" value={data.tech_support_email}
                            onChange={(e) => setData('tech_support_email', e.target.value)} />
                        <InputError className="mt-1" message={errors.tech_support_email} />
                    </div>
                    <div>
                        <InputLabel htmlFor="ts-phone" value="Phone" />
                        <TextInput id="ts-phone" className="mt-1 block w-full" value={data.tech_support_phone}
                            onChange={(e) => setData('tech_support_phone', e.target.value)} />
                        <InputError className="mt-1" message={errors.tech_support_phone} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <PrimaryButton disabled={processing}>Save Contact Info</PrimaryButton>
                {recentlySuccessful && <span className="text-sm text-green-600">Saved.</span>}
            </div>
        </form>
    );
}

// ── Sections tab ──────────────────────────────────────────────────────────────
function SectionsTab({ journal }) {
    const [adding, setAdding] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm({
        title: '', abbreviation: '', description: '', policy: '',
        word_count_limit: '', identify_as: '', is_peer_reviewed: true, is_active: true,
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="s-title" value="Title *" />
                            <TextInput id="s-title" className="mt-1 block w-full" value={data.title}
                                onChange={(e) => setData('title', e.target.value)} required isFocused
                                placeholder="e.g. Research Articles" />
                            <InputError className="mt-1" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel htmlFor="s-abbr" value="Abbreviation" />
                            <TextInput id="s-abbr" className="mt-1 block w-full" value={data.abbreviation}
                                onChange={(e) => setData('abbreviation', e.target.value)} placeholder="e.g. RA" />
                            <InputError className="mt-1" message={errors.abbreviation} />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="s-desc" value="Description" />
                        <RichTextEditor id="s-desc" rows={2} className="mt-1" value={data.description}
                            onChange={(html) => setData('description', html)} />
                    </div>
                    <div>
                        <InputLabel htmlFor="s-policy" value="Section Policy" />
                        <RichTextEditor id="s-policy" rows={2} className="mt-1" value={data.policy}
                            onChange={(html) => setData('policy', html)}
                            placeholder="Editorial standards specific to this section" />
                        <InputError className="mt-1" message={errors.policy} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="s-wordcount" value="Word Count Limit" />
                            <TextInput id="s-wordcount" type="number" min="0" className="mt-1 block w-full" value={data.word_count_limit}
                                onChange={(e) => setData('word_count_limit', e.target.value)} placeholder="e.g. 8000" />
                            <InputError className="mt-1" message={errors.word_count_limit} />
                        </div>
                        <div>
                            <InputLabel htmlFor="s-identify" value="Identify Items As" />
                            <TextInput id="s-identify" className="mt-1 block w-full" value={data.identify_as}
                                onChange={(e) => setData('identify_as', e.target.value)} placeholder="e.g. Article" />
                            <InputError className="mt-1" message={errors.identify_as} />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={data.is_peer_reviewed}
                            onChange={(e) => setData('is_peer_reviewed', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-900" />
                        Peer reviewed
                    </label>
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
                                <p className="text-sm font-medium text-gray-900">
                                    {section.title}
                                    {section.abbreviation && <span className="ml-1 text-xs text-gray-400">({section.abbreviation})</span>}
                                </p>
                                {section.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{stripHtml(section.description)}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {section.identify_as && `${section.identify_as} · `}
                                    {section.is_peer_reviewed ? 'Peer reviewed' : 'Not peer reviewed'}
                                    {section.word_count_limit ? ` · ${section.word_count_limit} word limit` : ''}
                                </p>
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

// ── Categories tab ────────────────────────────────────────────────────────────
function CategoriesTab({ journal }) {
    const [adding, setAdding] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm({
        name: '', parent_id: '', description: '', article_ordering: 'sequential',
        is_active: true, cover_image: null,
    });

    const flat = flattenCategories(journal.categories);

    const submit = (e) => {
        e.preventDefault();
        post(`/journals/${journal.slug}/categories`, {
            forceFormData: true,
            onSuccess: () => { reset(); setAdding(false); },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{journal.categories.length} categor{journal.categories.length !== 1 ? 'ies' : 'y'}</p>
                <button onClick={() => setAdding(!adding)}
                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">
                    + Add Category
                </button>
            </div>

            {adding && (
                <form onSubmit={submit} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">New Category</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="c-name" value="Name *" />
                            <TextInput id="c-name" className="mt-1 block w-full" value={data.name}
                                onChange={(e) => setData('name', e.target.value)} required isFocused
                                placeholder="e.g. Clinical Studies" />
                            <InputError className="mt-1" message={errors.name} />
                        </div>
                        <div>
                            <InputLabel htmlFor="c-parent" value="Parent Category" />
                            <select id="c-parent" value={data.parent_id}
                                onChange={(e) => setData('parent_id', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="">— None (top level) —</option>
                                {flat.map((c) => (
                                    <option key={c.id} value={c.id}>{'—'.repeat(c.depth)} {c.name}</option>
                                ))}
                            </select>
                            <InputError className="mt-1" message={errors.parent_id} />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="c-desc" value="Description" />
                        <RichTextEditor id="c-desc" rows={2} className="mt-1" value={data.description}
                            onChange={(html) => setData('description', html)} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="c-order" value="Order of Articles" />
                            <select id="c-order" value={data.article_ordering}
                                onChange={(e) => setData('article_ordering', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                {ARTICLE_ORDERINGS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <InputLabel htmlFor="c-cover" value="Cover Image" />
                            <input id="c-cover" type="file" accept="image/*"
                                className="mt-1 block w-full text-sm text-gray-500"
                                onChange={(e) => setData('cover_image', e.target.files[0])} />
                            <InputError className="mt-1" message={errors.cover_image} />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <PrimaryButton disabled={processing}>Add</PrimaryButton>
                        <button type="button" onClick={() => setAdding(false)}
                            className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                </form>
            )}

            {flat.length === 0 && !adding ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                    No categories yet. Add one to help readers browse by topic.
                </div>
            ) : (
                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {flat.map((category) => (
                        <div key={category.id} className="flex items-center justify-between px-5 py-3"
                            style={{ paddingLeft: `${1.25 + category.depth * 1.25}rem` }}>
                            <div>
                                <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                {category.description && (
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{stripHtml(category.description)}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${category.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <Link
                                    href={`/journals/${journal.slug}/categories/${category.id}`}
                                    method="delete" as="button"
                                    className="text-xs text-red-500 hover:text-red-700"
                                    onClick={(e) => { if (!confirm('Delete this category? Any subcategories will be moved to top level.')) e.preventDefault(); }}
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

// ── Editorial Team tab ────────────────────────────────────────────────────────
function EditorialTeamTab({ journal }) {
    const [adding, setAdding] = useState(false);
    const { data, setData, post, reset, processing, errors } = useForm({
        name: '', title: '', affiliation: '', email: '', orcid: '', bio: '', is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(`/journals/${journal.slug}/editorial-members`, {
            onSuccess: () => { reset(); setAdding(false); },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {journal.editorial_members.length} member{journal.editorial_members.length !== 1 ? 's' : ''}
                </p>
                <button onClick={() => setAdding(!adding)}
                    className="rounded-lg bg-blue-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800">
                    + Add Member
                </button>
            </div>

            {adding && (
                <form onSubmit={submit} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900">New Editorial Team Member</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="m-name" value="Name *" />
                            <TextInput id="m-name" className="mt-1 block w-full" value={data.name}
                                onChange={(e) => setData('name', e.target.value)} required isFocused
                                placeholder="e.g. Jane Doe" />
                            <InputError className="mt-1" message={errors.name} />
                        </div>
                        <div>
                            <InputLabel htmlFor="m-title" value="Masthead Title *" />
                            <TextInput id="m-title" className="mt-1 block w-full" value={data.title}
                                onChange={(e) => setData('title', e.target.value)} required
                                placeholder="e.g. Editor-in-Chief" />
                            <InputError className="mt-1" message={errors.title} />
                        </div>
                        <div>
                            <InputLabel htmlFor="m-affiliation" value="Affiliation" />
                            <TextInput id="m-affiliation" className="mt-1 block w-full" value={data.affiliation}
                                onChange={(e) => setData('affiliation', e.target.value)} placeholder="e.g. MIT" />
                        </div>
                        <div>
                            <InputLabel htmlFor="m-orcid" value="ORCID" />
                            <TextInput id="m-orcid" className="mt-1 block w-full" value={data.orcid}
                                onChange={(e) => setData('orcid', e.target.value)} placeholder="0000-0000-0000-0000" />
                            <InputError className="mt-1" message={errors.orcid} />
                        </div>
                        <div>
                            <InputLabel htmlFor="m-email" value="Email" />
                            <TextInput id="m-email" type="email" className="mt-1 block w-full" value={data.email}
                                onChange={(e) => setData('email', e.target.value)} />
                            <InputError className="mt-1" message={errors.email} />
                        </div>
                    </div>
                    <div>
                        <InputLabel htmlFor="m-bio" value="Bio" />
                        <RichTextEditor id="m-bio" rows={2} className="mt-1" value={data.bio}
                            onChange={(html) => setData('bio', html)} />
                    </div>
                    <div className="flex gap-3">
                        <PrimaryButton disabled={processing}>Add</PrimaryButton>
                        <button type="button" onClick={() => setAdding(false)}
                            className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </div>
                </form>
            )}

            {journal.editorial_members.length === 0 && !adding ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                    No editorial team members yet. Add one to populate the public masthead.
                </div>
            ) : (
                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {journal.editorial_members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between px-5 py-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {member.title}{member.affiliation ? ` — ${member.affiliation}` : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-medium ${member.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                    {member.is_active ? 'Public' : 'Hidden'}
                                </span>
                                <Link
                                    href={`/journals/${journal.slug}/editorial-members/${member.id}`}
                                    method="delete" as="button"
                                    className="text-xs text-red-500 hover:text-red-700"
                                    onClick={(e) => { if (!confirm('Remove this editorial team member?')) e.preventDefault(); }}
                                >
                                    Remove
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
                <p className="mt-1 text-xs text-gray-500">Displayed on the public Author Guidelines page.</p>
                <RichTextEditor id="author_guidelines" rows={18} className="mt-2" value={data.author_guidelines}
                    onChange={(html) => setData('author_guidelines', html)} />
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
                <RichTextEditor id="review_policy" rows={18} className="mt-2" value={data.review_policy}
                    onChange={(html) => setData('review_policy', html)} />
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
                    {activeTab === 'General'        && <GeneralTab journal={journal} />}
                    {activeTab === 'Contact'        && <ContactTab journal={journal} />}
                    {activeTab === 'Sections'       && <SectionsTab journal={journal} />}
                    {activeTab === 'Categories'     && <CategoriesTab journal={journal} />}
                    {activeTab === 'Editorial Team' && <EditorialTeamTab journal={journal} />}
                    {activeTab === 'Guidelines'     && <GuidelinesTab journal={journal} />}
                    {activeTab === 'Policies'       && <PoliciesTab journal={journal} />}
                </div>
            </div>
        </DashboardLayout>
    );
}
