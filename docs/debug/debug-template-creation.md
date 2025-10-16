# Template Creation Debug Guide

## Common Issues and Solutions

### 1. **Database Connection Issues**
- Check if Supabase is running
- Verify environment variables are set
- Check network connectivity

### 2. **Authentication Issues**
- User must be logged in
- Check if `user.id` exists
- Verify RLS policies allow template creation

### 3. **Required Fields Missing**
- `n8n_webhook_url` is required
- `slug` must be unique
- `name` is required

### 4. **RLS (Row Level Security) Policies**
- Check if policies allow INSERT on template table
- Check if policies allow INSERT on template_variable table
- User must have proper permissions

### 5. **Template Variable Table Issues**
- Check if `template_variable` table exists
- Check if foreign key to template exists
- Verify column types match

## Debug Steps

1. **Open Browser Console** and look for errors
2. **Check Network Tab** for failed requests
3. **Verify Database Schema** matches the code
4. **Test with Simple Template** (no variables first)
5. **Check RLS Policies** in Supabase dashboard

## Quick Fixes

### If RLS is blocking:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE template DISABLE ROW LEVEL SECURITY;
ALTER TABLE template_variable DISABLE ROW LEVEL SECURITY;
```

### If missing tables:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('template', 'template_variable');
```

### If authentication issues:
- Make sure user is logged in
- Check if user has proper role
- Verify RLS policies allow the user to insert
