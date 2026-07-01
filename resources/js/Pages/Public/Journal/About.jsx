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
                <div className="text-sm text-gray-500 space-y-1">
                    {journal.publisher && <p>Publisher: {journal.publisher}</p>}
                    {journal.country && <p>Country: {journal.country}</p>}
                    {journal.website_url && (
                        <p>
                            Website:{' '}
                            <a href={journal.website_url} target="_blank" rel="noopener noreferrer"
                                className="text-blue-900 hover:underline">
                                {journal.website_url}
                            </a>
                        </p>
                    )}
                    {journal.issn_print && <p>ISSN (Print): {journal.issn_print}</p>}
                    {journal.issn_online && <p>ISSN (Online): {journal.issn_online}</p>}
                </div>
            </div>
        </AppLayout>
    );
}
