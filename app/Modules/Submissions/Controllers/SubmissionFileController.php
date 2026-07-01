<?php

namespace App\Modules\Submissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Models\SubmissionFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmissionFileController extends Controller
{
    public function download(Submission $submission, SubmissionFile $file): StreamedResponse
    {
        $this->authorize('downloadFile', $submission);

        abort_unless($file->submission_id === $submission->id, 404);
        abort_unless(Storage::disk('local')->exists($file->storage_path), 404);

        return Storage::disk('local')->download($file->storage_path, $file->original_name);
    }
}
