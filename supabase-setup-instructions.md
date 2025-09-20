# Supabase Setup Instructions for Mentor3D

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization: **Ideas Organisation**
4. Project Name: **mentor3d**
5. Database Password: Create a strong password
6. Region: Choose closest to your location
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Go to Project Settings → API
2. Copy these values to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 3: Set Up Database Schema

### Option A: Using Supabase Dashboard

1. Go to SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into a new query
4. Click "Run" to execute

### Option B: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run the schema:
```bash
supabase db reset --db-url "your-database-url"
```

## Step 4: Configure Authentication

1. Go to Authentication → Settings
2. Site URL: `http://localhost:3000` (for development)
3. Redirect URLs: Add `http://localhost:3000/auth/callback`
4. Enable Email authentication
5. Optional: Configure OAuth providers (Google, GitHub, etc.)

## Step 5: Set Up Storage (Optional)

1. Go to Storage
2. Create a new bucket called `avatars`
3. Make it public for user profile pictures
4. Create another bucket called `course-materials` for course content

## Step 6: Verify Setup

1. Go to Table Editor
2. You should see all these tables:
   - profiles
   - courses
   - lessons
   - user_progress
   - assessments
   - submissions
   - chat_history
   - learning_analytics
   - course_enrollments
   - achievements

## Step 7: Test Connection

1. Update your `.env.local` with the actual values
2. Restart your development server:
```bash
npm run dev
```

3. The application should now connect to Supabase successfully

## Database Schema Overview

### Core Tables:
- **profiles**: User information extending auth.users
- **courses**: AI-generated courses with tags and content
- **lessons**: Individual lesson content within courses
- **user_progress**: Track student progress through lessons
- **assessments**: Quizzes, coding challenges, and projects
- **submissions**: Student code submissions and grading
- **chat_history**: AI Professor Q&A interactions
- **learning_analytics**: Track engagement and learning patterns
- **course_enrollments**: Manage course access and completion
- **achievements**: Badges and rewards system

### Security Features:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Public courses are viewable by all users
- Proper foreign key constraints and data validation

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check your URL and keys in `.env.local`
2. **RLS Policies**: Make sure you're authenticated when testing
3. **CORS Issues**: Add your domain to allowed origins in Supabase settings
4. **Migration Errors**: Drop and recreate tables if needed during development

### Useful Supabase Commands:

```sql
-- Check if user is authenticated
SELECT auth.uid();

-- View current user profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Reset a table (be careful!)
TRUNCATE TABLE table_name CASCADE;
```

## Next Steps

1. Test user registration and login
2. Create a sample course with the course generation API
3. Test the 3D AI Professor chat functionality
4. Implement the assessment submission system
5. Set up the progress tracking dashboard

Your Mentor3D platform is now ready for development! 🚀
