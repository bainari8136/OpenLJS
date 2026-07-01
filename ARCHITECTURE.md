# OpenLJS Architecture

OpenLJS is a Laravel-based journal publishing and editorial workflow system inspired by Open Journal Systems, but redesigned as a modern modular Laravel application.

## 1. Architecture Style

OpenLJS uses a **modular monolith architecture**.

This means the application is deployed as one Laravel application, but internally it is separated into clear domain modules.

```text
openljs/
├── app/
│   ├── Core/
│   ├── Modules/
│   │   ├── Journals/
│   │   ├── Users/
│   │   ├── Submissions/
│   │   ├── Review/
│   │   ├── Editorial/
│   │   ├── Publishing/
│   │   ├── Issues/
│   │   ├── Articles/
│   │   ├── Notifications/
│   │   └── Plugins/
│   └── Support/
├── database/
├── resources/
│   └── js/
└── routes/
```

## 2. Core Goals

- Support multiple journals in one installation.
- Manage users, roles, permissions, and journal-specific responsibilities.
- Handle manuscript submission from author upload to publication.
- Support peer review, revisions, editor decisions, copyediting, and production.
- Publish issues and article pages.
- Provide a clean plugin-ready structure for future extensions.

## 3. Recommended Tech Stack

### Backend

- Laravel
- PHP 8.2+
- MySQL or PostgreSQL
- Laravel Queues
- Laravel Notifications
- Laravel Policies
- Laravel Storage
- Spatie Laravel Permission

### Frontend

- Inertia.js
- React
- Tailwind CSS
- PrimeReact or shadcn-style components

### Search

- Laravel Scout
- Meilisearch

### File Storage

- Local storage for development
- S3-compatible storage for production

## 4. Main Modules

### Core Module

Contains shared application services.

Responsibilities:

- Base models
- Shared traits
- System settings
- Audit logging
- Common service classes
- Global helper services

### Journals Module

Manages journal configuration.

Responsibilities:

- Journal profile
- Journal settings
- Sections
- Editorial policies
- Review policies
- Submission rules
- Journal branding

### Users Module

Manages accounts and access control.

Responsibilities:

- User registration
- Login and authentication
- Profiles
- Roles and permissions
- Journal-specific user assignments

Common roles:

- Super Admin
- Journal Manager
- Editor
- Section Editor
- Author
- Reviewer
- Copyeditor
- Production Editor
- Reader

### Submissions Module

Handles manuscript submission.

Responsibilities:

- Submission metadata
- Manuscript upload
- Author details
- Submission checklist
- File versions
- Submission status tracking

### Review Module

Handles peer review.

Responsibilities:

- Reviewer invitation
- Reviewer response
- Review forms
- Review deadlines
- Review recommendations
- Blind review support

### Editorial Module

Handles editorial decisions.

Responsibilities:

- Initial screening
- Editor assignment
- Review round management
- Accept decision
- Reject decision
- Revision request
- Resubmission workflow

### Publishing Module

Handles accepted manuscripts and public publishing.

Responsibilities:

- Copyediting
- Production files
- Galley files
- Article publication
- DOI metadata preparation
- Public article pages

### Issues Module

Handles journal issue publishing.

Responsibilities:

- Issue creation
- Volume and number management
- Table of contents
- Article assignment to issue
- Issue publication

### Plugins Module

Provides an extension point for future features.

Possible plugin areas:

- DOI registration
- Payment gateways
- Indexing metadata export
- Citation formats
- Custom review forms
- Email templates

## 5. Workflow Architecture

OpenLJS should use a state-based workflow model.

Example submission lifecycle:

```text
Draft
→ Submitted
→ Initial Check
→ Editor Assigned
→ Under Review
→ Revision Required
→ Revised
→ Accepted
→ Copyediting
→ Production
→ Scheduled for Issue
→ Published
```

Each workflow transition should be handled through service classes instead of placing business logic directly inside controllers.

Example:

```text
SubmissionController
→ SubmitManuscriptAction
→ SubmissionWorkflowService
→ NotificationService
```

## 6. Layered Structure

Each module should follow this internal structure:

```text
Modules/Submissions/
├── Actions/
├── Controllers/
├── Data/
├── Models/
├── Policies/
├── Requests/
├── Resources/
├── Services/
└── routes.php
```

## 7. Controller Responsibility

Controllers should stay thin.

They should only:

- Validate requests
- Call actions or services
- Return Inertia pages or redirects

They should not contain workflow logic.

## 8. Service Responsibility

Services should contain business logic.

Examples:

- SubmissionWorkflowService
- ReviewerAssignmentService
- EditorialDecisionService
- IssuePublishingService
- ArticlePublishingService

## 9. Authorization

OpenLJS should use layered authorization.

- Global roles for system-wide access
- Journal-level roles for journal-specific work
- Policies for resource-level access

Example:

```text
A user may be an editor in Journal A but only a reader in Journal B.
```

## 10. File Handling

Every uploaded file should be stored as a managed document record.

File metadata should include:

- Original filename
- Storage path
- File type
- File size
- Version number
- Uploaded by
- Related submission
- File stage

File stages:

- Submission file
- Review file
- Revision file
- Copyediting file
- Production file
- Galley file

## 11. Notification Architecture

Notifications should be event-driven.

Example events:

- SubmissionSubmitted
- EditorAssigned
- ReviewerInvited
- ReviewSubmitted
- RevisionRequested
- SubmissionAccepted
- ArticlePublished

Each event can trigger:

- Email notification
- In-app notification
- Activity log entry

## 12. Public Website Architecture

Public pages should be separated from dashboard pages.

Public pages:

- Journal homepage
- Current issue
- Archives
- Article page
- Author guidelines
- Editorial team
- About page

Dashboard pages:

- Author dashboard
- Editor dashboard
- Reviewer dashboard
- Journal manager dashboard
- Admin dashboard

## 13. Deployment Architecture

Recommended production setup:

```text
Nginx / Apache
→ Laravel Application
→ MySQL / PostgreSQL
→ Redis Queue
→ File Storage
→ Meilisearch
```

Optional services:

- Supervisor for queues
- Laravel Horizon
- S3-compatible storage
- Backup service
- Mail service provider

## 14. Future Architecture Extensions

- REST API for external integrations
- DOI provider integration
- ORCID integration
- Crossref metadata export
- OAI-PMH endpoint
- Pluggable theme system
- Multi-language support
