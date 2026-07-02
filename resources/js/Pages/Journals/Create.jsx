import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title:               '',
        acronym:             '',
        description:         '',
        issn_print:          '',
        issn_online:         '',
        submissions_enabled: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/journals');
    };

    return (
        <DashboardLayout title="New Journal">
            <Head title="New Journal" />

            <div className="mx-auto max-w-2xl space-y-6">
                <Link href="/journals" className="text-sm text-blue-900 hover:underline">
                    ← Back to Journals
                </Link>

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <h2 className="mb-6 text-lg font-semibold text-gray-900">Create Journal</h2>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="title" value="Journal Title *" />
                            <TextInput
                                id="title"
                                className="mt-1 block w-full"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                isFocused
                                placeholder="e.g. Journal of Applied Sciences"
                            />
                            <InputError className="mt-2" message={errors.title} />
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="acronym" value="Acronym" />
                                <TextInput
                                    id="acronym"
                                    className="mt-1 block w-full"
                                    value={data.acronym}
                                    onChange={(e) => setData('acronym', e.target.value)}
                                    placeholder="e.g. JAS"
                                />
                                <InputError className="mt-2" message={errors.acronym} />
                            </div>

                            <div>
                                <InputLabel htmlFor="issn_online" value="ISSN (Online)" />
                                <TextInput
                                    id="issn_online"
                                    className="mt-1 block w-full"
                                    value={data.issn_online}
                                    onChange={(e) => setData('issn_online', e.target.value)}
                                    placeholder="0000-0000"
                                />
                                <InputError className="mt-2" message={errors.issn_online} />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description" />
                            <RichTextEditor
                                id="description"
                                rows={4}
                                className="mt-1"
                                value={data.description}
                                onChange={(html) => setData('description', html)}
                                placeholder="Brief description of the journal's scope and aims..."
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
                            <input
                                id="submissions_enabled"
                                type="checkbox"
                                checked={data.submissions_enabled}
                                onChange={(e) => setData('submissions_enabled', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-900"
                            />
                            <label htmlFor="submissions_enabled" className="text-sm font-medium text-gray-700">
                                Accept submissions immediately
                            </label>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <PrimaryButton disabled={processing}>Create Journal</PrimaryButton>
                            <Link href="/journals" className="text-sm text-gray-500 hover:text-gray-700">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
