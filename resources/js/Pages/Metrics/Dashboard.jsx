import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_COLORS = {
    submitted:         'bg-blue-100 text-blue-700',
    initial_check:     'bg-yellow-100 text-yellow-700',
    editor_assigned:   'bg-indigo-100 text-indigo-700',
    under_review:      'bg-purple-100 text-purple-700',
    revision_required: 'bg-orange-100 text-orange-700',
    revised:           'bg-amber-100 text-amber-700',
    accepted:          'bg-green-100 text-green-700',
    rejected:          'bg-red-100 text-red-700',
    copyediting:       'bg-teal-100 text-teal-700',
    production:        'bg-cyan-100 text-cyan-700',
    scheduled:         'bg-lime-100 text-lime-700',
    published:         'bg-emerald-100 text-emerald-700',
};

function KpiCard({ label, value, sub, color = 'blue' }) {
    const ring = { blue: 'border-blue-200 bg-blue-50', emerald: 'border-emerald-200 bg-emerald-50', purple: 'border-purple-200 bg-purple-50', amber: 'border-amber-200 bg-amber-50', teal: 'border-teal-200 bg-teal-50' };
    const text = { blue: 'text-blue-700', emerald: 'text-emerald-700', purple: 'text-purple-700', amber: 'text-amber-700', teal: 'text-teal-700' };
    return (
        <div className={`rounded-xl border p-5 ${ring[color]}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${text[color]}`}>{value.toLocaleString()}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function MiniBar({ value, max }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
        </div>
    );
}

function ViewsSparkline({ data }) {
    if (!data.length) return <p className="text-xs text-gray-400 py-4 text-center">No view data yet.</p>;
    const max = Math.max(...data.map(d => d.views), 1);
    return (
        <div className="flex items-end gap-0.5 h-16 mt-3">
            {data.map((d, i) => (
                <div key={i} title={`${d.date}: ${d.views} views`}
                    className="flex-1 bg-blue-200 hover:bg-blue-400 rounded-t transition-colors cursor-default"
                    style={{ height: `${Math.max(4, Math.round((d.views / max) * 64))}px` }} />
            ))}
        </div>
    );
}

export default function Dashboard({ kpis, byStatus, topByDownloads, topByViews, viewsByDay, activity }) {
    const maxStatus = Math.max(...byStatus.map(s => s.count), 1);
    const maxDownloads = Math.max(...topByDownloads.map(a => a.downloads), 1);
    const maxViews = Math.max(...topByViews.map(a => a.views), 1);

    return (
        <DashboardLayout title="Metrics">
            <Head title="Metrics" />

            <div className="space-y-8">
                <h1 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h1>

                {/* KPI row */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <KpiCard label="Active Journals" value={kpis.journals} color="blue" />
                    <KpiCard label="Submissions" value={kpis.submissions} color="purple" />
                    <KpiCard label="Published Articles" value={kpis.published} color="emerald" />
                    <KpiCard label="Total Downloads" value={kpis.downloads} color="amber" />
                    <KpiCard label="Total Views" value={kpis.total_views} color="teal" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Submissions by status */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Submissions by Status</h2>
                        {byStatus.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No submissions yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {byStatus.map(s => (
                                    <li key={s.status} className="flex items-center gap-3">
                                        <span className={`inline-flex w-32 shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {s.label}
                                        </span>
                                        <MiniBar value={s.count} max={maxStatus} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Views sparkline */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900">Article Views — Last 30 Days</h2>
                        <ViewsSparkline data={viewsByDay} />
                        <p className="mt-2 text-xs text-gray-400 text-right">
                            {viewsByDay.reduce((s, d) => s + d.views, 0)} total unique views
                        </p>
                    </div>

                    {/* Top by downloads */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Articles by Downloads</h2>
                        {topByDownloads.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No downloads yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {topByDownloads.map((a, i) => (
                                    <li key={a.id} className="flex items-start gap-3">
                                        <span className="shrink-0 mt-0.5 text-xs text-gray-400 w-4">{i + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                            {a.journal_slug && a.slug ? (
                                                <Link href={route('journal.article', [a.journal_slug, a.slug])}
                                                    className="text-sm font-medium text-blue-900 hover:underline line-clamp-1">
                                                    {a.title}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-medium text-gray-700 line-clamp-1">{a.title}</p>
                                            )}
                                            <p className="text-xs text-gray-400">{a.journal}</p>
                                            <MiniBar value={a.downloads} max={maxDownloads} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Top by views */}
                    <div className="rounded-xl border border-gray-200 bg-white p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Articles by Views</h2>
                        {topByViews.length === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No view data yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {topByViews.map((a, i) => (
                                    <li key={a.id} className="flex items-start gap-3">
                                        <span className="shrink-0 mt-0.5 text-xs text-gray-400 w-4">{i + 1}.</span>
                                        <div className="flex-1 min-w-0">
                                            {a.journal_slug && a.slug ? (
                                                <Link href={route('journal.article', [a.journal_slug, a.slug])}
                                                    className="text-sm font-medium text-blue-900 hover:underline line-clamp-1">
                                                    {a.title}
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-medium text-gray-700 line-clamp-1">{a.title}</p>
                                            )}
                                            <p className="text-xs text-gray-400">{a.journal}</p>
                                            <MiniBar value={a.views} max={maxViews} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 px-5 py-4">
                        <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    {activity.length === 0 ? (
                        <p className="px-5 py-8 text-sm text-gray-400 text-center">No activity yet.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {activity.map(a => (
                                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-300" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700">{a.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400">{a.user}</span>
                                            <span className="text-xs text-gray-300">·</span>
                                            <span className="text-xs font-mono text-gray-400">{a.action}</span>
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-xs text-gray-400">{a.created_at}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
