<?php

namespace App\Modules\Journals\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Requests\StoreJournalRequest;
use App\Modules\Journals\Requests\UpdateJournalRequest;
use App\Modules\Journals\Services\JournalService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    public function __construct(private JournalService $service) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Journal::class);

        $journals = Journal::withCount('sections')
            ->orderBy('title')
            ->get()
            ->map(fn ($j) => [
                'id' => $j->id,
                'title' => $j->title,
                'slug' => $j->slug,
                'acronym' => $j->acronym,
                'is_active' => $j->is_active,
                'submissions_enabled' => $j->submissions_enabled,
                'sections_count' => $j->sections_count,
                'logo_path' => $j->logo_path ? asset('storage/'.$j->logo_path) : null,
            ]);

        return Inertia::render('Journals/Index', ['journals' => $journals]);
    }

    public function create(): Response
    {
        $this->authorize('create', Journal::class);

        return Inertia::render('Journals/Create');
    }

    public function store(StoreJournalRequest $request): RedirectResponse
    {
        $journal = $this->service->create($request->validated(), $request->user());

        return redirect()->route('journals.edit', $journal)
            ->with('success', 'Journal created. Configure it below.');
    }

    public function edit(Journal $journal): Response
    {
        $this->authorize('update', $journal);

        return Inertia::render('Journals/Edit', [
            'journal' => [
                'id' => $journal->id,
                'title' => $journal->title,
                'slug' => $journal->slug,
                'acronym' => $journal->acronym,
                'country' => $journal->country,
                'publisher' => $journal->publisher,
                'website_url' => $journal->website_url,
                'description' => $journal->description,
                'author_guidelines' => $journal->author_guidelines,
                'review_policy' => $journal->review_policy,
                'issn_print' => $journal->issn_print,
                'issn_online' => $journal->issn_online,
                'is_active' => $journal->is_active,
                'submissions_enabled' => $journal->submissions_enabled,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
                'principal_contact_name' => $journal->principal_contact_name,
                'principal_contact_email' => $journal->principal_contact_email,
                'principal_contact_phone' => $journal->principal_contact_phone,
                'principal_contact_affiliation' => $journal->principal_contact_affiliation,
                'principal_contact_mailing_address' => $journal->principal_contact_mailing_address,
                'tech_support_name' => $journal->tech_support_name,
                'tech_support_email' => $journal->tech_support_email,
                'tech_support_phone' => $journal->tech_support_phone,
                'sections' => $journal->sections->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'abbreviation' => $s->abbreviation,
                    'slug' => $s->slug,
                    'description' => $s->description,
                    'policy' => $s->policy,
                    'word_count_limit' => $s->word_count_limit,
                    'identify_as' => $s->identify_as,
                    'is_peer_reviewed' => $s->is_peer_reviewed,
                    'is_active' => $s->is_active,
                    'sort_order' => $s->sort_order,
                ]),
                'editorial_members' => $journal->editorialMembers->map(fn ($m) => [
                    'id' => $m->id,
                    'name' => $m->name,
                    'title' => $m->title,
                    'affiliation' => $m->affiliation,
                    'email' => $m->email,
                    'orcid' => $m->orcid,
                    'bio' => $m->bio,
                    'is_active' => $m->is_active,
                    'sort_order' => $m->sort_order,
                ]),
                'categories' => $journal->categories->map(fn ($c) => [
                    'id' => $c->id,
                    'parent_id' => $c->parent_id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'description' => $c->description,
                    'article_ordering' => $c->article_ordering,
                    'cover_image_url' => $c->cover_image_path ? asset('storage/'.$c->cover_image_path) : null,
                    'is_active' => $c->is_active,
                    'sort_order' => $c->sort_order,
                ]),
            ],
        ]);
    }

    public function update(UpdateJournalRequest $request, Journal $journal): RedirectResponse
    {
        $data = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            $this->service->uploadLogo($journal, $request->file('logo'));
        }

        $this->service->update($journal, $data);

        return back()->with('success', 'Journal updated.');
    }

    public function destroy(Journal $journal): RedirectResponse
    {
        $this->authorize('delete', $journal);

        $journal->delete();

        return redirect()->route('journals.index')->with('success', 'Journal deleted.');
    }
}
