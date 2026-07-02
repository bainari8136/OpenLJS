import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const TABS = [
    { id: 'general',     label: 'General' },
    { id: 'submissions', label: 'Submissions' },
    { id: 'website',     label: 'Website' },
    { id: 'email',       label: 'Email' },
    { id: 'system',      label: 'System' },
];

function Section({ title, description, children }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    );
}

function Field({ label, hint, error, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            {children}
            {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function ReadOnlyField({ label, value }) {
    return (
        <div className="flex items-start gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="w-40 shrink-0 text-xs font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-700 font-mono break-all">{value ?? '—'}</span>
        </div>
    );
}

function GeneralTab({ settings, flash }) {
    const form = useForm({
        tab:              'general',
        site_name:        settings.site_name ?? '',
        site_tagline:     settings.site_tagline ?? '',
        site_description: settings.site_description ?? '',
        institution_name: settings.institution_name ?? '',
        contact_email:    settings.contact_email ?? '',
        support_email:    settings.support_email ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post(route('settings.update'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Site Identity" description="Displayed on the public-facing site and in email footers.">
                <Field label="Site Name *" error={form.errors.site_name}>
                    <input
                        type="text"
                        value={form.data.site_name}
                        onChange={e => form.setData('site_name', e.target.value)}
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                </Field>
                <Field label="Tagline" hint="A short description shown beneath the site name." error={form.errors.site_tagline}>
                    <input
                        type="text"
                        value={form.data.site_tagline}
                        onChange={e => form.setData('site_tagline', e.target.value)}
                        placeholder="Open Journal System"
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
                <Field label="Site Description" hint="Shown on the welcome page and in OAI-PMH Identify response." error={form.errors.site_description}>
                    <textarea
                        value={form.data.site_description}
                        onChange={e => form.setData('site_description', e.target.value)}
                        rows={3}
                        className="w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
                <Field label="Institution Name" error={form.errors.institution_name}>
                    <input
                        type="text"
                        value={form.data.institution_name}
                        onChange={e => form.setData('institution_name', e.target.value)}
                        placeholder="e.g. University of Somewhere"
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
            </Section>

            <Section title="Contact Information" description="Used in email signatures and the public contact page.">
                <Field label="Primary Contact Email" error={form.errors.contact_email}>
                    <input
                        type="email"
                        value={form.data.contact_email}
                        onChange={e => form.setData('contact_email', e.target.value)}
                        placeholder="editor@journal.org"
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
                <Field label="Support / Help Email" hint="Shown to authors who need technical assistance." error={form.errors.support_email}>
                    <input
                        type="email"
                        value={form.data.support_email}
                        onChange={e => form.setData('support_email', e.target.value)}
                        placeholder="support@journal.org"
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
            </Section>

            <div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {form.processing ? 'Saving…' : 'Save General Settings'}
                </button>
            </div>
        </form>
    );
}

function SubmissionsTab({ settings }) {
    const form = useForm({
        tab:                 'submissions',
        max_file_size_mb:    settings.max_file_size_mb ?? '50',
        default_review_days: settings.default_review_days ?? '21',
        submissions_open:    settings.submissions_open === '1' || settings.submissions_open === true,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post(route('settings.update'));
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="File Upload" description="Applies to all manuscript and revision uploads site-wide.">
                <Field label="Maximum File Size (MB)" hint="Manuscripts larger than this limit will be rejected. Range: 1–500 MB." error={form.errors.max_file_size_mb}>
                    <input
                        type="number"
                        min={1}
                        max={500}
                        value={form.data.max_file_size_mb}
                        onChange={e => form.setData('max_file_size_mb', e.target.value)}
                        className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                </Field>
            </Section>

            <Section title="Review Defaults" description="Default values applied when inviting new reviewers. Can be overridden per assignment.">
                <Field label="Default Review Period (days)" hint="Number of days reviewers are given to submit their review." error={form.errors.default_review_days}>
                    <input
                        type="number"
                        min={1}
                        max={365}
                        value={form.data.default_review_days}
                        onChange={e => form.setData('default_review_days', e.target.value)}
                        className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        required
                    />
                </Field>
            </Section>

            <Section title="Submission Gate" description="Temporarily close submissions across all journals without deleting anything.">
                <Field label="Accept new submissions" hint="When disabled, authors see a notice that submissions are closed.">
                    <label className="flex cursor-pointer items-center gap-3">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={form.data.submissions_open}
                                onChange={e => form.setData('submissions_open', e.target.checked)}
                            />
                            <div className={`h-5 w-9 rounded-full transition-colors ${form.data.submissions_open ? 'bg-blue-600' : 'bg-gray-300'}`} />
                            <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.data.submissions_open ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm text-gray-700">
                            {form.data.submissions_open ? 'Open — accepting manuscripts' : 'Closed — submissions paused'}
                        </span>
                    </label>
                </Field>
            </Section>

            <div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {form.processing ? 'Saving…' : 'Save Submission Settings'}
                </button>
            </div>
        </form>
    );
}

function WebsiteTab({ settings, timezones, dateFormats }) {
    const form = useForm({
        tab:                  'website',
        site_logo:            null,
        site_favicon:         null,
        footer_text:          settings.footer_text ?? '',
        social_twitter:       settings.social_twitter ?? '',
        social_facebook:      settings.social_facebook ?? '',
        social_linkedin:      settings.social_linkedin ?? '',
        social_instagram:     settings.social_instagram ?? '',
        maintenance_mode:     settings.maintenance_mode === '1' || settings.maintenance_mode === true,
        maintenance_message:  settings.maintenance_message ?? '',
        site_url:             settings.site_url ?? '',
        default_timezone:     settings.default_timezone ?? 'UTC',
        default_date_format:  settings.default_date_format ?? 'Y-m-d',
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post(route('settings.update'), { forceFormData: true });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Branding" description="Site-wide logo and favicon, shown across all pages and journals.">
                <Field label="Site Logo" hint="Recommended: square PNG or SVG, max 2 MB." error={form.errors.site_logo}>
                    <div className="flex items-center gap-4">
                        {settings.site_logo_url && (
                            <img src={settings.site_logo_url} alt="Site logo" className="h-12 w-12 rounded-lg object-contain border border-gray-200" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => form.setData('site_logo', e.target.files[0])}
                            className="text-sm text-gray-500"
                        />
                    </div>
                </Field>
                <Field label="Favicon" hint="Recommended: 32×32 PNG or ICO, max 512 KB." error={form.errors.site_favicon}>
                    <div className="flex items-center gap-4">
                        {settings.site_favicon_url && (
                            <img src={settings.site_favicon_url} alt="Favicon" className="h-8 w-8 rounded border border-gray-200" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => form.setData('site_favicon', e.target.files[0])}
                            className="text-sm text-gray-500"
                        />
                    </div>
                </Field>
            </Section>

            <Section title="Footer & Social Links" description="Shown in the site footer on public-facing pages.">
                <Field label="Footer Text" hint="e.g. copyright notice." error={form.errors.footer_text}>
                    <textarea
                        value={form.data.footer_text}
                        onChange={e => form.setData('footer_text', e.target.value)}
                        rows={2}
                        className="w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                </Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Twitter / X URL" error={form.errors.social_twitter}>
                        <input type="url" value={form.data.social_twitter}
                            onChange={e => form.setData('social_twitter', e.target.value)}
                            placeholder="https://x.com/…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </Field>
                    <Field label="Facebook URL" error={form.errors.social_facebook}>
                        <input type="url" value={form.data.social_facebook}
                            onChange={e => form.setData('social_facebook', e.target.value)}
                            placeholder="https://facebook.com/…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </Field>
                    <Field label="LinkedIn URL" error={form.errors.social_linkedin}>
                        <input type="url" value={form.data.social_linkedin}
                            onChange={e => form.setData('social_linkedin', e.target.value)}
                            placeholder="https://linkedin.com/…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </Field>
                    <Field label="Instagram URL" error={form.errors.social_instagram}>
                        <input type="url" value={form.data.social_instagram}
                            onChange={e => form.setData('social_instagram', e.target.value)}
                            placeholder="https://instagram.com/…"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </Field>
                </div>
            </Section>

            <Section title="Site URL & Locale" description="Base URL override and defaults used across the site.">
                <Field label="Site URL" hint="Leave blank to use the server's APP_URL." error={form.errors.site_url}>
                    <input type="url" value={form.data.site_url}
                        onChange={e => form.setData('site_url', e.target.value)}
                        placeholder="https://journals.example.org"
                        className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                </Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="Default Timezone" error={form.errors.default_timezone}>
                        <select value={form.data.default_timezone}
                            onChange={e => form.setData('default_timezone', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </Field>
                    <Field label="Default Date Format" error={form.errors.default_date_format}>
                        <select value={form.data.default_date_format}
                            onChange={e => form.setData('default_date_format', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
                            {Object.entries(dateFormats).map(([fmt, example]) => (
                                <option key={fmt} value={fmt}>{example}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            </Section>

            <Section title="Maintenance Mode" description="Temporarily take the public site offline for visitors. Logged-in users keep access.">
                <Field label="Enable maintenance mode">
                    <label className="flex cursor-pointer items-center gap-3">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={form.data.maintenance_mode}
                                onChange={e => form.setData('maintenance_mode', e.target.checked)}
                            />
                            <div className={`h-5 w-9 rounded-full transition-colors ${form.data.maintenance_mode ? 'bg-red-600' : 'bg-gray-300'}`} />
                            <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.data.maintenance_mode ? 'translate-x-4' : ''}`} />
                        </div>
                        <span className="text-sm text-gray-700">
                            {form.data.maintenance_mode ? 'On — public site shows a maintenance notice' : 'Off — site is publicly accessible'}
                        </span>
                    </label>
                </Field>
                {form.data.maintenance_mode && (
                    <Field label="Maintenance Message" hint="Shown to visitors while the site is offline." error={form.errors.maintenance_message}>
                        <textarea
                            value={form.data.maintenance_message}
                            onChange={e => form.setData('maintenance_message', e.target.value)}
                            rows={2}
                            placeholder="We're currently performing scheduled maintenance. Please check back shortly."
                            className="w-full max-w-xl rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                    </Field>
                )}
            </Section>

            <div>
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {form.processing ? 'Saving…' : 'Save Website Settings'}
                </button>
            </div>
        </form>
    );
}

function EmailTab({ mail }) {
    return (
        <div className="space-y-6">
            <Section title="Mail Configuration" description="These values are read from your server environment (.env). Edit the .env file and restart the application to change them.">
                <ReadOnlyField label="Mailer driver" value={mail.mailer} />
                <ReadOnlyField label="SMTP host" value={mail.host} />
                <ReadOnlyField label="SMTP port" value={String(mail.port)} />
                <ReadOnlyField label="Encryption" value={mail.encryption} />
                <ReadOnlyField label="From address" value={mail.from_address} />
                <ReadOnlyField label="From name" value={mail.from_name} />
            </Section>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <strong>Note:</strong> To change mail settings, update your <code className="font-mono text-xs">.env</code> file
                and run <code className="font-mono text-xs">php artisan config:clear</code>.
            </div>
        </div>
    );
}

function SystemTab({ system }) {
    const statusColor = (val) => {
        if (val === 'production') return 'text-emerald-600 font-semibold';
        if (val === 'local') return 'text-amber-600 font-semibold';
        if (val === 'true') return 'text-red-600 font-semibold';
        return '';
    };

    return (
        <div className="space-y-6">
            <Section title="Runtime" description="Read-only environment information.">
                <ReadOnlyField label="PHP version" value={system.php_version} />
                <ReadOnlyField label="Laravel version" value={system.laravel_version} />
                <ReadOnlyField label="App environment" value={system.app_env} />
                <ReadOnlyField label="Debug mode" value={system.app_debug} />
                <ReadOnlyField label="App URL" value={system.app_url} />
            </Section>

            <Section title="Services" description="Driver configuration for database, queue, and search.">
                <ReadOnlyField label="Database driver" value={system.db_driver} />
                <ReadOnlyField label="Queue connection" value={system.queue_connection} />
                <ReadOnlyField label="Scout driver" value={system.scout_driver} />
                <ReadOnlyField label="Storage disk" value={system.storage_default} />
            </Section>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                For production, set <code className="font-mono text-xs">SCOUT_DRIVER=meilisearch</code> and <code className="font-mono text-xs">QUEUE_CONNECTION=database</code> in your <code className="font-mono text-xs">.env</code> file.
            </div>
        </div>
    );
}

export default function Index({ settings, mail, system, timezones, dateFormats }) {
    const [activeTab, setActiveTab] = useState('general');
    const { props } = usePage();
    const flash = props.flash ?? {};

    return (
        <DashboardLayout title="Settings">
            <Head title="Settings" />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {/* Tab bar */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-6">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-blue-900 text-blue-900'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {activeTab === 'general'     && <GeneralTab settings={settings} />}
                {activeTab === 'submissions' && <SubmissionsTab settings={settings} />}
                {activeTab === 'website'     && <WebsiteTab settings={settings} timezones={timezones} dateFormats={dateFormats} />}
                {activeTab === 'email'       && <EmailTab mail={mail} />}
                {activeTab === 'system'      && <SystemTab system={system} />}
            </div>
        </DashboardLayout>
    );
}
