# OpenLJS Implementation Plan

This document describes a practical step-by-step implementation plan for OpenLJS.

## Phase 1: Project Foundation

Goal: Prepare the Laravel application foundation.

Tasks:

- Create Laravel project
- Configure database
- Install Inertia.js with React
- Install Tailwind CSS
- Set up authentication
- Install Spatie Laravel Permission
- Create base layout
- Create dashboard layout
- Configure file storage
- Configure queues

Deliverables:

- Working Laravel app
- Login and registration
- Basic dashboard
- Role and permission package installed

## Phase 2: User and Role System

Goal: Implement users, roles, and journal-level access.

Tasks:

- Create user profile fields
- Seed default system roles
- Create permission names
- Create role assignment interface
- Implement journal-specific role mapping
- Create authorization policies

Default roles:

- Super Admin
- Journal Manager
- Editor
- Section Editor
- Author
- Reviewer
- Copyeditor
- Production Editor
- Reader

Deliverables:

- Role-based dashboard access
- User management page
- Journal user role assignment

## Phase 3: Journal Management

Goal: Allow administrators to create and configure journals.

Tasks:

- Create journals table
- Create journal sections table
- Create journal settings pages
- Implement journal logo upload
- Create author guidelines page
- Create public journal homepage

Deliverables:

- Create/edit journal
- Manage sections
- Public journal homepage

## Phase 4: Submission System

Goal: Allow authors to submit manuscripts.

Tasks:

- Create submissions table
- Create submission_authors table
- Create submission_files table
- Build multi-step submission form
- Implement manuscript upload
- Store file metadata
- Create author dashboard
- Create submission detail page

Submission steps:

1. Start
2. Upload manuscript
3. Enter metadata
4. Add contributors
5. Confirm and submit

Deliverables:

- Author can create submission
- Author can upload manuscript
- Author can track submission status

## Phase 5: Editorial Assignment

Goal: Allow editors to manage submitted manuscripts.

Tasks:

- Create editorial_assignments table
- Build editor dashboard
- Build editorial queue
- Implement initial screening
- Implement editor assignment
- Implement submission status transitions
- Add activity logging

Deliverables:

- Editor can view submissions
- Editor can assign manuscripts
- Submission status changes are tracked

## Phase 6: Peer Review Workflow

Goal: Implement reviewer assignment and review submission.

Tasks:

- Create review_assignments table
- Create reviews table
- Assign reviewers to submissions
- Send reviewer invitation notification
- Allow reviewer to accept or decline
- Allow reviewer to download review file
- Build review form
- Submit review recommendation
- Notify editor after review completion

Review recommendations:

- Accept
- Minor revision
- Major revision
- Reject

Deliverables:

- Reviewer workflow works end-to-end
- Editor can view submitted reviews

## Phase 7: Editorial Decisions and Revisions

Goal: Allow editors to make decisions after review.

Tasks:

- Create editorial_decisions table
- Implement accept decision
- Implement reject decision
- Implement request revision decision
- Implement send back to review decision
- Allow author revision upload
- Track file versions
- Notify authors of decisions

Deliverables:

- Editor can make decisions
- Author can upload revisions
- Submission can move through review cycles

## Phase 8: Copyediting and Production

Goal: Prepare accepted submissions for publication.

Tasks:

- Add copyediting stage
- Add production stage
- Support copyediting files
- Support production files
- Upload final article PDF
- Add production approval action

Deliverables:

- Accepted manuscript can move to copyediting
- Production-ready files can be uploaded

## Phase 9: Issue and Article Publishing

Goal: Publish articles and issues publicly.

Tasks:

- Create issues table
- Create articles table
- Create article_files table
- Create issue management interface
- Convert accepted submission to article
- Assign article to issue
- Publish issue
- Create public article page
- Create archive page

Deliverables:

- Journal issue can be published
- Article pages are publicly visible
- PDF files can be downloaded

## Phase 10: Notifications and Email Templates

Goal: Improve communication between users.

Tasks:

- Create notification events
- Create mail notifications
- Add in-app notifications
- Add notification preferences
- Create editable email templates later

Important notifications:

- Submission submitted
- Editor assigned
- Reviewer invited
- Review submitted
- Revision requested
- Submission accepted
- Submission rejected
- Article published

Deliverables:

- Users receive workflow notifications
- Editors and authors stay updated

## Phase 11: Search and Public Discovery

Goal: Make published content easy to find.

Tasks:

- Install Laravel Scout
- Configure Meilisearch
- Index articles
- Add public search page
- Add filters by journal, issue, author, and keyword

Deliverables:

- Public article search
- Searchable article archive

## Phase 12: Advanced Publishing Features

Goal: Add features closer to full OJS-level functionality.

Tasks:

- DOI support
- ORCID support
- OAI-PMH endpoint
- Citation export
- Article metrics
- Review forms
- Multi-language support
- Plugin hooks

Deliverables:

- More complete academic publishing system
- Better integration with scholarly publishing tools

## Recommended Implementation Order

```text
1. Auth
2. Roles and permissions
3. Journals
4. Sections
5. Submissions
6. Files
7. Editorial queue
8. Review workflow
9. Editorial decisions
10. Revisions
11. Copyediting
12. Production
13. Issues
14. Articles
15. Public pages
16. Notifications
17. Search
18. Advanced integrations
```

## MVP Completion Criteria

The MVP is complete when:

- A journal can be created
- Users can register and log in
- Roles can be assigned
- Author can submit manuscript
- Editor can assign reviewer
- Reviewer can submit review
- Editor can accept or reject manuscript
- Accepted manuscript can become article
- Article can be assigned to issue
- Issue can be published publicly
