import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function EditorialTeam({ journal, members }) {
    return (
        <AppLayout journal={journal}>
            <Head title={`Editorial Team — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Editorial Team</h1>

                {members.length === 0 ? (
                    <p className="text-sm text-gray-500">The editorial team has not been published yet.</p>
                ) : (
                    <div className="space-y-6">
                        {members.map((member) => (
                            <div key={member.id} className="rounded-xl border border-gray-200 bg-white p-5">
                                <h2 className="text-lg font-semibold text-gray-900">{member.name}</h2>
                                <p className="text-sm font-medium text-blue-900">{member.title}</p>
                                {member.affiliation && (
                                    <p className="mt-1 text-sm text-gray-500">{member.affiliation}</p>
                                )}
                                {member.orcid && (
                                    <p className="mt-1 text-xs text-gray-400">ORCID: {member.orcid}</p>
                                )}
                                {member.bio && (
                                    <div className="prose prose-sm mt-3 max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{ __html: member.bio }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
