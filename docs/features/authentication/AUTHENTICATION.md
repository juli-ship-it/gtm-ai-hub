# Authentication Setup

This document explains the authentication system implemented for the GTM AI Hub, including company-specific user restrictions and role-based access control.

## Overview

The authentication system provides two main approaches for user management:

1. **Company Domain Restriction** - Only allow signups from specific email domains
2. **Admin-Created Users Only** - Disable public signup and only allow users created via Supabase dashboard

## Features

- ✅ Email/password authentication via Supabase Auth
- ✅ Company domain validation for signups
- ✅ Automatic user profile creation
- ✅ Role-based access control (admin, editor, runner)
- ✅ Protected routes and middleware
- ✅ User profile management
- ✅ Session management and persistence

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Authentication Settings
NEXT_PUBLIC_RESTRICT_TO_DOMAINS=true
NEXT_PUBLIC_ALLOWED_DOMAINS=yourcompany.com,partner.com
```

### Supabase Configuration

1. **Enable Email Authentication** in your Supabase dashboard:
   - Go to Authentication > Settings
   - Enable "Enable email confirmations"
   - Configure your email templates

2. **Configure Domain Restrictions** (Optional):
   - Set `NEXT_PUBLIC_RESTRICT_TO_DOMAINS=true`
   - Add allowed domains to `NEXT_PUBLIC_ALLOWED_DOMAINS`

3. **Disable Public Signup** (Optional):
   - Go to Authentication > Settings
   - Set "Enable signup" to false
   - Users must be created via Supabase dashboard or admin panel

## Database Schema

The authentication system uses these tables:

### `app_user` table
- `id` - References `auth.users.id`
- `email` - User's email address
- `role` - User role (admin, editor, runner)
- `company_domain` - Extracted from email domain
- `created_at` - Account creation timestamp

### Automatic User Creation

When a user signs up through Supabase Auth, a trigger automatically creates an `app_user` record:

```sql
-- Trigger creates app_user record when auth.users is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Usage

### Authentication Context

Use the `useAuth` hook to access authentication state:

```tsx
import { useAuth } from '@/lib/auth/context'

function MyComponent() {
  const { user, appUser, signIn, signOut, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <p>Role: {appUser?.role}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

Wrap components that require authentication:

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin only content</div>
    </ProtectedRoute>
  )
}
```

### Role-Based Access

The system supports three roles:

- **admin** - Full access to all features and user management
- **editor** - Can create and modify templates, prompts, and playbooks
- **runner** - Can execute templates and view their own data

## Authentication Flow

### Sign Up Process

1. User visits `/auth/signup`
2. Enters email and password
3. System validates email domain (if restrictions enabled)
4. Supabase creates auth user
5. Database trigger creates `app_user` record
6. User receives confirmation email
7. User clicks confirmation link
8. User is redirected to login

### Sign In Process

1. User visits `/auth/login`
2. Enters credentials
3. Supabase validates credentials
4. User is redirected to `/app` dashboard

### Protected Route Access

1. User navigates to protected route
2. Middleware checks authentication status
3. If not authenticated, redirects to login
4. If authenticated, checks role requirements
5. If role insufficient, shows access denied
6. If role sufficient, renders content

## Security Features

### Row Level Security (RLS)

All database tables have RLS policies:

- Users can only read their own data
- Admins can read all data
- Role-based permissions for different operations

### Domain Validation

When `NEXT_PUBLIC_RESTRICT_TO_DOMAINS=true`:

- Signup form validates email domain
- Only emails from allowed domains can register
- Server-side validation prevents bypassing

### Session Management

- JWT tokens with configurable expiry
- Automatic token refresh
- Secure session storage
- Logout clears all session data

## Customization

### Adding New Roles

1. Update the role type in `types/database.ts`:
```typescript
role: 'admin' | 'editor' | 'runner' | 'new_role'
```

2. Update RLS policies in `supabase/migrations/002_rls_policies.sql`

3. Update role validation in `components/auth/protected-route.tsx`

### Custom Domain Validation

Modify the signup validation in `lib/auth/context.tsx`:

```typescript
const validateDomain = (email: string) => {
  // Add custom validation logic
  const domain = email.split('@')[1]
  return customValidationFunction(domain)
}
```

### Email Templates

Customize Supabase email templates in the dashboard:
- Confirmation emails
- Password reset emails
- Magic link emails

## Troubleshooting

### Common Issues

1. **Users can't sign up**
   - Check domain restrictions in environment variables
   - Verify Supabase signup is enabled
   - Check email confirmation settings

2. **Users can't access protected routes**
   - Verify middleware is properly configured
   - Check RLS policies
   - Ensure user has correct role

3. **App user not created**
   - Check database trigger is installed
   - Verify trigger function permissions
   - Check Supabase logs for errors

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will log authentication events to the console.

## Migration Guide

If you're upgrading from a system without authentication:

1. Run the database migrations:
```bash
supabase db push
```

2. Update your environment variables
3. Test the authentication flow
4. Update any existing components to use the auth context
5. Add protected route wrappers where needed

## Best Practices

1. **Always use the auth context** instead of directly accessing Supabase auth
2. **Protect sensitive routes** with the ProtectedRoute component
3. **Validate permissions** on both client and server side
4. **Use role-based access** instead of hardcoded user checks
5. **Regularly audit** user permissions and access patterns
6. **Monitor authentication logs** for suspicious activity
