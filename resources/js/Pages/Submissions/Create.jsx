import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STEPS = ['Start', 'Manuscript', 'Metadata', 'Contributors', 'Confirm'];

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBar({ current }) {
    return (
        <div className="flex items-center justify-between mb-8">
            {STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <div key={label} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                                ${done ? 'bg-green-600 text-white' : active ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {done ? '✓' : i + 1}
                            </div>
                            <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-blue-900' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${done ? 'bg-green-600' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function NavButtons({ step, total, onBack, onNext, onSubmit, processing, nextLabel }) {
    return (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
            <button type="button" onClick={onBack} disabled={step === 0}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30">
                ← Back
            </button>
            {step < total - 1 ? (
                <button type="button" onClick={onNext}
                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800">
                    {nextLabel ?? 'Continue →'}
                </button>
            ) : (
                <button type="button" onClick={onSubmit} disabled={processing}
                    className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50">
                    {processing ? 'Submitting…' : 'Submit Manuscript'}
                </button>
            )}
        </div>
    );
}

// ── Step 1: Start ──────────────────────────────────────────────────────────────
function StepStart({ data, setData, errors, journals }) {
    const sections = journals.find(j => j.id === Number(data.journal_id))?.sections ?? [];

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Select Journal & Section</h3>
            <div>
                <InputLabel htmlFor="journal_id" value="Journal *" />
                <select id="journal_id" value={data.journal_id}
                    onChange={e => setData('journal_id', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Select a journal…</option>
                    {journals.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
                <InputError className="mt-1" message={errors.journal_id} />
            </div>
            {sections.length > 0 && (
                <div>
                    <InputLabel htmlFor="section_id" value="Section *" />
                    <select id="section_id" value={data.section_id}
                        onChange={e => setData('section_id', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="">Select a section…</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                    <InputError className="mt-1" message={errors.section_id} />
                </div>
            )}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Submission Checklist</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>The submission has not been previously published.</li>
                    <li>The file is in PDF, DOC, DOCX, or ODT format.</li>
                    <li>All references are formatted correctly.</li>
                    <li>Author information is complete and correct.</li>
                </ul>
            </div>
        </div>
    );
}

// ── Step 2: Upload manuscript ──────────────────────────────────────────────────
function StepManuscript({ data, setData, errors }) {
    const file = data.manuscript;
    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Upload Manuscript</h3>
            <div className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors
                ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400'}`}>
                {file ? (
                    <div>
                        <p className="text-green-700 font-medium">{file.name}</p>
                        <p className="text-sm text-green-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button onClick={() => setData('manuscript', null)}
                            className="mt-3 text-xs text-red-500 hover:text-red-700">Remove</button>
                    </div>
                ) : (
                    <div>
                        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-3 text-sm text-gray-600">
                            <label className="cursor-pointer font-medium text-blue-900 hover:underline">
                                Choose file
                                <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.odt"
                                    onChange={e => setData('manuscript', e.target.files[0])} />
                            </label>
                            {' '}or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-400">PDF, DOC, DOCX, ODT — max 50 MB</p>
                    </div>
                )}
            </div>
            <InputError message={errors.manuscript} />
        </div>
    );
}

// ── Step 3: Metadata ───────────────────────────────────────────────────────────
function StepMetadata({ data, setData, errors }) {
    const [kwInput, setKwInput] = useState('');

    const addKeyword = () => {
        const kw = kwInput.trim();
        if (kw && !data.keywords.includes(kw)) {
            setData('keywords', [...data.keywords, kw]);
        }
        setKwInput('');
    };

    const removeKeyword = (kw) => setData('keywords', data.keywords.filter(k => k !== kw));

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Manuscript Metadata</h3>
            <div>
                <InputLabel htmlFor="title" value="Title *" />
                <TextInput id="title" className="mt-1 block w-full" value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Full manuscript title" />
                <InputError className="mt-1" message={errors.title} />
            </div>
            <div>
                <InputLabel htmlFor="abstract" value="Abstract *" />
                <textarea id="abstract" rows={8}
                    className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={data.abstract} onChange={e => setData('abstract', e.target.value)}
                    placeholder="Provide a concise summary of your manuscript..." />
                <p className="mt-1 text-xs text-gray-400">{data.abstract.length} characters</p>
                <InputError className="mt-1" message={errors.abstract} />
            </div>
            <div>
                <InputLabel value="Keywords" />
                <div className="mt-1 flex gap-2">
                    <TextInput className="flex-1" value={kwInput}
                        onChange={e => setKwInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                        placeholder="Type a keyword and press Enter" />
                    <button type="button" onClick={addKeyword}
                        className="rounded-md border border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-50">
                        Add
                    </button>
                </div>
                {data.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {data.keywords.map(kw => (
                            <span key={kw} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
                                {kw}
                                <button onClick={() => removeKeyword(kw)} className="text-blue-500 hover:text-blue-700 ml-1">×</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Step 4: Contributors ───────────────────────────────────────────────────────
function StepContributors({ data, setData, errors }) {
    const updateAuthor = (i, field, value) => {
        const updated = [...data.authors];
        updated[i] = { ...updated[i], [field]: value };
        setData('authors', updated);
    };

    const addAuthor = () => setData('authors', [...data.authors, { name: '', email: '', affiliation: '', country: '', orcid: '' }]);
    const removeAuthor = (i) => setData('authors', data.authors.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Contributors</h3>
            <p className="text-sm text-gray-500">The first author will be marked as corresponding author.</p>

            {data.authors.map((author, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">
                            {i === 0 ? 'Corresponding Author' : `Author ${i + 1}`}
                        </span>
                        {i > 0 && (
                            <button onClick={() => removeAuthor(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <InputLabel value="Full Name *" />
                            <TextInput className="mt-1 block w-full" value={author.name}
                                onChange={e => updateAuthor(i, 'name', e.target.value)} placeholder="Full name" />
                            <InputError message={errors[`authors.${i}.name`]} />
                        </div>
                        <div>
                            <InputLabel value="Email *" />
                            <TextInput type="email" className="mt-1 block w-full" value={author.email}
                                onChange={e => updateAuthor(i, 'email', e.target.value)} placeholder="email@institution.edu" />
                            <InputError message={errors[`authors.${i}.email`]} />
                        </div>
                        <div>
                            <InputLabel value="Affiliation" />
                            <TextInput className="mt-1 block w-full" value={author.affiliation}
                                onChange={e => updateAuthor(i, 'affiliation', e.target.value)} placeholder="University / Institution" />
                        </div>
                        <div>
                            <InputLabel value="Country" />
                            <TextInput className="mt-1 block w-full" value={author.country}
                                onChange={e => updateAuthor(i, 'country', e.target.value)} placeholder="e.g. United States" />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel value="ORCID iD" />
                            <TextInput className="mt-1 block w-full" value={author.orcid}
                                onChange={e => updateAuthor(i, 'orcid', e.target.value)} placeholder="0000-0000-0000-0000" />
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addAuthor}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-700">
                + Add Co-Author
            </button>
        </div>
    );
}

// ── Step 5: Confirm ────────────────────────────────────────────────────────────
function StepConfirm({ data, journals }) {
    const journal = journals.find(j => j.id === Number(data.journal_id));
    const section = journal?.sections.find(s => s.id === Number(data.section_id));

    return (
        <div className="space-y-5">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Submission</h3>
            <p className="text-sm text-gray-500">Please review the details below before submitting.</p>

            <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
                {[
                    ['Journal', journal?.title],
                    ['Section', section?.title],
                    ['Title', data.title],
                    ['File', data.manuscript?.name],
                    ['Authors', data.authors.filter(a => a.name).map(a => a.name).join(', ')],
                    ['Keywords', data.keywords.join(', ') || '—'],
                ].map(([label, value]) => (
                    <div key={label} className="flex gap-4 px-4 py-3">
                        <dt className="w-24 shrink-0 text-sm font-medium text-gray-500">{label}</dt>
                        <dd className="text-sm text-gray-900 break-words">{value || '—'}</dd>
                    </div>
                ))}
            </dl>

            {data.abstract && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Abstract</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">{data.abstract}</p>
                </div>
            )}
        </div>
    );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export default function Create({ journals, authUser }) {
    const [step, setStep] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        journal_id: '',
        section_id: '',
        title:      '',
        abstract:   '',
        keywords:   [],
        authors:    [{
            name:        authUser.name,
            email:       authUser.email,
            affiliation: authUser.affiliation ?? '',
            country:     authUser.country ?? '',
            orcid:       authUser.orcid ?? '',
        }],
        manuscript: null,
    });

    const validateStep = () => {
        if (step === 0) return data.journal_id && data.section_id;
        if (step === 1) return !!data.manuscript;
        if (step === 2) return data.title.trim() && data.abstract.trim();
        if (step === 3) return data.authors.length > 0 && data.authors[0].name && data.authors[0].email;
        return true;
    };

    const next = () => { if (validateStep()) setStep(s => s + 1); };
    const back = () => setStep(s => s - 1);

    const submit = () => {
        post('/submissions', { forceFormData: true });
    };

    return (
        <DashboardLayout title="New Submission">
            <Head title="New Submission" />

            <div className="mx-auto max-w-2xl">
                <StepBar current={step} />

                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                    {step === 0 && <StepStart data={data} setData={setData} errors={errors} journals={journals} />}
                    {step === 1 && <StepManuscript data={data} setData={setData} errors={errors} />}
                    {step === 2 && <StepMetadata data={data} setData={setData} errors={errors} />}
                    {step === 3 && <StepContributors data={data} setData={setData} errors={errors} />}
                    {step === 4 && <StepConfirm data={data} journals={journals} />}

                    <NavButtons
                        step={step} total={STEPS.length}
                        onBack={back} onNext={next} onSubmit={submit}
                        processing={processing}
                        nextLabel={step === STEPS.length - 2 ? 'Review →' : undefined}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
