import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, usePage } from '@inertiajs/react';

function StatCard({ label, value, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <div className={`rounded-xl border p-5 ${colors[color] ?? colors.slate}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
    );
}

const ROLE_STATS = {
    'super-admin': [
        { label: 'Total Journals', value: 0, color: 'blue' },
        { label: 'Total Users', value: 0, color: 'slate' },
        { label: 'Active Submissions', value: 0, color: 'amber' },
        { label: 'Published Articles', value: 0, color: 'green' },
    ],
    'journal-manager': [
        { label: 'Open Submissions', value: 0, color: 'amber' },
        { label: 'Under Review', value: 0, color: 'blue' },
        { label: 'Published This Year', value: 0, color: 'green' },
        { label: 'Registered Users', value: 0, color: 'slate' },
    ],
    editor: [
        { label: 'Pending Initial Check', value: 0, color: 'amber' },
        { label: 'Under Review', value: 0, color: 'blue' },
        { label: 'Reviews Overdue', value: 0, color: 'red' },
        { label: 'Awaiting Decision', value: 0, color: 'purple' },
        { label: 'Accepted', value: 0, color: 'green' },
        { label: 'In Production', value: 0, color: 'slate' },
    ],
    'section-editor': [
        { label: 'My Queue', value: 0, color: 'amber' },
        { label: 'Under Review', value: 0, color: 'blue' },
        { label: 'Awaiting Decision', value: 0, color: 'purple' },
        { label: 'Accepted', value: 0, color: 'green' },
    ],
    author: [
        { label: 'My Submissions', value: 0, color: 'blue' },
        { label: 'Under Review', value: 0, color: 'amber' },
        { label: 'Accepted', value: 0, color: 'green' },
        { label: 'Published', value: 0, color: 'slate' },
    ],
    reviewer: [
        { label: 'Pending Invitations', value: 0, color: 'amber' },
        { label: 'Active Reviews', value: 0, color: 'blue' },
        { label: 'Completed Reviews', value: 0, color: 'green' },
        { label: 'Overdue', value: 0, color: 'red' },
    ],
};

export default function Dashboard({ stats }) {
    const { auth } = usePage().props;
    const roles = auth.roles ?? [];
    const primaryRole = roles[0] ?? 'author';

    const cards = ROLE_STATS[primaryRole] ?? ROLE_STATS.author;
    const mergedCards = cards.map((card) => ({
        ...card,
        value: stats?.[card.label] ?? card.value,
    }));

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <DashboardLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {greeting()}, {auth.user.name.split(' ')[0]}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Here's what's happening in your journal today.
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mergedCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {(primaryRole === 'author' || roles.includes('author')) && (
                            <a
                                href="/submissions/create"
                                className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                            >
                                New Submission
                            </a>
                        )}
                        {(roles.includes('editor') || roles.includes('section-editor') || roles.includes('super-admin')) && (
                            <a
                                href="/submissions"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                View Submissions
                            </a>
                        )}
                        {roles.includes('reviewer') && (
                            <a
                                href="/reviews"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                My Reviews
                            </a>
                        )}
                        {(roles.includes('journal-manager') || roles.includes('super-admin')) && (
                            <a
                                href="/issues"
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Manage Issues
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
