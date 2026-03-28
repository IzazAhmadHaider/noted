# Authentication Setup Guide

## Required Database Changes

You need to make these changes in your Supabase dashboard to enable authentication:

### 1. Enable Supabase Auth
- Go to your Supabase dashboard
- Navigate to **Authentication** → **Providers**
- Make sure **Email** provider is enabled (it usually is by default)

### 2. Add `user_id` Column to `pages` Table

In your Supabase SQL Editor, run:

```sql
-- Add user_id column to pages table
ALTER TABLE pages ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid();

-- Add foreign key constraint
ALTER TABLE pages ADD CONSTRAINT pages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX pages_user_id_idx ON pages(user_id);
```

### 3. Enable Row Level Security (RLS)

This ensures each user can only see/edit their own pages.

In your SQL Editor:

```sql
-- Enable RLS on pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can select only their own pages
CREATE POLICY "Users can select their own pages"
ON pages FOR SELECT
USING (auth.uid() = user_id);

-- Create policy: Users can insert only their own pages
CREATE POLICY "Users can insert their own pages"
ON pages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update only their own pages
CREATE POLICY "Users can update their own pages"
ON pages FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete only their own pages
CREATE POLICY "Users can delete their own pages"
ON pages FOR DELETE
USING (auth.uid() = user_id);
```

## What This Does

✅ **Authentication**: Users must sign up and log in
✅ **Data Isolation**: Each user only sees their own pages
✅ **Security**: Database enforces user isolation with RLS
✅ **Sign Out**: Users can sign out from the top-right corner

## Testing

1. Sign up with: `test1@example.com` / `password123`
2. Create a few pages
3. Sign out
4. Sign up with: `test2@example.com` / `password456`
5. Verify test2 has no pages (isolated from test1)
6. Each user's pages are completely separate!

## Features Added

- **Login/Sign Up Page**: `/login` route
- **Sign Out Button**: Top-right corner of editor
- **User Email Display**: Shows current logged-in user email
- **Auto Redirect**: Unauthenticated users redirected to login
- **User-Isolated Pages**: Pages filtered by `user_id` in database
