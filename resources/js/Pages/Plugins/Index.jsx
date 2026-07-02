import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';

const CATEGORY_LABELS = {
    generic: 'Generic',
    blocks: 'Blocks',
    gateways: 'Gateways',
};

function Toggle({ enabled, onChange }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                enabled ? 'bg-blue-900' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
}

function PluginRow({ plugin }) {
    const toggle = () => {
        router.post(`/plugins/${plugin.id}/${plugin.enabled ? 'disable' : 'enable'}`, {}, { preserveScroll: true });
    };

    return (
        <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-900">{plugin.name}</p>
                <p className="text-xs text-gray-500">v{plugin.version}</p>
            </div>
            <Toggle enabled={plugin.enabled} onChange={toggle} />
        </div>
    );
}

function CategorySection({ category, plugins }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[category] ?? category}</h2>
            </div>
            <div>
                {plugins.map((plugin) => (
                    <PluginRow key={plugin.id} plugin={plugin} />
                ))}
            </div>
        </div>
    );
}

export default function Index({ plugins }) {
    const { props } = usePage();
    const flash = props.flash ?? {};
    const categories = Object.keys(plugins);

    return (
        <DashboardLayout title="Plugins">
            <Head title="Plugins" />

            <div className="space-y-4">
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {categories.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
                        <p className="text-gray-500">No plugins registered yet.</p>
                        <p className="mt-1 text-xs text-gray-400">
                            Add a plugin class to <code>config/plugins.php</code> and run{' '}
                            <code>php artisan plugin:discover</code>.
                        </p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <CategorySection key={category} category={category} plugins={plugins[category]} />
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
