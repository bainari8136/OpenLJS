<?php

namespace App\Modules\Editorial\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Editorial\Services\EditorialDecisionService;
use App\Modules\Editorial\Services\EditorAssignmentService;
use App\Modules\Editorial\Services\SubmissionStatusService;
use App\Modules\Submissions\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EditorialController extends Controller
{
    public function __construct(
        private EditorAssignmentService $assignmentService,
        private SubmissionStatusService $statusService,
        private EditorialDecisionService $decisionService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('view-all-submissions'), 403);

        $queue = $request->input('queue', 'unassigned');

        $query = Submission::with(['journal', 'section', 'submittingAuthor', 'editorialAssignments.editor'])
            ->where('status', '!=', Submission::STATUS_DRAFT);

        $query = match ($queue) {
            'unassigned' => $query->whereIn('status', [
                Submission::STATUS_SUBMITTED,
                Submission::STATUS_INITIAL_CHECK,
            ]),
            'my_queue' => $query->whereHas('editorialAssignments', fn ($q) =>
                $q->where('editor_id', $request->user()->id)
            ),
            'under_review' => $query->where('status', Submission::STATUS_UNDER_REVIEW),
            'awaiting_decision' => $query->whereIn('status', [
                Submission::STATUS_UNDER_REVIEW,
                Submission::STATUS_REVISION_REQUIRED,
                Submission::STATUS_REVISED,
            ]),
            'accepted' => $query->where('status', Submission::STATUS_ACCEPTED),
            'rejected' => $query->where('status', Submission::STATUS_REJECTED),
            default => $query,
        };

        $submissions = $query->latest()->paginate(25)->through(fn ($s) => [
            'id'           => $s->id,
            'title'        => $s->title ?? '(Untitled)',
            'status'       => $s->status,
            'status_label' => $s->statusLabel(),
            'journal'      => $s->journal?->title,
            'section'      => $s->section?->title,
            'author'       => $s->submittingAuthor?->name,
            'submitted_at' => $s->submitted_at?->toDateString(),
            'editors'      => $s->editorialAssignments->map(fn ($a) => [
                'name' => $a->editor?->name,
                'role' => $a->role,
            ]),
        ]);

        $counts = [
            'unassigned'       => Submission::whereIn('status', [Submission::STATUS_SUBMITTED, Submission::STATUS_INITIAL_CHECK])->count(),
            'under_review'     => Submission::where('status', Submission::STATUS_UNDER_REVIEW)->count(),
            'awaiting_decision'=> Submission::whereIn('status', [Submission::STATUS_UNDER_REVIEW, Submission::STATUS_REVISION_REQUIRED, Submission::STATUS_REVISED])->count(),
            'accepted'         => Submission::where('status', Submission::STATUS_ACCEPTED)->count(),
            'rejected'         => Submission::where('status', Submission::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Editorial/Index', [
            'submissions' => $submissions,
            'queue'       => $queue,
            'counts'      => $counts,
        ]);
    }

    public function assignEditor(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('assign-editor'), 403);

        $data = $request->validate([
            'editor_id' => ['required', 'exists:users,id'],
            'role'      => ['required', 'in:editor,section_editor'],
        ]);

        $editor = \App\Models\User::findOrFail($data['editor_id']);
        $this->assignmentService->assign($submission, $editor, $request->user(), $data['role']);

        return back()->with('success', "{$editor->name} assigned as {$data['role']}.");
    }

    public function unassignEditor(Request $request, Submission $submission): RedirectResponse
    {
        abort_unless($request->user()->can('assign-editor'), 403);

        $data = $request->validate([
            'editor_id' => ['required', 'exists:users,id'],
        ]);

        $editor = \App\Models\User::findOrFail($data['editor_id']);
        $this->assignmentService->unassign($submission, $editor);

        return back()->with('success', "{$editor->name} unassigned.");
    }

    public function transition(Request $request, Submission $submission): RedirectResponse
    {
        $data = $request->validate([
            'transition' => ['required', 'string'],
            'comments'   => ['nullable', 'string', 'max:2000'],
        ]);

        $permissionMap = [
            'move_to_production'      => 'manage-copyediting',
            'approve_for_scheduling'  => 'manage-production',
        ];
        $required = $permissionMap[$data['transition']] ?? 'make-editorial-decision';
        abort_unless($request->user()->can($required), 403);

        $this->statusService->transition($submission, $data['transition'], $request->user(), $data['comments'] ?? null);

        if ($this->decisionService->isFormalDecision($data['transition'])) {
            $this->decisionService->record($submission, $request->user(), $data['transition'], $data['comments'] ?? null);
        }

        return back()->with('success', 'Status updated.');
    }
}
