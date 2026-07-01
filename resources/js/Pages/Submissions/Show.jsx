import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const STATUS_COLORS = {
    draft:             'bg-gray-100 text-gray-600',
    submitted:         'bg-blue-100 text-blue-800',
    initial_check:     'bg-sky-100 text-sky-800',
    editor_assigned:   'bg-indigo-100 text-indigo-800',
    under_review:      'bg-violet-100 text-violet-800',
    revision_required: 'bg-amber-100 text-amber-800',
    revised:           'bg-orange-100 text-orange-800',
    accepted:          'bg-green-100 text-green-800',
    rejected:          'bg-red-100 text-red-800',
    copyediting:       'bg-teal-100 text-teal-800',
    production:        'bg-cyan-100 text-cyan-800',
    scheduled:         'bg-emerald-100 text-emerald-800',
    published:         'bg-green-200 text-green-900',
};

const TRANSITION_LABELS = {
    pass_initial_check:     'Pass Initial Check',
    send_to_review:         'Send to Peer Review',
    request_revision:       'Request Revision',
    accept:                 'Accept',
    reject:                 'Reject',
    send_back_to_review:    'Send Back to Review',
    move_to_copyediting:    'Move to Copyediting',
    move_to_production:     'Move to Production',
    approve_for_scheduling: 'Approve for Scheduling',
};

const TRANSITION_COLORS = {
    pass_initial_check:     'bg-sky-600 hover:bg-sky-700',
    send_to_review:         'bg-violet-600 hover:bg-violet-700',
    request_revision:       'bg-amber-500 hover:bg-amber-600',
    accept:                 'bg-green-600 hover:bg-green-700',
    reject:                 'bg-red-600 hover:bg-red-700',
    send_back_to_review:    'bg-indigo-600 hover:bg-indigo-700',
    move_to_copyediting:    'bg-teal-600 hover:bg-teal-700',
    move_to_production:     'bg-cyan-600 hover:bg-cyan-700',
    approve_for_scheduling: 'bg-emerald-600 hover:bg-emerald-700',
};

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

function SummaryTab({ submission }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Abstract</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {submission.abstract ?? <span className="italic text-gray-400">No abstract provided.</span>}
                </p>
            </div>

            {submission.keywords?.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                        {submission.keywords.map(kw => (
                            <span key={kw} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">{kw}</span>
                        ))}
                    </div>
                </div>
            )}

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                    ['Journal', submission.journal?.title],
                    ['Section', submission.section],
                    ['Submitted', submission.submitted_at ?? 'Not yet submitted'],
                    ['Status', null],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                        <dt className="text-xs font-medium text-gray-400">{label}</dt>
                        <dd className="mt-1 text-sm font-medium text-gray-900">
                            {label === 'Status'
                                ? <StatusBadge status={submission.status} label={submission.status_label} />
                                : value ?? <span className="text-gray-400">—</span>
                            }
                        </dd>
                    </div>
                ))}
            </dl>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Authors</h3>
                <div className="space-y-2">
                    {submission.authors.map(author => (
                        <div key={author.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white">
                                {author.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {author.name}
                                    {author.is_corresponding && (
                                        <span className="ml-2 text-xs font-normal text-blue-600">(Corresponding)</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{author.email}
                                    {author.affiliation && ` · ${author.affiliation}`}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FilesTab({ submission }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Submission Files</h3>
            {submission.files.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No files uploaded.</p>
            ) : (
                <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {submission.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-5 py-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{file.original_name}</p>
                                    <p className="text-xs text-gray-400">v{file.version} · {file.size} · {file.uploaded_at.split('T')[0]}</p>
                                </div>
                            </div>
                            <a href={file.download_url}
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                Download
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActivityTab({ submission }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Activity Log</h3>
            <div className="space-y-1">
                <div className="flex gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
                    <span className="shrink-0 text-gray-400">{submission.submitted_at ?? submission.created_at}</span>
                    <span className="text-gray-700">
                        {submission.status === 'draft' ? 'Submission draft created.' : 'Manuscript submitted by author.'}
                    </span>
                </div>
            </div>
        </div>
    );
}

const DECISION_COLORS = {
    accept:              'bg-green-100 text-green-800',
    reject:              'bg-red-100 text-red-800',
    request_revision:    'bg-amber-100 text-amber-800',
    send_back_to_review: 'bg-violet-100 text-violet-800',
};

function DecisionBadge({ decision, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${DECISION_COLORS[decision] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

const REVIEW_STATUS_COLORS = {
    invited:   'bg-blue-100 text-blue-800',
    accepted:  'bg-green-100 text-green-800',
    declined:  'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-gray-100 text-gray-400',
};

const RECOMMENDATION_COLORS = {
    accept:         'text-green-700 bg-green-50',
    minor_revision: 'text-amber-700 bg-amber-50',
    major_revision: 'text-orange-700 bg-orange-50',
    reject:         'text-red-700 bg-red-50',
};

function EditorialTab({ submission, availableEditors, availableTransitions, availableReviewers, canConvertToArticle, articleId }) {
    const assignForm = useForm({ editor_id: '', role: 'editor' });
    const transitionForm = useForm({ transition: '', comments: '' });
    const inviteForm = useForm({ reviewer_id: '', due_date: '' });

    function handleAssign(e) {
        e.preventDefault();
        assignForm.post(route('editorial.assign', submission.id), {
            preserveScroll: true,
            onSuccess: () => assignForm.reset(),
        });
    }

    function handleUnassign(editorId) {
        if (!confirm('Remove this editor?')) return;
        router.delete(route('editorial.unassign', submission.id), {
            data: { editor_id: editorId },
            preserveScroll: true,
        });
    }

    function handleTransition(t) {
        transitionForm.setData('transition', t);
        transitionForm.post(route('editorial.transition', submission.id), {
            preserveScroll: true,
            onSuccess: () => transitionForm.reset(),
        });
    }

    function handleInviteReviewer(e) {
        e.preventDefault();
        inviteForm.post(route('reviews.invite', submission.id), {
            preserveScroll: true,
            onSuccess: () => inviteForm.reset(),
        });
    }

    function handleCancelReview(assignmentId) {
        if (!confirm('Cancel this review invitation?')) return;
        router.delete(route('reviews.cancel', { submission: submission.id, assignment: assignmentId }), {
            preserveScroll: true,
        });
    }

    return (
        <div className="space-y-8">
            {/* Assigned editors */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Assigned Editors</h3>
                {submission.assignments?.length === 0 ? (
                    <p className="text-sm italic text-gray-400">No editors assigned yet.</p>
                ) : (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {submission.assignments.map(a => (
                            <div key={a.id} className="flex items-center justify-between bg-white px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{a.editor.name}</p>
                                    <p className="text-xs text-gray-400 capitalize">{a.role.replace('_', ' ')} · Assigned {a.assigned_at}</p>
                                </div>
                                <button onClick={() => handleUnassign(a.editor.id)} className="text-xs text-red-500 hover:underline">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign editor form */}
            {availableEditors.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Assign Editor</h3>
                    <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Editor</label>
                            <select
                                value={assignForm.data.editor_id}
                                onChange={e => assignForm.setData('editor_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select editor…</option>
                                {availableEditors.map(e => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.roles?.join(', ')})</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-44">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                            <select
                                value={assignForm.data.role}
                                onChange={e => assignForm.setData('role', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            >
                                <option value="editor">Editor</option>
                                <option value="section_editor">Section Editor</option>
                            </select>
                        </div>
                        <button type="submit" disabled={assignForm.processing}
                            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                            Assign
                        </button>
                    </form>
                </div>
            )}

            {/* Peer review section */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Peer Review</h3>

                {/* Current review assignments */}
                {submission.review_assignments?.length > 0 && (
                    <div className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {submission.review_assignments.map(ra => (
                            <div key={ra.id} className="bg-white px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-gray-900">{ra.reviewer.name}</p>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${REVIEW_STATUS_COLORS[ra.status] ?? 'bg-gray-100'}`}>
                                                {ra.status_label}
                                            </span>
                                        </div>
                                        {ra.due_date && (
                                            <p className="text-xs text-gray-400">Due: {ra.due_date}</p>
                                        )}
                                        {ra.review && (
                                            <div className="mt-2">
                                                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${RECOMMENDATION_COLORS[ra.review.recommendation] ?? ''}`}>
                                                    {ra.review.recommendation_label}
                                                </span>
                                                {ra.review.comments_to_editor && (
                                                    <p className="mt-1 text-xs text-gray-600 italic line-clamp-2">"{ra.review.comments_to_editor}"</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {['invited', 'accepted'].includes(ra.status) && (
                                        <button onClick={() => handleCancelReview(ra.id)}
                                            className="shrink-0 text-xs text-red-500 hover:underline">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Invite reviewer form */}
                {availableReviewers?.length > 0 && (
                    <form onSubmit={handleInviteReviewer} className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-40">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer</label>
                            <select
                                value={inviteForm.data.reviewer_id}
                                onChange={e => inviteForm.setData('reviewer_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                required
                            >
                                <option value="">Select reviewer…</option>
                                {availableReviewers.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-44">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date (optional)</label>
                            <input
                                type="date"
                                value={inviteForm.data.due_date}
                                onChange={e => inviteForm.setData('due_date', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                        <button type="submit" disabled={inviteForm.processing}
                            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white hover:bg-violet-800 disabled:opacity-50">
                            Invite Reviewer
                        </button>
                    </form>
                )}
                {availableReviewers?.length === 0 && submission.review_assignments?.length === 0 && (
                    <p className="text-sm italic text-gray-400">No reviewers available. Ensure users have the reviewer role assigned.</p>
                )}
                {inviteForm.errors.reviewer_id && (
                    <p className="mt-1 text-xs text-red-500">{inviteForm.errors.reviewer_id}</p>
                )}
            </div>

            {/* Status transitions */}
            {availableTransitions.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Make Decision</h3>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Comments (shared with author for formal decisions)</label>
                        <textarea
                            value={transitionForm.data.comments}
                            onChange={e => transitionForm.setData('comments', e.target.value)}
                            rows={3}
                            placeholder="Add comments for the author or editorial record…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {availableTransitions.map(t => (
                            <button key={t} onClick={() => handleTransition(t)} disabled={transitionForm.processing}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${TRANSITION_COLORS[t] ?? 'bg-gray-600 hover:bg-gray-700'}`}>
                                {TRANSITION_LABELS[t] ?? t}
                            </button>
                        ))}
                    </div>
                    {transitionForm.errors.transition && (
                        <p className="mt-2 text-xs text-red-500">{transitionForm.errors.transition}</p>
                    )}
                </div>
            )}

            {/* Convert to article */}
            {(canConvertToArticle || articleId) && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Publishing</h3>
                    {articleId ? (
                        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                            <span className="text-sm text-green-800">Article created.</span>
                            <Link href={route('issues.index')}
                                className="text-sm font-medium text-green-700 hover:underline">
                                Go to Issues →
                            </Link>
                        </div>
                    ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <p className="text-sm text-emerald-800 mb-3">
                                This submission is <strong>scheduled</strong>. Convert it to an article and assign it to an issue to publish.
                            </p>
                            <form onSubmit={e => { e.preventDefault(); router.post(route('articles.convert', submission.id)); }}>
                                <button type="submit"
                                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
                                    Convert to Article
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Decision history */}
            {submission.decisions?.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Decision History</h3>
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {submission.decisions.map(d => (
                            <div key={d.id} className="bg-white px-4 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <DecisionBadge decision={d.decision} label={d.label} />
                                        <span className="text-xs text-gray-400">by {d.editor} on {d.decided_at}</span>
                                    </div>
                                </div>
                                {d.comments && (
                                    <p className="mt-1 text-xs text-gray-600 italic">"{d.comments}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function RevisionUploadTab({ submission }) {
    const form = useForm({ manuscript: null });
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState('');

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            form.setData('manuscript', file);
            setFileName(file.name);
        }
    }

    function handleSubmit(e) {
        e.preventDefault();
        form.post(route('submissions.revise', submission.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { form.reset(); setFileName(''); },
        });
    }

    const revisionFiles = submission.revision_files ?? [];

    return (
        <div className="space-y-6">
            {/* Revision instructions */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-semibold text-amber-800">Revision Required</p>
                <p className="mt-1 text-sm text-amber-700">
                    The editor has requested revisions to your manuscript. Please address all comments and upload
                    your revised manuscript below.
                </p>
                {submission.decisions?.filter(d => d.decision === 'request_revision').slice(0, 1).map(d => (
                    d.comments && (
                        <blockquote key={d.id} className="mt-3 border-l-4 border-amber-400 pl-3 text-sm text-amber-800 italic">
                            "{d.comments}" — {d.editor}, {d.decided_at}
                        </blockquote>
                    )
                ))}
            </div>

            {/* Previous revisions */}
            {revisionFiles.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Previously Uploaded Revisions</h3>
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                        {revisionFiles.map(f => (
                            <div key={f.id} className="flex items-center justify-between bg-white px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{f.original_name}</p>
                                    <p className="text-xs text-gray-400">v{f.version} · {f.size}</p>
                                </div>
                                <a href={f.download_url}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload form */}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Upload Revised Manuscript</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                        <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">
                            {fileName || 'Click to select revised manuscript'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, or ODT · Max 50 MB</p>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.odt"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    {form.errors.manuscript && (
                        <p className="text-xs text-red-500">{form.errors.manuscript}</p>
                    )}
                    <button
                        type="submit"
                        disabled={!form.data.manuscript || form.processing}
                        className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                        {form.processing ? 'Uploading…' : 'Submit Revision'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function StageFileList({ files, onDelete, canDelete }) {
    if (!files?.length) return <p className="text-sm italic text-gray-400">No files uploaded yet.</p>;
    return (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {files.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-white px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{f.original_name}</p>
                            <p className="text-xs text-gray-400">v{f.version} · {f.size} · {f.uploaded_by} · {f.uploaded_at}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a href={f.download_url}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                            Download
                        </a>
                        {canDelete && (
                            <button onClick={() => onDelete(f.id)} className="text-xs text-red-500 hover:underline">
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StageFileUpload({ label, accept, uploadRoute }) {
    const form = useForm({ file: null, label: '' });
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState('');

    function handleChange(e) {
        const f = e.target.files[0];
        if (f) { form.setData('file', f); setFileName(f.name); }
    }

    function handleSubmit(e) {
        e.preventDefault();
        form.post(uploadRoute, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { form.reset(); setFileName(''); },
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-48">
                <input type="text" value={form.data.label} onChange={e => form.setData('label', e.target.value)}
                    placeholder={`Label (optional)`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <button type="button" onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                {fileName ? fileName.slice(0, 24) + (fileName.length > 24 ? '…' : '') : `Choose ${label}`}
            </button>
            <input ref={fileRef} type="file" accept={accept} onChange={handleChange} className="hidden" />
            <button type="submit" disabled={!form.data.file || form.processing}
                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
                {form.processing ? 'Uploading…' : 'Upload'}
            </button>
            {form.errors.file && <p className="w-full text-xs text-red-500">{form.errors.file}</p>}
        </form>
    );
}

function CopyeditingTab({ submission, availableTransitions }) {
    const transitionForm = useForm({ transition: '', comments: '' });
    const isActive = submission.status === 'copyediting';
    const copyeditingTransitions = availableTransitions.filter(t => t === 'move_to_production');

    function handleDelete(fileId) {
        if (!confirm('Delete this file?')) return;
        router.delete(route('copyediting.delete_file', { submission: submission.id, file: fileId }), { preserveScroll: true });
    }

    function handleTransition(t) {
        transitionForm.setData('transition', t);
        transitionForm.post(route('editorial.transition', submission.id), { preserveScroll: true, onSuccess: () => transitionForm.reset() });
    }

    return (
        <div className="space-y-6">
            {isActive && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                    Submission is in the <strong>copyediting</strong> stage. Upload edited manuscript files, then move to production when complete.
                </div>
            )}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Copyediting Files</h3>
                <StageFileList files={submission.copyediting_files} onDelete={handleDelete} canDelete={isActive} />
                {isActive && (
                    <div className="mt-4">
                        <StageFileUpload label="Copyedited File" accept=".pdf,.doc,.docx,.odt,.html,.xml"
                            uploadRoute={route('copyediting.upload_copyediting', submission.id)} />
                    </div>
                )}
            </div>
            {copyeditingTransitions.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Stage Action</h3>
                    <textarea value={transitionForm.data.comments} onChange={e => transitionForm.setData('comments', e.target.value)}
                        rows={2} placeholder="Notes for the production team…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none mb-2" />
                    <div className="flex gap-2">
                        {copyeditingTransitions.map(t => (
                            <button key={t} onClick={() => handleTransition(t)} disabled={transitionForm.processing}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${TRANSITION_COLORS[t]}`}>
                                {TRANSITION_LABELS[t]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductionTab({ submission, availableTransitions }) {
    const transitionForm = useForm({ transition: '', comments: '' });
    const isActive = submission.status === 'production';
    const productionTransitions = availableTransitions.filter(t => t === 'approve_for_scheduling');

    function handleDelete(fileId) {
        if (!confirm('Delete this galley?')) return;
        router.delete(route('copyediting.delete_file', { submission: submission.id, file: fileId }), { preserveScroll: true });
    }

    function handleTransition(t) {
        transitionForm.setData('transition', t);
        transitionForm.post(route('editorial.transition', submission.id), { preserveScroll: true, onSuccess: () => transitionForm.reset() });
    }

    return (
        <div className="space-y-6">
            {isActive && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                    Submission is in <strong>production</strong>. Upload final galley files (PDF, HTML, XML, ePub), then approve for scheduling.
                </div>
            )}
            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Galley Files</h3>
                <StageFileList files={submission.galley_files} onDelete={handleDelete} canDelete={isActive} />
                {isActive && (
                    <div className="mt-4">
                        <StageFileUpload label="Galley File" accept=".pdf,.html,.xml,.epub"
                            uploadRoute={route('copyediting.upload_galley', submission.id)} />
                    </div>
                )}
            </div>
            {productionTransitions.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Stage Action</h3>
                    <p className="text-xs text-gray-500 mb-2">Ensure all galley files are uploaded before approving.</p>
                    <textarea value={transitionForm.data.comments} onChange={e => transitionForm.setData('comments', e.target.value)}
                        rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none mb-2" />
                    <div className="flex gap-2">
                        {productionTransitions.map(t => (
                            <button key={t} onClick={() => handleTransition(t)} disabled={transitionForm.processing}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${TRANSITION_COLORS[t]}`}>
                                {TRANSITION_LABELS[t]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Show({ submission, canManage, canCopyedit = false, canProduction = false, canUploadRevision = false, canConvertToArticle = false, articleId = null, availableEditors = [], availableTransitions = [], availableReviewers = [] }) {
    const tabs = [
        'Summary',
        'Files',
        ...(canManage ? ['Editorial'] : []),
        ...(canUploadRevision ? ['Revisions'] : []),
        ...(canCopyedit ? ['Copyediting'] : []),
        ...(canProduction ? ['Production'] : []),
        'Activity Log',
    ];
    const [activeTab, setActiveTab] = useState('Summary');
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title="Submission Detail">
            <Head title={submission.title} />

            <div className="mx-auto max-w-4xl space-y-4">
                <Link href="/submissions" className="text-sm text-blue-900 hover:underline">← Back to Submissions</Link>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Header card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{submission.title}</h1>
                            <p className="mt-1 text-sm text-gray-500">#{submission.id} · {submission.journal?.title}</p>
                        </div>
                        <StatusBadge status={submission.status} label={submission.status_label} />
                    </div>
                </div>

                {/* Tab bar */}
                <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                    {tabs.map(tab => (
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
                    {activeTab === 'Summary'   && <SummaryTab submission={submission} />}
                    {activeTab === 'Files'     && <FilesTab submission={submission} />}
                    {activeTab === 'Editorial' && (
                        <EditorialTab
                            submission={submission}
                            availableEditors={availableEditors}
                            availableTransitions={availableTransitions}
                            availableReviewers={availableReviewers}
                            canConvertToArticle={canConvertToArticle}
                            articleId={articleId}
                        />
                    )}
                    {activeTab === 'Revisions'    && <RevisionUploadTab submission={submission} />}
                    {activeTab === 'Copyediting'  && <CopyeditingTab submission={submission} availableTransitions={availableTransitions} />}
                    {activeTab === 'Production'   && <ProductionTab submission={submission} availableTransitions={availableTransitions} />}
                    {activeTab === 'Activity Log' && <ActivityTab submission={submission} />}
                </div>
            </div>
        </DashboardLayout>
    );
}
