# OpenLJS Features

This document describes the features required to build OpenLJS, starting from MVP features and expanding toward a full journal publishing platform.

## 1. MVP Features

### 1.1 Authentication

- User registration
- Login and logout
- Password reset
- Email verification
- User profile management

### 1.2 Role and Permission Management

- Super Admin role
- Journal Manager role
- Editor role
- Section Editor role
- Author role
- Reviewer role
- Reader role
- Role assignment per journal
- Permission-based access control

### 1.3 Journal Management

- Create journal
- Edit journal information
- Configure journal title and description
- Configure journal sections
- Configure author guidelines
- Configure review policy
- Upload journal logo
- Enable or disable submissions

### 1.4 Author Submission

- Start new submission
- Upload manuscript file
- Enter title and abstract
- Add keywords
- Add co-authors
- Select journal section
- Confirm submission checklist
- Submit manuscript
- Track submission status

### 1.5 Submission Management

- View all submissions
- Filter by status
- View submission metadata
- View submission files
- View submission activity log
- Assign editor
- Change submission status

### 1.6 Editorial Workflow

- Initial screening
- Assign editor or section editor
- Send submission to review
- Request revision
- Accept submission
- Reject submission
- Move accepted submission to copyediting

### 1.7 Peer Review

- Assign reviewer
- Send reviewer invitation
- Reviewer accepts or declines invitation
- Reviewer downloads review file
- Reviewer submits recommendation
- Reviewer submits comments to editor
- Reviewer submits comments to author
- Editor views submitted reviews

### 1.8 Revision Management

- Editor requests revision
- Author uploads revised manuscript
- Submission file versioning
- Editor reviews revision
- Submission can return to review or move forward

### 1.9 Issue Management

- Create issue
- Set volume and number
- Set issue title
- Set publication date
- Add articles to issue
- Publish issue
- Archive past issues

### 1.10 Article Publishing

- Create article record from accepted submission
- Edit article metadata
- Upload final PDF galley
- Assign article to issue
- Publish article page
- Public PDF download

### 1.11 Notifications

- Submission confirmation email
- Editor assignment notification
- Reviewer invitation email
- Review reminder notification
- Revision request notification
- Acceptance notification
- Rejection notification
- Article publication notification

### 1.12 Public Website

- Journal homepage
- Current issue page
- Archives page
- Article page
- About page
- Editorial team page
- Author guidelines page

## 2. Intermediate Features

### 2.1 Advanced Review

- Multiple review rounds
- Double-blind review
- Reviewer deadline tracking
- Review reminders
- Custom review forms
- Reviewer rating by editor

### 2.2 Copyediting

- Assign copyeditor
- Upload copyedited file
- Author copyediting approval
- Copyediting comments

### 2.3 Production

- Assign production editor
- Upload galley files
- PDF, HTML, and XML galley support
- Proofreading workflow
- Final approval before publication

### 2.4 Email Template Management

- Editable email templates
- Template variables
- Per-journal email customization

### 2.5 Search

- Search articles
- Search authors
- Search issues
- Filter by keyword
- Filter by section
- Filter by publication date

### 2.6 Activity Logs

- Track user actions
- Track workflow transitions
- Track file uploads
- Track editorial decisions

## 3. Advanced Features

### 3.1 DOI Support

- Store DOI per article
- DOI metadata preparation
- Crossref export
- DOI display on article page

### 3.2 ORCID Support

- Store author ORCID
- Display ORCID on article pages
- Optional ORCID authentication later

### 3.3 Indexing and Metadata

- OAI-PMH endpoint
- Dublin Core metadata
- Crossref metadata export
- Google Scholar-friendly article pages

### 3.4 Metrics

- Article views
- PDF downloads
- Issue views
- Author article count
- Reviewer performance metrics

### 3.5 Payments

- Article processing charge support
- Payment status tracking
- Invoice generation
- Payment gateway plugin support

### 3.6 Multi-language Support

- Translatable public pages
- Translatable email templates
- Multiple locale support

### 3.7 Plugin System

- Installable plugins
- Plugin settings
- Plugin hooks
- Custom metadata plugins
- Payment plugins
- Export plugins

## 4. Future Features

- AI-assisted abstract checking
- Plagiarism checker integration
- Citation generator
- Reference parser
- Reviewer recommendation system
- Public article comments
- Editorial analytics dashboard
- Institutional repository export
- Mobile-friendly reviewer interface
