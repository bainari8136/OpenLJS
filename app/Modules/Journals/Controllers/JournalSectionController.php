<?php

namespace App\Modules\Journals\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Models\JournalSection;
use App\Modules\Journals\Requests\StoreSectionRequest;
use App\Modules\Journals\Services\JournalService;
use Illuminate\Http\RedirectResponse;

class JournalSectionController extends Controller
{
    public function __construct(private JournalService $service) {}

    public function store(StoreSectionRequest $request, Journal $journal): RedirectResponse
    {
        $this->authorize('manageSections', $journal);

        $this->service->createSection($journal, $request->validated());

        return back()->with('success', 'Section added.');
    }

    public function update(StoreSectionRequest $request, Journal $journal, JournalSection $section): RedirectResponse
    {
        $this->authorize('manageSections', $journal);

        $this->service->updateSection($section, $request->validated());

        return back()->with('success', 'Section updated.');
    }

    public function destroy(Journal $journal, JournalSection $section): RedirectResponse
    {
        $this->authorize('manageSections', $journal);

        $this->service->deleteSection($section);

        return back()->with('success', 'Section deleted.');
    }
}
