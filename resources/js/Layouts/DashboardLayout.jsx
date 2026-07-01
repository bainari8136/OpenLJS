import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        routeName: 'dashboard',
        roles: [],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: 'Submissions',
        href: '/submissions',
        routeName: 'submissions',
        roles: ['super-admin', 'journal-manager', 'editor', 'section-editor', 'author'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
    {
        label: 'Reviews',
        href: '/reviews',
        routeName: 'reviews',
        roles: ['super-admin', 'journal-manager', 'editor', 'section-editor', 'reviewer'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
    },
    {
        label: 'Issues',
        href: '/issues',
        routeName: 'issues',
        roles: ['super-admin', 'journal-manager', 'editor'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        label: 'Articles',
        href: '/articles',
        routeName: 'articles.index',
        roles: ['super-admin', 'journal-manager', 'editor'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
        ),
    },
    {
        label: 'Users',
        href: '/users',
        routeName: 'users',
        roles: ['super-admin', 'journal-manager'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    },
    {
        label: 'Journals',
        href: '/journals',
        routeName: 'journals',
        roles: ['super-admin'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
        ),
    },
    {
        label: 'Metrics',
        href: '/metrics',
        routeName: 'metrics',
        roles: ['super-admin', 'journal-manager', 'editor', 'section-editor'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        label: 'Notifications',
        href: '/notifications',
        routeName: 'notifications',
        roles: [],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
    },
    {
        label: 'Settings',
        href: '/settings',
        routeName: 'settings.index',
        roles: ['super-admin', 'journal-manager'],
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

function SidebarLink({ item, currentPath }) {
    const isActive = currentPath.startsWith(item.href);
    return (
        <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-700/60 hover:text-white'
            }`}
        >
            {item.icon}
            {item.label}
        </Link>
    );
}

function SearchBar() {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    function handleSubmit(e) {
        e.preventDefault();
        if (!query.trim()) return;
        router.get(route('search'), { q: query.trim() });
    }

    return (
        <form onSubmit={handleSubmit} className="hidden md:flex items-center">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search submissions, articles…"
                    className="w-56 xl:w-72 rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </form>
    );
}

function BellIcon() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    );
}

function NotificationBell({ notifications }) {
    const { unread_count, recent } = notifications ?? { unread_count: 0, recent: [] };
    const [open, setOpen] = useState(false);

    function handleNotificationClick(n) {
        setOpen(false);
        if (!n.read_at) {
            router.post(route('notifications.mark_read', n.id), {}, { preserveScroll: true });
        } else if (n.url) {
            router.visit(n.url);
        }
    }

    return (
        <div className="relative">
            <button onClick={() => setOpen(v => !v)}
                className="relative rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none">
                <BellIcon />
                {unread_count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unread_count > 9 ? '9+' : unread_count}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <span className="text-sm font-semibold text-gray-900">Notifications</span>
                            <div className="flex items-center gap-3">
                                {unread_count > 0 && (
                                    <button onClick={() => { setOpen(false); router.post(route('notifications.mark_all_read'), {}, { preserveScroll: true }); }}
                                        className="text-xs text-blue-600 hover:underline">
                                        Mark all read
                                    </button>
                                )}
                                <Link href={route('notifications.index')} onClick={() => setOpen(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700">
                                    View all
                                </Link>
                            </div>
                        </div>
                        <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                            {recent.length === 0 ? (
                                <li className="px-4 py-8 text-center text-sm text-gray-400">No notifications</li>
                            ) : recent.map(n => (
                                <li key={n.id}>
                                    <button onClick={() => handleNotificationClick(n)}
                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${!n.read_at ? 'bg-blue-50' : ''}`}>
                                        <div className="flex items-start gap-2">
                                            {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                                            <div className={!n.read_at ? '' : 'pl-4'}>
                                                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                                                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{n.body}</p>
                                                <p className="mt-1 text-xs text-gray-400">{n.created_at}</p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

export default function DashboardLayout({ title, children }) {
    const { auth, ziggy, notifications } = usePage().props;
    const user = auth.user;
    const roles = auth.roles ?? [];
    const currentPath = ziggy?.location ?? window.location.pathname;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const visibleNav = NAV_ITEMS.filter(
        (item) => item.roles.length === 0 || item.roles.some((r) => roles.includes(r)),
    );

    const primaryRole = roles[0] ?? 'reader';
    const roleLabel = primaryRole
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-blue-900 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center gap-2 border-b border-blue-800 px-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        <span className="text-xs font-bold text-blue-900">OL</span>
                    </div>
                    <span className="text-lg font-semibold text-white">OpenLJS</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {visibleNav.map((item) => (
                        <SidebarLink key={item.href} item={item} currentPath={currentPath} />
                    ))}
                </nav>

                {/* User info at bottom */}
                <div className="border-t border-blue-800 px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-blue-300">{roleLabel}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 lg:hidden"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {title && (
                            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">{title}</h1>
                        )}
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Public site link */}
                        <a
                            href="/"
                            className="hidden text-sm text-gray-500 hover:text-gray-700 sm:block"
                        >
                            View Site
                        </a>

                        <NotificationBell notifications={notifications} />

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-full text-sm focus:outline-none">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden text-sm font-medium text-gray-700 sm:block">
                                        {user.name}
                                    </span>
                                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
