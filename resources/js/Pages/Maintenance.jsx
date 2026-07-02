import { Head } from '@inertiajs/react';

export default function Maintenance({ message }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Head title="Site Under Maintenance" />
            <div className="max-w-md text-center">
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-900">
                    <span className="text-lg font-bold text-white">OL</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Site Under Maintenance</h1>
                <p className="mt-3 text-sm text-gray-500">
                    {message || "We're currently performing scheduled maintenance. Please check back shortly."}
                </p>
            </div>
        </div>
    );
}
