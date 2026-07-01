import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home({ journal }) {
    const { auth } = usePage().props;

    return (
        <AppLayout journal={journal}>
            <Head title={journal.title} />

            {/* Hero */}
            <div className="bg-blue-900 text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-5">
                        {journal.logo_url ? (
                            <img src={journal.logo_url} alt={journal.title}
                                className="h-20 w-20 rounded-xl object-contain bg-white p-1" />
                        ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-white/10 text-3xl font-bold">
                                {journal.acronym?.[0] ?? journal.title[0]}
                            </div>
                        )}
                        <div>
                            {journal.acronym && (
                                <p className="text-sm font-medium text-blue-200 uppercase tracking-widest mb-1">
                                    {journal.acronym}
                                </p>
                            )}
                            <h1 className="text-3xl font-bold">{journal.title}</h1>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-blue-200">
                                {journal.issn_online && <span>ISSN (Online): {journal.issn_online}</span>}
                                {journal.issn_print && <span>ISSN (Print): {journal.issn_print}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* About / Aims */}
                        {journal.description && (
                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Aims & Scope</h2>
                                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                                    {journal.description}
                                </div>
                            </section>
                        )}

                        {/* Sections */}
                        {journal.sections.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Journal Sections</h2>
                                <div className="space-y-3">
                                    {journal.sections.map((section) => (
                                        <div key={section.id}
                                            className="rounded-xl border border-gray-200 bg-white p-5">
                                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                                            {section.description && (
                                                <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* Submit CTA */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                            <h3 className="font-semibold text-gray-900 mb-2">Submit a Manuscript</h3>
                            {journal.submissions_enabled ? (
                                <>
                                    <p className="text-sm text-gray-500 mb-4">
                                        This journal is currently accepting submissions.
                                    </p>
                                    {auth.user ? (
                                        <Link href="/submissions/create"
                                            className="block rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
                                            Start Submission
                                        </Link>
                                    ) : (
                                        <Link href="/register"
                                            className="block rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
                                            Register to Submit
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-amber-600 font-medium">
                                    Submissions are currently closed.
                                </p>
                            )}
                        </div>

                        {/* Quick links */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Quick Links</h3>
                            <nav className="space-y-1">
                                {[
                                    { label: 'Current Issue', href: `/j/${journal.slug}/current-issue` },
                                    { label: 'Archives', href: `/j/${journal.slug}/archive` },
                                    { label: 'Author Guidelines', href: `/j/${journal.slug}/author-guidelines` },
                                    { label: 'About the Journal', href: `/j/${journal.slug}/about` },
                                    { label: 'Editorial Team', href: `/j/${journal.slug}/editorial-team` },
                                    { label: 'RSS Feed', href: `/j/${journal.slug}/feed/rss` },
                                ].map((link) => (
                                    <a key={link.href} href={link.href}
                                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                                        {link.label}
                                        <span className="text-gray-400">→</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
}
