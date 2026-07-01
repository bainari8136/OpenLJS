# OpenLJS Database Design

This document describes the main database structure for OpenLJS.

## 1. Main Entities

OpenLJS revolves around these main entities:

- Users
- Journals
- Roles and permissions
- Submissions
- Submission files
- Review assignments
- Editorial decisions
- Issues
- Articles
- Notifications
- Activity logs

## 2. Core Tables

## users

Stores user accounts.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| name | string | Full name |
| email | string | Unique |
| password | string | Hashed password |
| affiliation | string | Nullable |
| country | string | Nullable |
| bio | text | Nullable |
| orcid | string | Nullable |
| email_verified_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## journals

Stores journals hosted in the system.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| title | string | Journal title |
| slug | string | Unique URL slug |
| acronym | string | Nullable |
| description | text | Nullable |
| issn_print | string | Nullable |
| issn_online | string | Nullable |
| logo_path | string | Nullable |
| is_active | boolean | Default true |
| submissions_enabled | boolean | Default true |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## journal_user_roles

Maps users to journal-specific roles.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| journal_id | foreignId | References journals |
| user_id | foreignId | References users |
| role_name | string | Example: editor, reviewer, author |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## journal_sections

Stores sections inside a journal.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| journal_id | foreignId | References journals |
| title | string | Example: Research Articles |
| slug | string | Section slug |
| description | text | Nullable |
| is_active | boolean | Default true |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## submissions

Stores manuscript submissions.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| journal_id | foreignId | References journals |
| section_id | foreignId | References journal_sections |
| submitting_author_id | foreignId | References users |
| title | string | Manuscript title |
| abstract | text | Manuscript abstract |
| keywords | json | Nullable |
| status | string | Workflow status |
| current_stage | string | Current workflow stage |
| submitted_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

Suggested status values:

```text
draft
submitted
initial_check
editor_assigned
under_review
revision_required
revised
accepted
rejected
copyediting
production
scheduled
published
```

## submission_authors

Stores all authors connected to a submission.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| user_id | foreignId | Nullable, if author has account |
| name | string | Author name |
| email | string | Author email |
| affiliation | string | Nullable |
| country | string | Nullable |
| orcid | string | Nullable |
| author_order | integer | Display order |
| is_corresponding | boolean | Default false |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## submission_files

Stores uploaded files and versions.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| uploaded_by | foreignId | References users |
| file_stage | string | submission, review, revision, copyediting, production, galley |
| original_name | string | Original filename |
| storage_path | string | Storage path |
| mime_type | string | File type |
| size_bytes | bigint | File size |
| version | integer | File version |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## editorial_assignments

Stores editor assignments.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| editor_id | foreignId | References users |
| assigned_by | foreignId | References users |
| role | string | editor or section_editor |
| assigned_at | timestamp |  |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## review_assignments

Stores reviewer assignments.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| reviewer_id | foreignId | References users |
| assigned_by | foreignId | References users |
| status | string | invited, accepted, declined, completed, cancelled |
| due_date | date | Nullable |
| invited_at | timestamp | Nullable |
| responded_at | timestamp | Nullable |
| completed_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## reviews

Stores review results.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| review_assignment_id | foreignId | References review_assignments |
| recommendation | string | accept, minor_revision, major_revision, reject |
| comments_to_editor | text | Nullable |
| comments_to_author | text | Nullable |
| submitted_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## editorial_decisions

Stores editorial decisions.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| editor_id | foreignId | References users |
| decision | string | accept, reject, request_revision, send_to_review |
| comments | text | Nullable |
| decided_at | timestamp |  |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## issues

Stores journal issues.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| journal_id | foreignId | References journals |
| title | string | Issue title |
| volume | string | Nullable |
| number | string | Nullable |
| year | integer | Publication year |
| description | text | Nullable |
| cover_path | string | Nullable |
| published_at | timestamp | Nullable |
| is_published | boolean | Default false |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## articles

Stores published article records.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| submission_id | foreignId | References submissions |
| journal_id | foreignId | References journals |
| issue_id | foreignId | Nullable, references issues |
| title | string | Article title |
| abstract | text | Article abstract |
| keywords | json | Nullable |
| doi | string | Nullable |
| slug | string | Unique per journal |
| published_at | timestamp | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## article_files

Stores final public article files.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| article_id | foreignId | References articles |
| label | string | Example: PDF |
| file_type | string | pdf, html, xml |
| storage_path | string | File path |
| downloads_count | integer | Default 0 |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## activity_logs

Stores workflow and user activity.

| Column | Type | Notes |
|---|---|---|
| id | bigint | Primary key |
| user_id | foreignId | Nullable |
| journal_id | foreignId | Nullable |
| subject_type | string | Polymorphic type |
| subject_id | bigint | Polymorphic ID |
| action | string | Action name |
| description | text | Nullable |
| metadata | json | Nullable |
| created_at | timestamp |  |
| updated_at | timestamp |  |

## 3. Important Relationships

```text
Journal has many Sections
Journal has many Submissions
Journal has many Issues
Journal has many Articles

Submission belongs to Journal
Submission belongs to Section
Submission belongs to submitting Author
Submission has many Authors
Submission has many Files
Submission has many Review Assignments
Submission has many Editorial Decisions
Submission may become one Article

Issue belongs to Journal
Issue has many Articles

Article belongs to Journal
Article belongs to Issue
Article belongs to Submission
Article has many Article Files
```

## 4. Indexing Recommendations

Add indexes for:

- journals.slug
- submissions.status
- submissions.current_stage
- submissions.journal_id
- submissions.submitting_author_id
- review_assignments.reviewer_id
- review_assignments.status
- articles.slug
- articles.journal_id
- articles.issue_id
- issues.journal_id
- issues.is_published

## 5. Laravel Packages

Recommended packages:

- spatie/laravel-permission
- spatie/laravel-activitylog
- laravel/scout
- meilisearch/meilisearch-php
