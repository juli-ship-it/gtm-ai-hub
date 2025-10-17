# Intake Request Permissions

This document outlines the updated permission structure for intake requests in the GTM AI Hub.

## Overview

The intake request system now has granular permissions that ensure:
1. **Only juliana.reyes@workleap.com can modify administrative fields** (status, priority, category, etc.)
2. **Requesters can only edit content fields** of their own requests
3. **Anyone can add comments** to intake requests

## Permission Structure

### Reading Intake Requests
- ✅ **All authenticated users** can read all intake requests
- ✅ **No restrictions** on viewing intake request data

### Creating Intake Requests
- ✅ **Any authenticated user** can create intake requests
- ✅ **Requester field** is automatically set to the current user

### Updating Intake Requests

#### Administrative Fields (Restricted to juliana.reyes@workleap.com)
- `status` - Request status (new, triaged, building, shipped, declined)
- `priority` - Request priority (low, medium, high, urgent)
- `category` - Request category (mkt_*, sales_*, etc.)
- `frequency` - Process frequency (daily, weekly, monthly, adhoc)
- `sensitivity` - Data sensitivity level (low, med, high)

#### Content Fields (Editable by Requesters)
- `title` - Request title
- `problem_statement` - Description of the problem
- `automation_idea` - Proposed automation solution
- `current_process` - Current manual process description
- `pain_points` - Specific pain points
- `time_friendly` - Time estimate for current process
- `systems` - Array of systems used
- `links` - Relevant links or documentation
- `ethics_considerations` - Governance considerations

### Comments
- ✅ **All authenticated users** can read all comments
- ✅ **All authenticated users** can create comments
- ✅ **Only comment authors** can update/delete their own comments

## Implementation Details

### Database Triggers
A PostgreSQL trigger (`intake_request_content_field_check`) enforces the field-level restrictions:

```sql
CREATE TRIGGER intake_request_content_field_check
  BEFORE UPDATE ON intake_request
  FOR EACH ROW
  EXECUTE FUNCTION is_content_field_update();
```

### Row Level Security (RLS) Policies
The system uses Supabase RLS policies to control access:

1. **Read Policy**: All authenticated users can read all requests
2. **Create Policy**: Users can create requests (requester field set automatically)
3. **Update Policy**: 
   - juliana.reyes@workleap.com can update any field
   - Requesters can update their own requests (field restrictions enforced by trigger)

### Error Handling
When a non-authorized user tries to update administrative fields, they receive:
```
Only juliana.reyes@workleap.com can modify administrative fields (status, priority, category, frequency, sensitivity)
```

## Testing

Use the provided test script to verify permissions:

```bash
node test_intake_permissions.js
```

The test script will:
1. Test reading intake requests
2. Test creating new requests
3. Test updating content fields
4. Test that administrative field updates are blocked
5. Test comment creation
6. Clean up test data

## Migration

To apply these changes, run the migration:

```sql
-- Apply the migration
\i supabase/migrations/025_intake_request_permissions.sql
```

## User Management

### Adding juliana.reyes@workleap.com
If juliana.reyes@workleap.com doesn't exist in the system:

1. **Via Supabase Dashboard**:
   - Go to Authentication > Users
   - Add user with email: juliana.reyes@workleap.com
   - Set role to 'admin' in the app_user table

2. **Via SQL**:
   ```sql
   -- First create auth user (this would typically be done through Supabase Auth)
   -- Then ensure app_user record exists
   INSERT INTO app_user (id, email, role)
   VALUES ('juliana-user-uuid', 'juliana.reyes@workleap.com', 'admin')
   ON CONFLICT (email) DO UPDATE SET role = 'admin';
   ```

## Security Considerations

1. **Email-based permissions**: The system relies on email addresses for special permissions. Ensure email addresses are verified and secure.

2. **Trigger enforcement**: Field-level restrictions are enforced at the database level, making them difficult to bypass.

3. **Audit trail**: All updates are logged with timestamps and user information.

4. **Service role bypass**: The service role can still update any field (for system operations), but this should be used carefully.

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**:
   - Check if the user is authenticated
   - Verify the user exists in the app_user table
   - Ensure RLS policies are properly applied

2. **"Administrative fields" errors**:
   - Only juliana.reyes@workleap.com can modify status, priority, category, frequency, sensitivity
   - Other users can only modify content fields

3. **Comment creation fails**:
   - Ensure the user is authenticated
   - Check that the intake_request_id exists
   - Verify the author_id matches the authenticated user

### Debug Queries

```sql
-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('intake_request', 'intake_comment');

-- Check if juliana.reyes@workleap.com exists
SELECT id, email, role FROM app_user WHERE email = 'juliana.reyes@workleap.com';

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'intake_request_content_field_check';
```

## Future Enhancements

1. **Role-based permissions**: Instead of email-based, consider using a dedicated role system
2. **Field-level audit**: Track which specific fields were changed and by whom
3. **Approval workflows**: Add approval processes for certain field changes
4. **Bulk operations**: Support for bulk updates with proper permission checks
