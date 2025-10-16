# Intake Detail Page Database Schema

This document outlines the new database tables created to support the comprehensive intake detail page functionality.

## Overview

The intake detail page requires several new tables to support advanced features like activity tracking, assignments, attachments, tagging, and status history. All tables are designed to link back to the existing `intake_request` table and maintain referential integrity.

## New Tables

### 1. `intake_activity_log`
**Purpose**: Tracks all actions and changes made to intake requests for audit and activity feed purposes.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `user_id` → References `app_user(id)` (who performed the action)
- `action_type` → Enum of possible actions (status_changed, priority_changed, assigned, etc.)
- `old_value` / `new_value` → Track what changed
- `description` → Human-readable description of the action
- `metadata` → JSON for additional context

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `app_user`

### 2. `intake_assignment`
**Purpose**: Tracks who is assigned to work on each intake request.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `assigned_to` → References `app_user(id)` (who is assigned)
- `assigned_by` → References `app_user(id)` (who made the assignment)
- `assigned_at` / `unassigned_at` → Track assignment timeline
- `notes` → Optional notes about the assignment

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `app_user` (assigned_to)
- Many-to-one with `app_user` (assigned_by)

### 3. `intake_attachment`
**Purpose**: Stores file attachments and links associated with intake requests.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `uploaded_by` → References `app_user(id)`
- `file_name` → Original filename
- `file_url` → URL to the file (S3, Supabase Storage, etc.)
- `file_type` → MIME type
- `file_size` → File size in bytes
- `attachment_type` → Enum (file, link, image, document)
- `description` → Optional description

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `app_user`

### 4. `intake_tag`
**Purpose**: Custom tags for categorizing intake requests.

**Key Fields**:
- `name` → Tag name (unique)
- `color` → Hex color for UI display
- `description` → Optional description
- `created_by` → References `app_user(id)`

**Relationships**:
- Many-to-one with `app_user` (created_by)

### 5. `intake_request_tag`
**Purpose**: Many-to-many relationship between intake requests and tags.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `tag_id` → References `intake_tag(id)`
- `added_by` → References `app_user(id)`
- `added_at` → When the tag was added

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `intake_tag`
- Many-to-one with `app_user`

### 6. `intake_watcher`
**Purpose**: Users who want to be notified of changes to specific intake requests.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `user_id` → References `app_user(id)`
- `added_at` → When they started watching

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `app_user`

### 7. `intake_status_history`
**Purpose**: Detailed history of status changes for intake requests.

**Key Fields**:
- `intake_request_id` → References `intake_request(id)`
- `from_status` / `to_status` → Status transition
- `changed_by` → References `app_user(id)`
- `reason` → Optional reason for the change
- `created_at` → When the change occurred

**Relationships**:
- Many-to-one with `intake_request`
- Many-to-one with `app_user`

## Existing Tables (Enhanced)

### `intake_request` (Already exists)
The main table that all new tables reference. Enhanced with additional fields from the Slack integration.

### `intake_comment` (Already exists)
Comments on intake requests. Referenced by the activity log when comments are added.

## Database Functions

### `get_intake_request_details(request_id uuid)`
A comprehensive function that returns all related data for an intake request in a single JSON object, including:
- Request details
- Requester information
- Assignments
- Comments
- Attachments
- Tags
- Watchers
- Status history
- Activity log

## Row Level Security (RLS)

All new tables have RLS enabled with policies that ensure users can only access data for intake requests they have permission to view. The policies check:
1. If the user is the requester of the intake request
2. If the user is assigned to the intake request
3. If the user has general access to intake requests (based on existing policies)

## Default Data

The migration includes default tags for common use cases:
- `urgent` - High priority requests
- `bug-fix` - Bug fix requests
- `feature` - New feature requests
- `integration` - System integration requests
- `reporting` - Reporting and analytics requests
- `automation` - General automation requests
- `slack` - Requests submitted via Slack
- `jira` - Requests linked to Jira issues

## Triggers

### `intake_status_change_trigger`
Automatically logs status changes to both `intake_status_history` and `intake_activity_log` tables when the status of an intake request is updated.

## Indexes

Comprehensive indexing strategy for optimal performance:
- Foreign key indexes
- Action type indexes
- Timestamp indexes
- Composite indexes for common queries

## Migration File

The complete schema is defined in `supabase/migrations/012_intake_detail_enhancements.sql` and includes:
- Table creation
- Index creation
- RLS policies
- Triggers
- Functions
- Default data
- Comments and documentation
