import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const RECOMMENDATION_COLORS = {
    accept:         'text-green-700 bg-green-50 border-green-200',
    minor_revision: 'text-amber-700 bg-amber-50 border-amber-200',
    major_revision: 'text-orange-700 bg-orange-50 border-orange-200',
    reject:         'text-red-700 bg-red-50 border-red-200',
};

const STATUS_COLORS = {
    invited:   'bg-blue-100 text-blue-800',
    accepted:  'bg-green-100 text-green-800',
    declined:  'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-gray-100 text-gray-400',
};

function StatusBadge({ status, label }) {
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

function InvitationPanel({ assignment }) {
    const acceptForm = useForm({});
    const declineForm = useForm({ reason: '' });
    const [showDecline, setShowDecline] = React.useState(false);

    function handleAccept(e) {
        e.preventDefault();
        acceptForm.post(route('reviews.accept', assignment.id), { preserveScroll: true });
    }

    function handleDecline(e) {
        e.preventDefault();
        declineForm.post(route('reviews.decline', assignment.id));
    }

    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <div>
                    <p className="font-semibold text-blue-900">Review Invitation</p>
                    <p className="text-sm text-blue-700">
                        You have been invited to review this manuscript.
                        {assignment.due_date && ` Review due: ${assignment.due_date}.`}
                    </p>
                </div>
            </div>
            {!showDecline ? (
                <div className="flex gap-3">
                    <form onSubmit={handleAccept}>
                        <button
                            type="submit"
                            disabled={acceptForm.processing}
                            className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                            Accept Invitation
                        </button>
                    </form>
                    <button
                        onClick={() => setShowDecline(true)}
                        className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Decline
                    </button>
                </div>
            ) : (
                <form onSubmit={handleDecline} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Reason for declining (optional)</label>
                        <textarea
                            value={declineForm.data.reason}
                            onChange={e => declineForm.setData('reason', e.target.value)}
                            rows={3}
                            placeholder="Let the editor know why you're unable to review this submission…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={declineForm.processing}
                            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            Confirm Decline
                        </button>
                        <button type="button" onClick={() => setShowDecline(false)}
                            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function ReviewForm({ assignment }) {
    const form = useForm({
        recommendation: '',
        comments_to_editor: '',
        comments_to_author: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post(route('reviews.submit', assignment.id));
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                You have accepted this review invitation. Please complete the form below and submit your review.
                {assignment.due_date && ` Due: ${assignment.due_date}.`}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recommendation */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Recommendation *</label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                            { value: 'accept', label: 'Accept', desc: 'Accept the manuscript as is or with minor copyediting' },
                            { value: 'minor_revision', label: 'Minor Revision', desc: 'Accept with minor revisions required' },
                            { value: 'major_revision', label: 'Major Revision', desc: 'Revisions required before acceptance' },
                            { value: 'reject', label: 'Reject', desc: 'Reject — does not meet publication standards' },
                        ].map(opt => (
                            <label key={opt.value}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                                    form.data.recommendation === opt.value
                                        ? RECOMMENDATION_COLORS[opt.value]
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="recommendation"
                                    value={opt.value}
                                    checked={form.data.recommendation === opt.value}
                                    onChange={() => form.setData('recommendation', opt.value)}
                                    className="mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="text-sm font-semibold">{opt.label}</p>
                                    <p className="text-xs opacity-75">{opt.desc}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    {form.errors.recommendation && (
                        <p className="mt-1 text-xs text-red-500">{form.errors.recommendation}</p>
                    )}
                </div>

                {/* Comments for author */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Comments for Author
                        <span className="ml-1 font-normal text-gray-400">(will be shared with the author)</span>
                    </label>
                    <textarea
                        value={form.data.comments_to_author}
                        onChange={e => form.setData('comments_to_author', e.target.value)}
                        rows={6}
                        placeholder="Provide constructive feedback the author will use to revise their manuscript…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* Confidential comments for editor */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Confidential Comments for Editor
                        <span className="ml-1 font-normal text-gray-400">(not shared with author)</span>
                    </label>
                    <textarea
                        value={form.data.comments_to_editor}
                        onChange={e => form.setData('comments_to_editor', e.target.value)}
                        rows={4}
                        placeholder="Notes for the editor, including concerns you wish to raise privately…"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.recommendation}
                        className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                        {form.processing ? 'Submitting…' : 'Submit Review'}
                    </button>
                    <Link href={route('reviews.index')}
                        className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Save & Return Later
                    </Link>
                </div>
            </form>
        </div>
    );
}

function CompletedReview({ review }) {
    return (
        <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Review submitted on {review.submitted_at}.
            </div>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Recommendation</h3>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${RECOMMENDATION_COLORS[review.recommendation] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {review.recommendation_label}
                </span>
            </div>

            {review.comments_to_author && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Comments for Author</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed rounded-lg border border-gray-200 bg-white p-4">
                        {review.comments_to_author}
                    </p>
                </div>
            )}

            {review.comments_to_editor && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Confidential Comments (Editor only)</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed rounded-lg border border-gray-200 bg-white p-4">
                        {review.comments_to_editor}
                    </p>
                </div>
            )}
        </div>
    );
}

import React from 'react';

export default function Show({ assignment }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const sub = assignment.submission;

    return (
        <DashboardLayout title="Peer Review">
            <Head title={`Review: ${sub.title}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <Link href={route('reviews.index')} className="text-sm text-blue-900 hover:underline">
                    ← Back to My Reviews
                </Link>

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

                {/* Header */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">{sub.title}</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {sub.journal}{sub.section && ` · ${sub.section}`}
                            </p>
                        </div>
                        <StatusBadge status={assignment.status} label={assignment.status_label} />
                    </div>
                </div>

                {/* Submission abstract */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">Manuscript Details</h2>

                    {sub.abstract && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Abstract</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{sub.abstract}</p>
                        </div>
                    )}

                    {sub.keywords?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {sub.keywords.map(kw => (
                                    <span key={kw} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">{kw}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {sub.authors?.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Authors</h3>
                            <div className="space-y-1">
                                {sub.authors.map((a, i) => (
                                    <p key={i} className="text-sm text-gray-700">
                                        {a.name}{a.affiliation && ` (${a.affiliation})`}
                                        {a.is_corresponding && <span className="ml-1 text-xs text-blue-600">(Corresponding)</span>}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action area */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    {assignment.status === 'invited' && <InvitationPanel assignment={assignment} />}
                    {assignment.status === 'accepted' && <ReviewForm assignment={assignment} />}
                    {assignment.status === 'completed' && <CompletedReview review={assignment.review} />}
                    {assignment.status === 'declined' && (
                        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                            <p className="font-medium">You declined this invitation.</p>
                            {assignment.decline_reason && (
                                <p className="mt-1 text-red-600">{assignment.decline_reason}</p>
                            )}
                        </div>
                    )}
                    {assignment.status === 'cancelled' && (
                        <p className="text-sm text-gray-400 italic">This review assignment has been cancelled by the editor.</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
