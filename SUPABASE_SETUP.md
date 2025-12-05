# Supabase Setup Guide

## Step 1: Run Database Schema in Supabase

1. Go to your Supabase project: https://rewzlvxvqtsgjcdrcevy.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `backend/migrations/supabase-schema.sql`
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** to execute the schema

## Step 2: Verify Tables Created

1. Click on **Table Editor** in the left sidebar
2. You should see the following tables:
   - `profiles`
   - `jobs`
   - `applications`
   - `saved_jobs`

## Step 3: Get Service Role Key

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. Scroll down to **Project API keys**
4. Copy the **service_role** key (NOT the anon key)
5. **IMPORTANT**: Keep this key secret! Never commit it to git.

## Step 4: Update Backend Environment Variables

1. Open `backend/.env` file (create if it doesn't exist)
2. Add the following (replace `YOUR_SERVICE_ROLE_KEY` with the key from Step 3):

```env
SUPABASE_URL=https://rewzlvxvqtsgjcdrcevy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld3psdnh2cXRzZ2pjZHJjZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzMyMDksImV4cCI6MjA4MDQwOTIwOX0.wi2FsZm_PqlMBaERcDKKCeEY2mhNngWQABPDGBI5saM
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,https://job-portal-beige-ten.vercel.app

# Keep these for now (legacy database still running)
DATABASE_URL=your_current_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

## Step 5: Update Frontend Environment Variables

1. Open `frontend/.env` file (create if it doesn't exist)
2. Add the following:

```env
VITE_SUPABASE_URL=https://rewzlvxvqtsgjcdrcevy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJld3psdnh2cXRzZ2pjZHJjZXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzMyMDksImV4cCI6MjA4MDQwOTIwOX0.wi2FsZm_PqlMBaERcDKKCeEY2mhNngWQABPDGBI5saM
VITE_API_URL=http://localhost:5000/api
```

## Step 6: Install Dependencies

Run these commands in separate terminals:

### Backend:
```bash
cd backend
npm install
```

### Frontend:
```bash
cd frontend
npm install
```

## Step 7: Restart Development Servers

After installing dependencies, restart both servers:

### Backend:
```bash
cd backend
npm run dev
```

### Frontend:
```bash
cd frontend
npm run dev
```

## Next Steps

Once you've completed these steps, I'll proceed with:
1. Migrating the authentication controller to use Supabase Auth
2. Updating the auth middleware
3. Migrating all database controllers
4. Updating the frontend auth service

---

**Note**: Your current system will continue running. We're building the Supabase integration alongside it.
