<?php

namespace App\Modules\Submissions\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Core\Models\ActivityLog;
use App\Modules\Editorial\Services\EditorAssignmentService;
use App\Modules\Editorial\Services\SubmissionStatusService;
use App\Modules\Journals\Models\Journal;
use App\Modules\Reviews\Services\ReviewService;
use App\Modules\Submissions\Models\Submission;
use App\Modules\Submissions\Services\SubmissionWorkflowService;
use App\Notifications\RevisionUploaded;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function __construct(
        private SubmissionWorkflowService $workflow,
        private EditorAssignmentService $assignmentService,
        private SubmissionStatusService $statusService,
        private ReviewService $reviewService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Submission::class);

        $user = $request->user();
        $canViewAll = $user->can('view-all-submissions');

        $query = Submission::with(['journal', 'section', 'submittingAuthor'])
            ->when(!$canViewAll, fn ($q) => $q->where('submitting_author_id', $user->id))
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $submissions = $query->paginate(20)->through(fn ($s) => $this->formatSubmission($s));

        return Inertia::render('Submissions/Index', [
            'submissions' => $submissions,
            'filters'     => $request->only('status'),
            'canViewAll'  => $canViewAll,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Submission::class);

        $journals = Journal::where('is_active', true)
            ->where('submissions_enabled', true)
            ->with('activeSections')
            ->get()
            ->map(fn ($j) => [
                'id'       => $j->id,
                'title'    => $j->title,
                'sections' => $j->activeSections->map(fn ($s) => [
                    'id'    => $s->id,
                    'title' => $s->title,
                ]),
            ]);

        return Inertia::render('Submissions/Create', [
            'journals'    => $journals,
            'authUser'    => [
                'name'        => $request->user()->name,
                'email'       => $request->user()->email,
                'affiliation' => $request->user()->affiliation,
                'country'     => $request->user()->country,
                'orcid'       => $request->user()->orcid,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Submission::class);

        $data = $request->validate([
            'journal_id'          => ['required', 'exists:journals,id'],
            'section_id'          => ['required', 'exists:journal_sections,id'],
            'title'               => ['required', 'string', 'max:500'],
            'abstract'            => ['required', 'string'],
            'keywords'            => ['nullable', 'array'],
            'keywords.*'          => ['string', 'max:100'],
            'authors'             => ['required', 'array', 'min:1'],
            'authors.*.name'      => ['required', 'string', 'max:255'],
            'authors.*.email'     => ['required', 'email'],
            'authors.*.affiliation' => ['nullable', 'string', 'max:255'],
            'authors.*.country'   => ['nullable', 'string', 'max:255'],
            'authors.*.orcid'     => ['nullable', 'string', 'max:50', 'regex:/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/'],
            'manuscript'          => ['required', 'file', 'mimes:pdf,doc,docx,odt', 'max:51200'],
        ]);

        $submission = $this->workflow->createDraft($request->user(), $data['journal_id'], $data['section_id']);
        $this->workflow->updateMetadata($submission, $data);
        $this->workflow->syncAuthors($submission, $data['authors']);
        $this->workflow->uploadManuscript($submission, $request->file('manuscript'), $request->user());
        $this->workflow->submit($submission, $request->user());

        return redirect()->route('submissions.show', $submission)
            ->with('success', 'Your manuscript has been submitted successfully.');
    }

    public function show(Submission $submission): Response
    {
        $this->authorize('view', $submission);

        $user = request()->user();
        $canManage = $user->can('manage-submissions');
        $canCopyedit       = $user->can('manage-copyediting');
        $canProduction     = $user->can('manage-production');
        $canUploadRevision = !$canManage
            && $submission->submitting_author_id === $user->id
            && $submission->status === Submission::STATUS_REVISION_REQUIRED;

        $submission->load([
            'journal', 'section', 'authors',
            'files.uploader',
            'submittingAuthor',
            'editorialAssignments.editor',
            'reviewAssignments.reviewer',
            'reviewAssignments.review',
            'editorialDecisions.editor',
            'article',
        ]);

        $canConvertToArticle = $user->can('manage-issues')
            && $submission->status === Submission::STATUS_SCHEDULED
            && $submission->article === null;

        $canTransition = $canManage || $canCopyedit || $canProduction;

        return Inertia::render('Submissions/Show', [
            'submission'           => $this->formatSubmissionDetail($submission),
            'canManage'            => $canManage,
            'canCopyedit'          => $canCopyedit,
            'canProduction'        => $canProduction,
            'canUploadRevision'    => $canUploadRevision,
            'availableTransitions' => $canTransition ? $this->statusService->availableTransitions($submission) : [],
            'availableEditors'     => $canManage ? $this->assignmentService->availableEditors($submission) : [],
            'availableReviewers'     => $canManage ? $this->reviewService->availableReviewers($submission) : [],
            'canConvertToArticle'    => $canConvertToArticle,
            'articleId'              => $submission->article?->id,
        ]);
    }

    public function revise(Request $request, Submission $submission): RedirectResponse
    {
        $this->authorize('view', $submission);

        abort_unless($submission->submitting_author_id === $request->user()->id, 403);
        abort_unless($submission->status === Submission::STATUS_REVISION_REQUIRED, 422);

        $request->validate([
            'manuscript' => ['required', 'file', 'mimes:pdf,doc,docx,odt', 'max:51200'],
        ]);

        $this->workflow->uploadRevision($submission, $request->file('manuscript'), $request->user());
        $submission->update(['status' => Submission::STATUS_REVISED]);

        ActivityLog::record(
            action: 'submission.revision_uploaded',
            subject: $submission,
            description: 'Author uploaded a revised manuscript.',
            userId: $request->user()->id,
            journalId: $submission->journal_id,
        );

        $submission->load('editorialAssignments.editor');
        $submission->editorialAssignments->each(
            fn ($ea) => $ea->editor?->notify(new RevisionUploaded($submission))
        );

        return back()->with('success', 'Your revised manuscript has been uploaded.');
    }

    private function formatFiles($files): array
    {
        return $files->values()->map(fn ($f) => [
            'id'            => $f->id,
            'file_stage'    => $f->file_stage,
            'original_name' => $f->original_name,
            'mime_type'     => $f->mime_type,
            'size'          => $f->formattedSize(),
            'version'       => $f->version,
            'uploaded_by'   => $f->uploader?->name,
            'uploaded_at'   => $f->created_at->toDateString(),
            'download_url'  => $f->downloadUrl(),
        ])->toArray();
    }

    private function formatSubmission(Submission $s): array
    {
        return [
            'id'            => $s->id,
            'title'         => $s->title ?? '(Untitled)',
            'status'        => $s->status,
            'status_label'  => $s->statusLabel(),
            'journal'       => $s->journal?->title,
            'section'       => $s->section?->title,
            'submitted_at'  => $s->submitted_at?->toDateString(),
            'created_at'    => $s->created_at->toDateString(),
        ];
    }

    private function formatSubmissionDetail(Submission $s): array
    {
        return [
            'id'            => $s->id,
            'title'         => $s->title ?? '(Untitled)',
            'abstract'      => $s->abstract,
            'keywords'      => $s->keywords ?? [],
            'status'        => $s->status,
            'status_label'  => $s->statusLabel(),
            'current_stage' => $s->current_stage,
            'submitted_at'  => $s->submitted_at?->toDateString(),
            'created_at'    => $s->created_at->toDateString(),
            'journal'       => ['id' => $s->journal?->id, 'title' => $s->journal?->title, 'slug' => $s->journal?->slug],
            'section'       => $s->section?->title,
            'authors'       => $s->authors->map(fn ($a) => [
                'id'              => $a->id,
                'name'            => $a->name,
                'email'           => $a->email,
                'affiliation'     => $a->affiliation,
                'country'         => $a->country,
                'orcid'           => $a->orcid,
                'is_corresponding' => $a->is_corresponding,
            ]),
            'files'             => $this->formatFiles($s->files->where('file_stage', 'submission')),
            'revision_files'    => $this->formatFiles($s->files->where('file_stage', 'revision')),
            'copyediting_files' => $this->formatFiles($s->files->where('file_stage', 'copyediting')),
            'galley_files'      => $this->formatFiles($s->files->where('file_stage', 'galley')),
            'assignments' => $s->relationLoaded('editorialAssignments')
                ? $s->editorialAssignments->map(fn ($a) => [
                    'id'          => $a->id,
                    'editor'      => ['id' => $a->editor?->id, 'name' => $a->editor?->name],
                    'role'        => $a->role,
                    'assigned_at' => $a->assigned_at?->toDateString(),
                ])
                : [],
            'review_assignments' => $s->relationLoaded('reviewAssignments')
                ? $s->reviewAssignments->map(fn ($ra) => [
                    'id'           => $ra->id,
                    'status'       => $ra->status,
                    'status_label' => $ra->statusLabel(),
                    'due_date'     => $ra->due_date?->toDateString(),
                    'reviewer'     => ['id' => $ra->reviewer?->id, 'name' => $ra->reviewer?->name],
                    'review' => $ra->review ? [
                        'recommendation'       => $ra->review->recommendation,
                        'recommendation_label' => $ra->review->recommendationLabel(),
                        'comments_to_author'   => $ra->review->comments_to_author,
                        'comments_to_editor'   => $ra->review->comments_to_editor,
                        'submitted_at'         => $ra->review->submitted_at?->toDateString(),
                    ] : null,
                ])
                : [],
            'decisions' => $s->relationLoaded('editorialDecisions')
                ? $s->editorialDecisions->map(fn ($d) => [
                    'id'          => $d->id,
                    'decision'    => $d->decision,
                    'label'       => $d->decisionLabel(),
                    'comments'    => $d->comments,
                    'editor'      => $d->editor?->name,
                    'decided_at'  => $d->decided_at->toDateString(),
                ])
                : [],
        ];
    }
}
