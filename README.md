# OpenLJS — Open Laravel Journal System

An open-source academic journal management platform built with Laravel 11, Inertia.js, React, and Tailwind CSS. OpenLJS maps the core architecture of Open Journal Systems (OJS) to modern Laravel patterns, providing a full editorial workflow from manuscript submission through peer review, copyediting, production, and final publication.

---

## Features

### Multi-Journal Support
- Host multiple journals under one installation, each with its own slug, sections, editorial team, and submission settings
- Per-journal roles scoped via Spatie Laravel Permission

### Journal Masthead & Editorial Team
- Publishing details (country, publisher, website) shown on the public About page
- Curated, orderable editorial team roster (name, masthead title, affiliation, ORCID, bio) — independent of user accounts, so board members don't need a login
- Public masthead page at `/j/{journal}/editorial-team`; only members marked active are shown

### Submission Workflow
- Author submission form with manuscript upload (PDF, DOC, DOCX, ODT up to 50 MB)
- Co-author management with ORCID validation (`\d{4}-\d{4}-\d{4}-\d{3}[\dX]`)
- Keyword tagging, abstract, and section assignment
- Full 12-stage status machine: `draft → submitted → initial_check → editor_assigned → under_review → revision_required → revised → accepted → rejected → copyediting → production → scheduled → published`

### Peer Review
- Invite, accept, decline, and cancel review assignments
- Reviewer queue with due-date tracking
- Structured review form: recommendation + comments to author + confidential comments to editor
- Reviewer response notifications to assigned editors

### Editorial Decisions
- Decisions: Accept, Reject, Request Revision, Send Back to Review
- Full decision history with timestamps and editor attribution
- Author revision upload with notification to editors

### Copyediting & Production
- File stage pipeline: submission → revision → copyediting → galley
- Permission-scoped stage management (`manage-copyediting`, `manage-production`)
- Multiple galley file formats per article

### Issue & Article Publishing
- Issue management with volume, number, and year metadata
- Automatic article conversion from scheduled submissions
- Assign articles to issues with page range metadata
- One-click issue publish: cascades `published_at` to all articles and updates submission statuses
- DOI assignment per article with format validation (`10.\d{4,}/\S+`)

### Notifications
- In-app notification bell (badge + dropdown) shared via Inertia middleware
- Email + database channels for all workflow events:
  - Submission received (author)
  - Editor assigned (editor)
  - Reviewer invited / responded (reviewer / editors)
  - Review submitted (editors)
  - Decision made (author)
  - Revision uploaded (editors)
  - Article published (author)
- Paginated notification index with mark-read and delete

### Search
- Laravel Scout integration (database driver for development, Meilisearch-ready for production)
- Unified search across submissions and published articles
- Permission-aware results: editors see all submissions; authors see their own; public sees published articles only

### OAI-PMH Metadata Harvesting
- Full OAI-PMH 2.0 endpoint at `GET /oai`
- All six verbs: `Identify`, `ListMetadataFormats`, `ListSets`, `ListIdentifiers`, `ListRecords`, `GetRecord`
- Dublin Core (`oai_dc`) metadata with DOI, authors, abstract, and journal set filtering
- Stateless cursor-based resumption tokens for large result sets

### RSS / Atom Feeds
- Per-journal feed of the 30 most recently published articles: `GET /j/{journal}/feed/rss` and `/feed/atom`
- Per-issue table-of-contents feed: `GET /j/{journal}/issues/{issue}/feed/rss` and `/feed/atom`
- Feed autodiscovery `<link>` tags on all public journal pages

### Metrics Dashboard
- KPIs: active journals, total submissions, published articles, total downloads, total unique views
- Submissions by status with proportional bar chart
- 30-day article views sparkline (privacy-preserving: IP hashed with SHA-256 + date salt)
- Top 10 articles by downloads and by views
- Recent activity feed from audit log

### Audit Logging
- `ActivityLog` records all key workflow transitions with user, journal, action, and description

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 11 |
| Frontend | React 19 + Inertia.js |
| Styling | Tailwind CSS v4 |
| Auth | Laravel Breeze |
| Roles & Permissions | Spatie Laravel Permission |
| Search | Laravel Scout (database / Meilisearch) |
| Notifications | Laravel Notifications (mail + database) |
| Database (dev) | SQLite |
| Database (prod) | MySQL / PostgreSQL |
| Build | Vite |

---

## Architecture

OpenLJS is a **modular monolith** — all code lives in one Laravel application, organised into self-contained modules under `app/Modules/`:

```
app/Modules/
├── Core/            # ActivityLog model
├── Users/           # User management, role assignment
├── Journals/        # Journal CRUD, sections, public journal pages
├── Submissions/     # Submission workflow, file upload, status machine
├── Editorial/       # Editor assignment, editorial decisions
├── Reviews/         # Review assignments, reviewer queue
├── Copyediting/     # File stage management
├── Issues/          # Issue & article management, publishing
├── Notifications/   # In-app notification controller
├── Search/          # Unified Scout search
├── Oai/             # OAI-PMH 2.0 endpoint
├── Feeds/           # RSS / Atom syndication feeds
├── Metrics/         # Analytics dashboard
└── Settings/        # Site-wide settings
```

Each module owns its `Controllers/`, `Models/`, `Services/`, and `routes.php`. All module route files are loaded in `routes/web.php`.

---

## Roles & Permissions

| Role | Permissions |
|---|---|
| **Super Admin** | Full access to all journals, users, and settings |
| **Journal Manager** | Manage journals, issues, users within a journal |
| **Section Editor** | Assign reviewers, make editorial decisions |
| **Reviewer** | View assigned submissions, submit peer reviews |
| **Author** | Submit manuscripts, track own submission progress |

Permissions enforced via `$user->can('permission-name')` and Laravel Policies on every controller action.

---

## Installation

### Requirements
- PHP 8.2+
- Composer
- Node.js 20+
- SQLite (dev) or MySQL/PostgreSQL (production)

### Steps

```bash
git clone <repo-url> openljs
cd openljs

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure your `.env`:

```env
DB_CONNECTION=sqlite
# DB_DATABASE=/absolute/path/to/database.sqlite

MAIL_MAILER=log          # use 'smtp' in production
QUEUE_CONNECTION=sync    # use 'database' or 'redis' in production

SCOUT_DRIVER=database    # use 'meilisearch' in production
```

```bash
touch database/database.sqlite   # SQLite only

php artisan migrate --seed
npm run build
php artisan serve
```

The seeder creates default roles and permissions. Register your first user, then assign the `super-admin` role via `php artisan tinker`:

```php
\App\Models\User::first()->assignRole('super-admin');
```

### Queue Worker (for email notifications)

```bash
php artisan queue:work
```

### Meilisearch (production search)

```bash
# Set in .env:
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://localhost:7700

php artisan scout:import "App\Modules\Issues\Models\Article"
php artisan scout:import "App\Modules\Submissions\Models\Submission"
```

---

## Public URLs

| Path | Description |
|---|---|
| `/` | Welcome / journal listing |
| `/j/{journal}/` | Journal home page |
| `/j/{journal}/about` | About page |
| `/j/{journal}/author-guidelines` | Author guidelines |
| `/j/{journal}/editorial-team` | Editorial team / masthead |
| `/j/{journal}/current-issue` | Current issue |
| `/j/{journal}/archive` | Issue archive |
| `/j/{journal}/articles/{article}` | Article detail page |
| `/j/{journal}/feed/rss`, `/feed/atom` | Journal-wide syndication feed |
| `/j/{journal}/issues/{issue}/feed/rss`, `/feed/atom` | Issue table-of-contents feed |
| `/oai` | OAI-PMH 2.0 endpoint |
| `/search` | Public + authenticated search |

## Dashboard URLs

| Path | Description |
|---|---|
| `/dashboard` | Author / editor home |
| `/submissions` | Submission list |
| `/editorial` | Editorial queue (editors) |
| `/reviews` | Reviewer queue |
| `/issues` | Issue management |
| `/notifications` | Notification inbox |
| `/metrics` | Analytics dashboard (admins) |
| `/users` | User management (admins) |
| `/journals` | Journal management (admins) |

---

## Roadmap

- [x] RSS / Atom feeds per journal and issue
- [ ] DOI pattern auto-generation and CrossRef deposit
- [ ] Subscription and paywall management (individual + institutional IP-range)
- [ ] JATS XML as second OAI-PMH metadata format
- [ ] Multi-lingual metadata (`spatie/laravel-translatable`)
- [ ] COUNTER-compliant usage statistics with robot filtering

---

## License

MIT
