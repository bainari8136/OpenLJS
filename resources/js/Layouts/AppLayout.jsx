import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ journal, children }) {
    const { auth } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const journalName = journal?.title ?? 'OpenLJS';
    const j = (path) => journal?.slug ? `/j/${journal.slug}${path}` : '/';

    return (
        <div className="min-h-screen bg-white">
            {journal?.slug && (
                <Head>
                    <link rel="alternate" type="application/rss+xml" title={`${journalName} - RSS Feed`} href={`/j/${journal.slug}/feed/rss`} />
                    <link rel="alternate" type="application/atom+xml" title={`${journalName} - Atom Feed`} href={`/j/${journal.slug}/feed/atom`} />
                </Head>
            )}

            {/* Top nav */}
            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo + journal name */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900">
                                    <span className="text-xs font-bold text-white">OL</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900">{journalName}</span>
                            </Link>
                        </div>

                        {/* Desktop nav */}
                        <div className="hidden items-center gap-6 sm:flex">
                            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Home
                            </Link>
                            <Link href={j('/current-issue')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Current Issue
                            </Link>
                            <Link href={j('/archive')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Archives
                            </Link>
                            <Link href={j('/about')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                About
                            </Link>
                            <Link href={j('/editorial-team')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Editorial Team
                            </Link>
                            <Link href={j('/categories')} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Categories
                            </Link>
                        </div>

                        {/* Search */}
                        <form onSubmit={e => { e.preventDefault(); const q = e.target.q.value.trim(); if (q) router.get(route('search'), { q }); }}
                            className="hidden items-center sm:flex">
                            <div className="relative">
                                <input name="q" type="search" placeholder="Search articles…"
                                    className="w-48 xl:w-60 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none" />
                                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                        {/* Auth / Submit */}
                        <div className="hidden items-center gap-3 sm:flex">
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                                    >
                                        Submit Article
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 sm:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-200 sm:hidden">
                        <div className="space-y-1 px-4 pb-4 pt-2">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Current Issue', href: j('/current-issue') },
                                { label: 'Archives', href: j('/archive') },
                                { label: 'About', href: j('/about') },
                                { label: 'Editorial Team', href: j('/editorial-team') },
                                { label: 'Categories', href: j('/categories') },
                            ].map(({ label, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {label}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-3">
                                {auth.user ? (
                                    <Link href="/dashboard" className="block rounded-md bg-blue-900 px-3 py-2 text-sm font-medium text-white">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className="block px-3 py-2 text-sm font-medium text-gray-700">
                                            Log In
                                        </Link>
                                        <Link href="/register" className="mt-1 block rounded-md bg-blue-900 px-3 py-2 text-sm font-medium text-white">
                                            Submit Article
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Page content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-gray-50 mt-16">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-900">
                                <span className="text-xs font-bold text-white">OL</span>
                            </div>
                            <span className="text-sm text-gray-500">{journalName}</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Powered by <span className="font-medium text-blue-900">OpenLJS</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
