<?php

namespace App\Modules\Reviews\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Reviews\Models\ReviewAssignment;
use App\Modules\Reviews\Services\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(private ReviewService $reviewService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $assignments = ReviewAssignment::with(['submission.journal', 'submission.section', 'review'])
            ->where('reviewer_id', $user->id)
            ->latest()
            ->paginate(20)
            ->through(fn ($a) => $this->formatAssignment($a));

        return Inertia::render('Reviews/Index', [
            'assignments' => $assignments,
        ]);
    }

    public function show(Request $request, ReviewAssignment $assignment): Response
    {
        abort_unless($assignment->reviewer_id === $request->user()->id, 403);

        $assignment->load(['submission.journal', 'submission.section', 'submission.authors', 'review']);

        return Inertia::render('Reviews/Show', [
            'assignment' => $this->formatAssignmentDetail($assignment),
        ]);
    }

    public function accept(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        abort_unless($assignment->reviewer_id === $request->user()->id, 403);
        abort_unless($assignment->status === ReviewAssignment::STATUS_INVITED, 422);

        $this->reviewService->accept($assignment);

        return back()->with('success', 'You have accepted this review invitation.');
    }

    public function decline(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        abort_unless($assignment->reviewer_id === $request->user()->id, 403);
        abort_unless($assignment->status === ReviewAssignment::STATUS_INVITED, 422);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $this->reviewService->decline($assignment, $data['reason'] ?? null);

        return redirect()->route('reviews.index')->with('success', 'Review invitation declined.');
    }

    public function submit(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        abort_unless($assignment->reviewer_id === $request->user()->id, 403);

        $data = $request->validate([
            'recommendation'     => ['required', 'in:accept,minor_revision,major_revision,reject'],
            'comments_to_editor' => ['nullable', 'string', 'max:10000'],
            'comments_to_author' => ['nullable', 'string', 'max:10000'],
        ]);

        $this->reviewService->submitReview($assignment, $data);

        return redirect()->route('reviews.index')->with('success', 'Your review has been submitted successfully.');
    }

    private function formatAssignment(ReviewAssignment $a): array
    {
        return [
            'id'           => $a->id,
            'status'       => $a->status,
            'status_label' => $a->statusLabel(),
            'due_date'     => $a->due_date?->toDateString(),
            'invited_at'   => $a->invited_at?->toDateString(),
            'submission'   => [
                'id'      => $a->submission?->id,
                'title'   => $a->submission?->title ?? '(Untitled)',
                'journal' => $a->submission?->journal?->title,
                'section' => $a->submission?->section?->title,
            ],
            'has_review' => $a->review !== null,
        ];
    }

    private function formatAssignmentDetail(ReviewAssignment $a): array
    {
        return [
            'id'           => $a->id,
            'status'       => $a->status,
            'status_label' => $a->statusLabel(),
            'due_date'     => $a->due_date?->toDateString(),
            'decline_reason' => $a->decline_reason,
            'submission'   => [
                'id'       => $a->submission?->id,
                'title'    => $a->submission?->title ?? '(Untitled)',
                'abstract' => $a->submission?->abstract,
                'keywords' => $a->submission?->keywords ?? [],
                'journal'  => $a->submission?->journal?->title,
                'section'  => $a->submission?->section?->title,
                'authors'  => $a->submission?->authors?->map(fn ($au) => [
                    'name'        => $au->name,
                    'affiliation' => $au->affiliation,
                    'is_corresponding' => $au->is_corresponding,
                ]) ?? [],
            ],
            'review' => $a->review ? [
                'recommendation'       => $a->review->recommendation,
                'recommendation_label' => $a->review->recommendationLabel(),
                'comments_to_editor'   => $a->review->comments_to_editor,
                'comments_to_author'   => $a->review->comments_to_author,
                'submitted_at'         => $a->review->submitted_at?->toDateString(),
            ] : null,
        ];
    }
}
