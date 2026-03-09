# Supabase Setup Guide for Bowling Pro Manager

Follow these steps to set up your Supabase backend with Google OAuth.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the details:
   - **Name**: Bowling Pro Manager (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**
6. Wait for the project to finish setting up (~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under Project Settings
3. You'll see two important values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public** key: A long string starting with `eyJ...`
4. **IMPORTANT**: Copy these values - you'll need them later!

## Step 3: Run Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase-schema.sql` in this repository
4. Copy the entire contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** button
7. You should see "Success. No rows returned" - this is normal!
8. Your database tables are now created

## Step 4: Set Up Google OAuth

### 4A: Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name: "Bowling Pro Manager"
   - Add your email as support email
   - Click **Save and Continue** through the rest
6. For Application type, choose **Web application**
7. Name it: "Bowling Pro Manager"
8. Under **Authorized redirect URIs**, add:
   ```
   https://[your-project-id].supabase.co/auth/v1/callback
   ```
   Replace `[your-project-id]` with your actual Supabase project ID from Step 2
9. Click **"Create"**
10. **SAVE** these credentials:
    - **Client ID**: Something like `123456789-abc...apps.googleusercontent.com`
    - **Client Secret**: Something like `GOCSPX-abc123...`

### 4B: Configure Supabase

1. In your Supabase project, go to **Authentication** in the left sidebar
2. Click **Providers**
3. Find **Google** in the list and click to expand it
4. Toggle **"Enable Sign in with Google"** to ON
5. Paste your Google OAuth credentials:
   - **Client ID** (from 4A step 10)
   - **Client Secret** (from 4A step 10)
6. Click **"Save"**

## Step 5: Add Development Redirect URL (for local testing)

1. Go back to **Google Cloud Console > Credentials**
2. Click on your OAuth client ID
3. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:5173/auth/v1/callback
   ```
4. Click **"Save"**

## Step 6: Create Environment Variables File

1. In your Bowling Pro Manager project folder, create a file called `.env.local`
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your actual credentials:
   ```env
   VITE_SUPABASE_URL=https://[your-project-id].supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ[your-actual-anon-key]
   ```
4. Save the file
5. **IMPORTANT**: Never commit `.env.local` to git! (It's already in `.gitignore`)

## Step 7: Verify Setup

You can verify your database setup in Supabase:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `users`
   - `organization`
   - `players`
   - `leagues`
   - `seasons`
   - `teams`
   - `games`
   - `allowed_emails`

## Next Steps

Once you've completed all the steps above, you're ready to get started:

- Supabase project created
- Database schema deployed
- Google OAuth configured
- Environment variables set

## Troubleshooting

### "Invalid redirect URI" error
- Make sure you added the correct redirect URIs in Google Cloud Console
- Format should be: `https://[project-id].supabase.co/auth/v1/callback`
- No trailing slash!

### Can't see tables in Table Editor
- Make sure you ran the entire `supabase-schema.sql` file
- Check for error messages in the SQL Editor
- Try running the schema again

### Environment variables not working
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
- Restart your dev server after creating/modifying `.env.local`
- Variables must start with `VITE_` to be accessible in React

### First user not becoming admin
- Check the `handle_new_user()` trigger was created successfully
- Verify in SQL Editor: `SELECT * FROM public.users;` should show user with role='admin'
