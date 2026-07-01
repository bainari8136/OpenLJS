import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout title="Profile">
            <Head title="Profile" />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                    />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                    <UpdatePasswordForm />
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
                    <DeleteUserForm />
                </div>
            </div>
        </DashboardLayout>
    );
}
