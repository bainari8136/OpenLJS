import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

function byParent(categories, parentId) {
    return categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);
}

function CategoryNode({ category, categories }) {
    const subcategories = byParent(categories, category.id);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex gap-4">
                {category.cover_image_url && (
                    <img src={category.cover_image_url} alt={category.name}
                        className="h-20 w-20 shrink-0 rounded-lg object-cover border border-gray-100" />
                )}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                    {category.description && (
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 whitespace-pre-line">{category.description}</p>
                    )}
                </div>
            </div>
            {subcategories.length > 0 && (
                <div className="mt-4 ml-6 space-y-4 border-l border-gray-100 pl-4">
                    {subcategories.map((sub) => (
                        <CategoryNode key={sub.id} category={sub} categories={categories} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Categories({ journal, categories }) {
    const roots = byParent(categories, null);

    return (
        <AppLayout journal={journal}>
            <Head title={`Categories — ${journal.title}`} />

            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>

                {roots.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories have been published yet.</p>
                ) : (
                    <div className="space-y-6">
                        {roots.map((category) => (
                            <CategoryNode key={category.id} category={category} categories={categories} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
