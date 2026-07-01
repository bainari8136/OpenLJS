<?php

namespace App\Modules\Journals\Services;

use App\Models\User;
use App\Modules\Journals\Models\Journal;
use App\Modules\Journals\Models\JournalEditorialMember;
use App\Modules\Journals\Models\JournalSection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class JournalService
{
    public function create(array $data, User $creator): Journal
    {
        $data['created_by'] = $creator->id;
        $data['slug'] = Str::slug($data['title']);

        return Journal::create($data);
    }

    public function update(Journal $journal, array $data): Journal
    {
        if (isset($data['title']) && $journal->title !== $data['title']) {
            $data['slug'] = Str::slug($data['title']);
        }

        $journal->update($data);

        return $journal->fresh();
    }

    public function uploadLogo(Journal $journal, UploadedFile $file): Journal
    {
        if ($journal->logo_path) {
            Storage::disk('public')->delete($journal->logo_path);
        }

        $path = $file->store("journals/{$journal->id}/logos", 'public');
        $journal->update(['logo_path' => $path]);

        return $journal->fresh();
    }

    public function createSection(Journal $journal, array $data): JournalSection
    {
        $data['journal_id'] = $journal->id;
        $data['sort_order'] = $journal->sections()->max('sort_order') + 1;

        return JournalSection::create($data);
    }

    public function updateSection(JournalSection $section, array $data): JournalSection
    {
        $section->update($data);

        return $section->fresh();
    }

    public function deleteSection(JournalSection $section): void
    {
        $section->delete();
    }

    public function createEditorialMember(Journal $journal, array $data): JournalEditorialMember
    {
        $data['journal_id'] = $journal->id;
        $data['sort_order'] = $journal->editorialMembers()->max('sort_order') + 1;

        return JournalEditorialMember::create($data);
    }

    public function updateEditorialMember(JournalEditorialMember $member, array $data): JournalEditorialMember
    {
        $member->update($data);

        return $member->fresh();
    }

    public function deleteEditorialMember(JournalEditorialMember $member): void
    {
        $member->delete();
    }
}
