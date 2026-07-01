import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

function Section({ title, children }) {
    if (!children) return null;
    return (
        <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
            <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">{children}</div>
        </section>
    );
}

export default function About({ journal }) {
    return (
        <AppLayout journal={journal}>
            <Head title={`About — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <h1 className="text-3xl font-bold text-gray-900">About {journal.title}</h1>
                <Section title="Aims & Scope">{journal.description}</Section>
                {journal.issn_print && (
                    <p className="text-sm text-gray-500">ISSN (Print): {journal.issn_print}</p>
                )}
                {journal.issn_online && (
                    <p className="text-sm text-gray-500">ISSN (Online): {journal.issn_online}</p>
                )}
            </div>
        </AppLayout>
    );
}
