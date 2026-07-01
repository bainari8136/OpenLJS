<?php

namespace App\Modules\Journals\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Models\JournalEditorialMember;
use App\Modules\Journals\Requests\StoreEditorialMemberRequest;
use App\Modules\Journals\Services\JournalService;
use Illuminate\Http\RedirectResponse;

class JournalEditorialMemberController extends Controller
{
    public function __construct(private JournalService $service) {}

    public function store(StoreEditorialMemberRequest $request, Journal $journal): RedirectResponse
    {
        $this->authorize('manageEditorialTeam', $journal);

        $this->service->createEditorialMember($journal, $request->validated());

        return back()->with('success', 'Editorial team member added.');
    }

    public function update(StoreEditorialMemberRequest $request, Journal $journal, JournalEditorialMember $member): RedirectResponse
    {
        $this->authorize('manageEditorialTeam', $journal);

        $this->service->updateEditorialMember($member, $request->validated());

        return back()->with('success', 'Editorial team member updated.');
    }

    public function destroy(Journal $journal, JournalEditorialMember $member): RedirectResponse
    {
        $this->authorize('manageEditorialTeam', $journal);

        $this->service->deleteEditorialMember($member);

        return back()->with('success', 'Editorial team member removed.');
    }
}
