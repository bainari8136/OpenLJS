# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

OpenLJS — an open-source academic journal management platform (Laravel 13 + Inertia.js + React 19 + Tailwind v4), modeled on Open Journal Systems (OJS). Manuscript submission → peer review → editorial decisions → copyediting → production → issue publication, with multi-journal support, OAI-PMH harvesting, and an analytics dashboard.

## Commands

```bash
# Full dev environment (server + queue listener + log tailer + vite), run from composer.json "dev" script
composer dev

# Individually
php artisan serve
php artisan queue:listen --tries=1 --timeout=0
npm run dev            # vite
npm run build           # production frontend build

# Tests (PHPUnit, not Pest)
composer test            # clears config cache, then `php artisan test`
php artisan test
php artisan test --filter=TestName
php artisan test tests/Feature/Auth/AuthenticationTest.php

# Lint (Laravel Pint)
vendor/bin/pint
vendor/bin/pint --dirty

# DB
php artisan migrate --seed     # seeders create roles + permissions only, no demo data
php artisan tinker
```

No JS test runner or linter is configured (no ESLint/Prettier/Vitest/Jest in package.json).

## Architecture

**Modular monolith.** All backend code lives under `app/Modules/<Name>/`, each following:
```
Modules/<Name>/
├── Actions/       # single-purpose invokable classes called from controllers
├── Controllers/
├── Data/          # DTOs
├── Models/
├── Policies/
├── Requests/      # form request validation
├── Resources/     # API/Inertia resource transformers
├── Services/      # business/workflow logic — controllers stay thin and delegate here
└── routes.php     # required individually from routes/web.php
```

**Active modules** (wired into `routes/web.php`, in load order): `Users`, `Journals`, `Submissions`, `Editorial`, `Reviews`, `Copyediting`, `Issues`, `Notifications`, `Search`, `Oai`, `Metrics`, `Settings`, plus `Core` (shared `ActivityLog`, not route-based).

**Article/Issue publishing lives in the `Issues` module**, not a separate `Articles`/`Publishing` module — `Issues/Models/Article.php`, `Issues/Controllers/ArticleController.php`, `Issues/Services/PublishingService.php`.

**Dead scaffold directories — do not use:** `app/Modules/Articles/`, `app/Modules/Review/` (singular — the real one is `Reviews/`), `app/Modules/Publishing/`, `app/Modules/Plugins/`. These are empty stubs from early planning (`routes.php` is 0 bytes, no other files), not required anywhere. `ARCHITECTURE.md` describes this earlier/aspirational module layout; the actual implementation matches the module list above and the README, not `ARCHITECTURE.md`.

**Frontend**: Inertia pages under `resources/js/Pages/<Area>/` (e.g. `Submissions/`, `Editorial/`, `Reviews/`, `Issues/`, `Public/Journal/`), shared UI in `resources/js/Components/`, layouts in `resources/js/Layouts/`. Inertia render calls (`Inertia::render('Foo/Bar')`) map to `resources/js/Pages/Foo/Bar.jsx`.

**Public vs dashboard routes**: public journal pages are mounted at `/j/{journal:slug}/...` and are registered *after* the admin `/journals/...` routes in each module's `routes.php` to avoid slug/segment collisions (see `app/Modules/Journals/routes.php`).

**Authorization**: three layers — global Spatie roles (`super-admin`, `journal-manager`, `editor`, `section-editor`, `author`, `reviewer`, `copyeditor`, `production-editor`, `reader`, seeded by `database/seeders/RolesSeeder.php`), journal-scoped roles via the `journal_user_roles` pivot table, and Laravel Policies registered in `app/Providers/AppServiceProvider.php`. `Gate::before` grants `super-admin` bypass of all gates.

**Submission state machine** (12 stages): `draft → submitted → initial_check → editor_assigned → under_review → revision_required → revised → accepted/rejected → copyediting → production → scheduled → published`. Transitions belong in module `Services/`, not controllers.

**File handling**: every upload is a managed file record with stage tracking (submission / review / revision / copyediting / production / galley), not raw disk storage — see `Submissions/Models/SubmissionFiles` and `Issues/Models/ArticleFile`.

**Notifications**: Laravel Notifications (mail + database channel) per workflow event (submission received, editor assigned, reviewer invited/responded, review submitted, decision made, revision uploaded, article published), surfaced in-app via a notification bell fed through Inertia shared middleware data.

**Search**: Laravel Scout, `database` driver in dev, Meilisearch in production (`SCOUT_DRIVER` env var). Searchable models: `Issues/Models/Article`, `Submissions/Models/Submission`. Re-import after switching drivers: `php artisan scout:import "App\Modules\Issues\Models\Article"`.

**Metrics**: 30-day view sparklines hash visitor IPs with SHA-256 + date salt — don't store raw IPs when touching `Metrics`/`ArticleView`.

**OAI-PMH**: single endpoint `GET /oai` in `app/Modules/Oai/`, implements all six OAI-PMH 2.0 verbs with Dublin Core metadata and stateless cursor-based resumption tokens (no server-side session state for pagination).
