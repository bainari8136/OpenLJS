<?php

namespace App\Modules\Submissions\Services;

use App\Models\User;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Models\SubmissionAuthor;
use App\Modules\Submissions\Models\SubmissionFile;
use App\Notifications\SubmissionReceived;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SubmissionWorkflowService
{
    public function createDraft(User $author, int $journalId, int $sectionId): Submission
    {
        return Submission::create([
            'journal_id'           => $journalId,
            'section_id'           => $sectionId,
            'submitting_author_id' => $author->id,
            'status'               => Submission::STATUS_DRAFT,
            'current_stage'        => 'submission',
        ]);
    }

    public function updateMetadata(Submission $submission, array $data): Submission
    {
        $submission->update([
            'title'    => $data['title'],
            'abstract' => $data['abstract'],
            'keywords' => $data['keywords'] ?? [],
        ]);

        return $submission->fresh();
    }

    public function syncAuthors(Submission $submission, array $authors): void
    {
        $submission->authors()->delete();

        foreach ($authors as $i => $author) {
            SubmissionAuthor::create([
                'submission_id'    => $submission->id,
                'name'             => $author['name'],
                'email'            => $author['email'],
                'affiliation'      => $author['affiliation'] ?? null,
                'country'          => $author['country'] ?? null,
                'orcid'            => $author['orcid'] ?? null,
                'author_order'     => $i,
                'is_corresponding' => $i === 0,
            ]);
        }
    }

    public function uploadManuscript(Submission $submission, UploadedFile $file, User $uploader): SubmissionFile
    {
        $version = $submission->submissionFiles()->max('version') + 1;
        $path = $file->storeAs(
            "submissions/{$submission->id}/manuscript",
            "v{$version}_{$file->getClientOriginalName()}",
            'local'
        );

        return SubmissionFile::create([
            'submission_id' => $submission->id,
            'uploaded_by'   => $uploader->id,
            'file_stage'    => 'submission',
            'original_name' => $file->getClientOriginalName(),
            'storage_path'  => $path,
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'version'       => $version,
        ]);
    }

    public function uploadRevision(Submission $submission, UploadedFile $file, User $uploader): SubmissionFile
    {
        $version = SubmissionFile::where('submission_id', $submission->id)->max('version') + 1;
        $path = $file->storeAs(
            "submissions/{$submission->id}/revisions",
            "v{$version}_{$file->getClientOriginalName()}",
            'local'
        );

        return SubmissionFile::create([
            'submission_id' => $submission->id,
            'uploaded_by'   => $uploader->id,
            'file_stage'    => 'revision',
            'original_name' => $file->getClientOriginalName(),
            'storage_path'  => $path,
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'version'       => $version,
        ]);
    }

    public function submit(Submission $submission, User $author): Submission
    {
        DB::transaction(function () use ($submission, $author) {
            $submission->update([
                'status'       => Submission::STATUS_SUBMITTED,
                'submitted_at' => now(),
            ]);

            ActivityLog::record(
                action: 'submission.submitted',
                subject: $submission,
                description: 'Author submitted the manuscript.',
                userId: $author->id,
                journalId: $submission->journal_id,
            );
        });

        $submission->load('submittingAuthor');
        $submission->submittingAuthor?->notify(new SubmissionReceived($submission));

        return $submission->fresh();
    }
}
