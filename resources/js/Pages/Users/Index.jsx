import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

function RoleBadge({ role }) {
    const colors = {
        'super-admin':      'bg-purple-100 text-purple-800',
        'journal-manager':  'bg-blue-100 text-blue-800',
        editor:             'bg-indigo-100 text-indigo-800',
        'section-editor':   'bg-sky-100 text-sky-800',
        author:             'bg-green-100 text-green-800',
        reviewer:           'bg-amber-100 text-amber-800',
        copyeditor:         'bg-orange-100 text-orange-800',
        'production-editor':'bg-rose-100 text-rose-800',
        reader:             'bg-gray-100 text-gray-600',
    };
    const label = role.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

export default function Index({ users }) {
    return (
        <DashboardLayout title="Users">
            <Head title="Users" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        {users.total} registered user{users.total !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Affiliation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Roles
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                                    Joined
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">View</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-semibold text-white">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {user.affiliation ?? <span className="text-gray-300">—</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length > 0
                                                ? user.roles.map((r) => <RoleBadge key={r} role={r} />)
                                                : <span className="text-xs text-gray-400">No role</span>
                                            }
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                        {user.created_at}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="font-medium text-blue-900 hover:text-blue-700"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                            <p className="text-sm text-gray-500">
                                Showing {users.from}–{users.to} of {users.total}
                            </p>
                            <div className="flex gap-2">
                                {users.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded px-3 py-1 text-sm ${
                                            link.active
                                                ? 'bg-blue-900 text-white'
                                                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
