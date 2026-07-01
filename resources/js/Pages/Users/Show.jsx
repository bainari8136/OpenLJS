import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

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
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${colors[role] ?? 'bg-gray-100 text-gray-600'}`}>
            {label}
        </span>
    );
}

function AssignRoleForm({ userId, availableRoles, currentRole }) {
    const { data, setData, post, processing, errors } = useForm({ role: currentRole ?? '' });

    const submit = (e) => {
        e.preventDefault();
        post(`/users/${userId}/roles`);
    };

    return (
        <form onSubmit={submit} className="flex items-end gap-3">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Global Role
                </label>
                <select
                    value={data.role}
                    onChange={(e) => setData('role', e.target.value)}
                    className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Select a role…</option>
                    {availableRoles.map((r) => (
                        <option key={r} value={r}>
                            {r.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </option>
                    ))}
                </select>
                {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
            </div>
            <button
                type="submit"
                disabled={processing || !data.role}
                className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
                Assign
            </button>
        </form>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {value ?? <span className="text-gray-400">—</span>}
            </dd>
        </div>
    );
}

export default function Show({ user, availableRoles, canAssignRoles }) {
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title={user.name}>
            <Head title={user.name} />

            <div className="space-y-6 max-w-3xl">
                {/* Back */}
                <Link href="/users" className="text-sm text-blue-900 hover:underline">
                    ← Back to Users
                </Link>

                {flash.success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Profile card */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="flex items-center gap-4 border-b border-gray-200 px-6 py-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 text-xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <dl className="divide-y divide-gray-100 px-6">
                        <InfoRow label="Affiliation" value={user.affiliation} />
                        <InfoRow label="Country" value={user.country} />
                        <InfoRow label="ORCID" value={user.orcid} />
                        <InfoRow label="Joined" value={user.created_at} />
                        {user.bio && (
                            <div className="py-3">
                                <dt className="text-sm font-medium text-gray-500 mb-1">Bio</dt>
                                <dd className="text-sm text-gray-900 whitespace-pre-wrap">{user.bio}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Roles card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">System Role</h3>

                    <div className="flex flex-wrap gap-2">
                        {user.roles.length > 0
                            ? user.roles.map((r) => <RoleBadge key={r} role={r} />)
                            : <span className="text-sm text-gray-400">No role assigned</span>
                        }
                    </div>

                    {canAssignRoles && (
                        <AssignRoleForm
                            userId={user.id}
                            availableRoles={availableRoles}
                            currentRole={user.roles[0] ?? ''}
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
