import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Guidelines({ journal }) {
    return (
        <AppLayout journal={journal}>
            <Head title={`Author Guidelines — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Author Guidelines</h1>
                {journal.author_guidelines ? (
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {journal.author_guidelines}
                    </div>
                ) : (
                    <p className="text-gray-400 italic">Author guidelines have not been published yet.</p>
                )}
            </div>
        </AppLayout>
    );
}
