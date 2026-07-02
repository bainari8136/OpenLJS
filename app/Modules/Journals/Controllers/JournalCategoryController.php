<?php

namespace App\Modules\Journals\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Models\JournalCategory;
use App\Modules\Journals\Requests\StoreCategoryRequest;
use App\Modules\Journals\Services\JournalService;
use Illuminate\Http\RedirectResponse;

class JournalCategoryController extends Controller
{
    public function __construct(private JournalService $service) {}

    public function store(StoreCategoryRequest $request, Journal $journal): RedirectResponse
    {
        $this->authorize('manageCategories', $journal);

        $data = $request->safe()->except('cover_image');
        $category = $this->service->createCategory($journal, $data);

        if ($request->hasFile('cover_image')) {
            $this->service->uploadCategoryCoverImage($category, $request->file('cover_image'));
        }

        return back()->with('success', 'Category added.');
    }

    public function update(StoreCategoryRequest $request, Journal $journal, JournalCategory $category): RedirectResponse
    {
        $this->authorize('manageCategories', $journal);

        $data = $request->safe()->except('cover_image');
        $this->service->updateCategory($category, $data);

        if ($request->hasFile('cover_image')) {
            $this->service->uploadCategoryCoverImage($category, $request->file('cover_image'));
        }

        return back()->with('success', 'Category updated.');
    }

    public function destroy(Journal $journal, JournalCategory $category): RedirectResponse
    {
        $this->authorize('manageCategories', $journal);

        $this->service->deleteCategory($category);

        return back()->with('success', 'Category deleted.');
    }
}
