<?php

namespace App\Modules\Copyediting\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Models\SubmissionFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CopyeditingController extends Controller
{
    public function uploadCopyeditingFile(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('manage-copyediting'), 403);
        abort_unless($submission->status === Submission::STATUS_COPYEDITING, 422);

        $request->validate([
            'file'  => ['required', 'file', 'mimes:pdf,doc,docx,odt,html,xml', 'max:51200'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $file = $request->file('file');
        $version = SubmissionFile::where('submission_id', $submission->id)
            ->where('file_stage', 'copyediting')
            ->max('version') + 1;

        $path = $file->storeAs(
            "submissions/{$submission->id}/copyediting",
            "v{$version}_{$file->getClientOriginalName()}",
            'local'
        );

        SubmissionFile::create([
            'submission_id' => $submission->id,
            'uploaded_by'   => $request->user()->id,
            'file_stage'    => 'copyediting',
            'original_name' => $request->input('label') ?: $file->getClientOriginalName(),
            'storage_path'  => $path,
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'version'       => $version,
        ]);

        ActivityLog::record(
            action: 'copyediting.file_uploaded',
            subject: $submission,
            description: "{$request->user()->name} uploaded a copyediting file.",
            userId: $request->user()->id,
            journalId: $submission->journal_id,
        );

        return back()->with('success', 'Copyediting file uploaded.');
    }

    public function uploadGalley(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('manage-production'), 403);
        abort_unless($submission->status === Submission::STATUS_PRODUCTION, 422);

        $request->validate([
            'file'  => ['required', 'file', 'mimes:pdf,html,xml,epub', 'max:102400'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $file = $request->file('file');
        $version = SubmissionFile::where('submission_id', $submission->id)
            ->where('file_stage', 'galley')
            ->max('version') + 1;

        $path = $file->storeAs(
            "submissions/{$submission->id}/galleys",
            "v{$version}_{$file->getClientOriginalName()}",
            'local'
        );

        SubmissionFile::create([
            'submission_id' => $submission->id,
            'uploaded_by'   => $request->user()->id,
            'file_stage'    => 'galley',
            'original_name' => $request->input('label') ?: $file->getClientOriginalName(),
            'storage_path'  => $path,
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
            'version'       => $version,
        ]);

        ActivityLog::record(
            action: 'production.galley_uploaded',
            subject: $submission,
            description: "{$request->user()->name} uploaded a galley file.",
            userId: $request->user()->id,
            journalId: $submission->journal_id,
        );

        return back()->with('success', 'Galley file uploaded.');
    }

    public function deleteFile(Request $request, Submission $submission, SubmissionFile $file): RedirectResponse
    {
        abort_unless($file->submission_id === $submission->id, 404);

        if ($file->file_stage === 'copyediting') {
            abort_unless($request->user()->can('manage-copyediting'), 403);
        } elseif ($file->file_stage === 'galley') {
            abort_unless($request->user()->can('manage-production'), 403);
        } else {
            abort(403);
        }

        Storage::disk('local')->delete($file->storage_path);
        $file->delete();

        return back()->with('success', 'File deleted.');
    }
}
