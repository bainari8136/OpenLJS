# OpenLJS Design

OpenLJS should feel like a modern academic publishing system: clean, organized, role-aware, and workflow-focused.

## 1. Design Principles

- Simple and professional interface
- Clear workflow visibility
- Low cognitive load for editors, authors, and reviewers
- Dashboard-first experience
- Mobile-friendly public pages
- Accessible forms and readable typography
- Consistent status labels and action buttons

## 2. User Experience Goals

OpenLJS should help each user quickly answer:

- What do I need to do?
- Which submissions need attention?
- What stage is this manuscript in?
- What files are available?
- What decision was made?
- What is the next action?

## 3. Main User Areas

### Public Journal Website

Used by readers, authors, and visitors.

Pages:

- Journal homepage
- Current issue
- Archives
- Article details
- Article PDF/download page
- About journal
- Editorial team
- Author guidelines
- Submission information

### Author Dashboard

Used by authors to submit and track manuscripts.

Pages:

- My submissions
- New submission
- Submission details
- Revision upload
- Messages and decisions

### Reviewer Dashboard

Used by reviewers to accept review invitations and submit reviews.

Pages:

- Review invitations
- Active reviews
- Completed reviews
- Review form
- Review file download

### Editor Dashboard

Used by editors and section editors.

Pages:

- Editorial queue
- Unassigned submissions
- Submissions under review
- Reviews awaiting decision
- Accepted submissions
- Rejected submissions
- Production queue

### Journal Manager Dashboard

Used by journal managers.

Pages:

- Journal settings
- Sections
- Users and roles
- Review forms
- Email templates
- Issue management

### Super Admin Dashboard

Used by system administrators.

Pages:

- All journals
- Create journal
- System users
- System settings
- Global roles and permissions
- Logs and maintenance

## 4. Navigation Design

### Public Navigation

```text
Home | Current Issue | Archives | About | Editorial Team | Submit Article
```

### Dashboard Navigation

```text
Dashboard
Submissions
Reviews
Issues
Articles
Users
Settings
```

Navigation should change based on user role.

## 5. Dashboard Design

Each dashboard should use cards and tables.

Example editor dashboard cards:

```text
Pending Initial Check: 8
Under Review: 14
Reviews Overdue: 3
Awaiting Decision: 5
Accepted: 4
In Production: 6
```

## 6. Submission Detail Page Design

The submission detail page is the most important screen.

Recommended layout:

```text
[Title]
[Status Badge] [Current Stage]

Tabs:
- Summary
- Files
- Review
- Editorial Decision
- Copyediting
- Production
- Activity Log
```

### Summary Tab

Shows:

- Title
- Abstract
- Authors
- Keywords
- Section
- Submission date
- Current status

### Files Tab

Shows:

- Uploaded manuscript files
- Review files
- Revision files
- Production files
- Galley files

### Review Tab

Shows:

- Assigned reviewers
- Invitation status
- Review deadline
- Review recommendation
- Review comments

### Editorial Decision Tab

Shows:

- Accept
- Reject
- Request revision
- Send to review
- Assign editor

### Activity Log Tab

Shows all important actions.

Example:

```text
Author submitted manuscript
Editor assigned submission
Reviewer invited
Reviewer accepted invitation
Review submitted
Editor requested revision
```

## 7. Status Badge Design

Use consistent status labels.

Examples:

```text
Draft
Submitted
Initial Check
Under Review
Revision Required
Accepted
Rejected
Copyediting
Production
Published
```

## 8. Form Design

Forms should be split into steps where needed.

### New Submission Form

Steps:

1. Start
2. Upload manuscript
3. Enter metadata
4. Add contributors
5. Confirm and submit

## 9. Article Page Design

A public article page should include:

- Article title
- Author names
- Abstract
- Keywords
- DOI if available
- Published date
- Issue information
- PDF download button
- Citation formats
- Metrics if available

## 10. Issue Page Design

An issue page should include:

- Journal name
- Issue title
- Volume and number
- Publication date
- Cover image if available
- Table of contents
- Article list grouped by section

## 11. Visual Style

Recommended style:

- Clean academic layout
- White or light gray background
- Strong typography hierarchy
- Minimal shadows
- Clear buttons
- Professional color palette

Suggested colors:

```text
Primary: Deep blue
Secondary: Slate gray
Success: Green
Warning: Amber
Danger: Red
Background: Light gray
Text: Dark slate
```

## 12. Component System

Reusable UI components:

- StatusBadge
- SubmissionTable
- WorkflowTimeline
- FileUploadCard
- UserRoleBadge
- ReviewerCard
- DecisionPanel
- IssueCard
- ArticleCard
- MetadataForm
- ActivityLog
- DashboardStatCard

## 13. Accessibility

OpenLJS should support:

- Keyboard navigation
- Clear focus states
- Proper color contrast
- Form labels
- Error messages
- Screen-reader-friendly structure

## 14. Responsive Design

Public pages should work well on mobile.

Dashboard pages should be optimized for desktop but still usable on tablets.
