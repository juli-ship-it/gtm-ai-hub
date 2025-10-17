# SQL Scripts

Ad-hoc SQL scripts for database management and debugging.

## Directory Structure

- **`checks/`** - Query scripts to verify database state
- **`fixes/`** - Fix scripts for RLS, foreign keys, and schema issues
- **`migrations/`** - Manual migration scripts (note: prefer `supabase/migrations/` for managed migrations)
- **`utilities/`** - Utility scripts for system users, cleanup, etc.

## Usage

These scripts are meant to be run manually via Supabase SQL Editor or `psql`:

```bash
# Via psql
psql "postgresql://..." < sql/checks/check_tables.sql

# Or copy/paste into Supabase SQL Editor
```

## Note

For production migrations, always use the managed migration system in `supabase/migrations/`.

