<?php

namespace App\Modules\Journals\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Journals\Models\Journal;
use Inertia\Inertia;
use Inertia\Response;

class PublicJournalController extends Controller
{
    public function home(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return Inertia::render('Public/Journal/Home', [
            'journal' => [
                'id' => $journal->id,
                'title' => $journal->title,
                'slug' => $journal->slug,
                'acronym' => $journal->acronym,
                'description' => $journal->description,
                'author_guidelines' => $journal->author_guidelines,
                'issn_print' => $journal->issn_print,
                'issn_online' => $journal->issn_online,
                'submissions_enabled' => $journal->submissions_enabled,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
                'sections' => $journal->activeSections->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'description' => $s->description,
                ]),
            ],
        ]);
    }

    public function about(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return Inertia::render('Public/Journal/About', [
            'journal' => [
                'title' => $journal->title,
                'slug' => $journal->slug,
                'description' => $journal->description,
                'author_guidelines' => $journal->author_guidelines,
                'review_policy' => $journal->review_policy,
                'country' => $journal->country,
                'publisher' => $journal->publisher,
                'website_url' => $journal->website_url,
                'issn_print' => $journal->issn_print,
                'issn_online' => $journal->issn_online,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
                'principal_contact_name' => $journal->principal_contact_name,
                'principal_contact_email' => $journal->principal_contact_email,
                'principal_contact_phone' => $journal->principal_contact_phone,
                'principal_contact_affiliation' => $journal->principal_contact_affiliation,
                'principal_contact_mailing_address' => $journal->principal_contact_mailing_address,
            ],
        ]);
    }

    public function guidelines(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return Inertia::render('Public/Journal/Guidelines', [
            'journal' => [
                'title' => $journal->title,
                'slug' => $journal->slug,
                'author_guidelines' => $journal->author_guidelines,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
            ],
        ]);
    }

    public function categories(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return Inertia::render('Public/Journal/Categories', [
            'journal' => [
                'title' => $journal->title,
                'slug' => $journal->slug,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
            ],
            'categories' => $journal->categories->where('is_active', true)->values()->map(fn ($c) => [
                'id' => $c->id,
                'parent_id' => $c->parent_id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'cover_image_url' => $c->cover_image_path ? asset('storage/'.$c->cover_image_path) : null,
                'sort_order' => $c->sort_order,
            ]),
        ]);
    }

    public function editorialTeam(Journal $journal): Response
    {
        abort_unless($journal->is_active, 404);

        return Inertia::render('Public/Journal/EditorialTeam', [
            'journal' => [
                'title' => $journal->title,
                'slug' => $journal->slug,
                'logo_url' => $journal->logo_path ? asset('storage/'.$journal->logo_path) : null,
            ],
            'members' => $journal->activeEditorialMembers->map(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'title' => $m->title,
                'affiliation' => $m->affiliation,
                'orcid' => $m->orcid,
                'bio' => $m->bio,
            ]),
        ]);
    }
}
