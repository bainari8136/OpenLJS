<?php

namespace App\Modules\Reviews\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Reviews\Models\ReviewAssignment;
use App\Modules\Reviews\Services\ReviewService;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function invite(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('assign-reviewer'), 403);

        $data = $request->validate([
            'reviewer_id' => ['required', 'exists:users,id'],
            'due_date'    => ['nullable', 'date', 'after:today'],
        ]);

        $reviewer = User::findOrFail($data['reviewer_id']);
        $this->reviewService->invite($submission, $reviewer, $request->user(), $data['due_date'] ?? null);

        return back()->with('success', "{$reviewer->name} has been invited to review this submission.");
    }

    public function cancel(Request $request, Submission $submission, ReviewAssignment $assignment): RedirectResponse
    {
        abort_unless($request->user()->can('assign-reviewer'), 403);
        abort_unless($assignment->submission_id === $submission->id, 404);

        $this->reviewService->cancel($assignment);

        return back()->with('success', 'Review invitation cancelled.');
    }
}
