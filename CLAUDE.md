# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video Affiliate App is a Next.js 14 application that analyzes videos from multiple platforms (YouTube, TikTok), generates AI-powered product reviews, and automatically posts them to Facebook on a scheduled basis. It features robust authentication with RBAC, timezone-aware scheduling, and multi-AI provider integration.

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start Next.js dev server on http://localhost:3000

# Production
npm run build                  # Build for production (runs TypeScript checking)
npm start                      # Start production server

# Code Quality
npm run lint                   # Run ESLint

# Utility Scripts
npm run check-supabase         # Verify Supabase connection and configuration
npm run check-email            # Verify email configuration
npm run delete-users           # Clean up test users (use with caution)
```

### Testing & Debugging
```powershell
# PowerShell scripts for testing deployed app
./test-cron.ps1               # Test cron job execution
./test-manual-cron.ps1        # Test manual cron trigger endpoint
./test-timezone.js            # Test timezone conversion logic
./test-timezone-fix.js        # Validate timezone fixes
./test-after-redeploy.ps1     # Full system test after deployment
```

## Architecture Overview

### Application Structure

**Next.js App Router Layout:**
- `/app/api/*` - API routes (31 endpoints across modules)
- `/app/dashboard/*` - Authenticated user dashboard pages
- `/app/admin/*` - Admin-only pages with RBAC enforcement
- `/app/auth/*` - Authentication pages (login, register, callback)
- `/components/*` - Reusable React components
- `/lib/*` - Core business logic and utilities

### Key Architectural Patterns

**1. Timezone Handling (CRITICAL)**

The app operates in GMT+7 (Asia/Ho_Chi_Minh) timezone. All user-facing times are in GMT+7, but database stores UTC.

- **Database**: All timestamp columns use PostgreSQL `TIMESTAMPTZ` (stores UTC internally)
- **Conversion Flow**: User Input (GMT+7) → UTC (database) → GMT+7 (display)
- **Utilities**: Use `lib/utils/timezone-utils.ts` for ALL datetime operations:
  - `createTimestampFromDatePicker(date, time)` - Convert user input to UTC for database
  - `parseTimestampFromDatabase(isoString)` - Convert UTC from database to GMT+7
  - `formatTimestampForDisplay(isoString)` - Format timestamps for UI display
  - `calculateTimeRemaining(scheduledForIso)` - Calculate countdown in GMT+7

**Critical Rule**: NEVER manually manipulate dates/times. Always use timezone-utils functions to prevent off-by-7-hours bugs.

**2. Database Layer Architecture**

File: `lib/db/supabase.ts`

- Exports two clients:
  - `supabase` - Client-side authenticated operations (uses anon key + user session)
  - `supabaseAdmin` - Server-side operations with elevated privileges (uses service role key)
- Pattern: Use `supabaseAdmin` in API routes for reliable server-side queries
- All database operations exported via `db` object with typed methods
- Special handling: `getPendingSchedules()` filters in JavaScript to work with any timestamp format during migrations

**3. AI Provider Integration**

File: `lib/ai/index.ts`

Multi-provider system with automatic fallback:
1. **Primary**: Google Gemini (free tier, `gemini-pro`)
2. **Fallback 1**: OpenAI (`gpt-4-turbo-preview`)
3. **Fallback 2**: Anthropic Claude (`claude-3-sonnet`)

Each provider implements:
- `analyzeVideo(url)` - Extract video metadata and analyze content
- `generateReview(videoData)` - Create structured review content
- Prompts centralized in `lib/ai/prompts.ts`

**4. Authentication & Authorization (RBAC)**

Files: `lib/auth/**/*.ts`

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Custom RBAC with three roles:
  - `admin` - Full system access
  - `editor` - Create/edit content, manage schedules
  - `viewer` - Read-only access
- **Middleware**:
  - `lib/auth/middleware/auth-middleware.ts` - Verify authentication
  - `lib/auth/middleware/rbac-middleware.ts` - Check permissions
  - `lib/auth/middleware/role-middleware.ts` - Role-based access
- **User Approval Flow**: New registrations require admin approval before access

**5. Automated Scheduling System**

Files: `lib/services/cron-service.ts`, `.github/workflows/cron.yml`

- **Cron Execution**: GitHub Actions runs every 5 minutes (free alternative to Vercel's 1/day limit on Hobby plan)
- **Process Flow**:
  1. GitHub Action triggers `/api/manual-cron` endpoint
  2. Endpoint calls `processPendingSchedules()` from `cron-service.ts`
  3. Fetches pending schedules where `scheduled_for <= NOW()` (UTC comparison)
  4. For each due schedule:
     - Updates status to 'processing'
     - Sends webhook to Make.com for Facebook posting
     - Logs attempt in `webhook_logs` table
     - Updates schedule status based on webhook response
  5. Handles retries (max 3) with exponential backoff

**Webhook Integration**: Make.com receives schedule data and posts to Facebook via their API (keeps tokens secure outside codebase)

### Module Breakdown

**Schedules Module** (`app/api/schedules/**`, `components/schedules/**`)
- Create, read, update, delete scheduled posts
- Timezone-aware scheduling with GMT+7 input/display
- Retry mechanism for failed posts
- Status tracking: pending → processing → posted/failed

**Reviews Module** (`app/api/reviews/**`, `app/dashboard/reviews/**`)
- CRUD operations for product reviews
- AI-generated content from video analysis
- Fields: title, summary, pros/cons, target_audience, seo_keywords, affiliate_links
- Public slugs for SEO-friendly URLs

**Admin Module** (`app/api/admin/**`, `app/admin/**`)
- User management with approval/rejection workflow
- Role assignment and permission management
- Activity logging for audit trail
- Member management dashboard

**Categories Module** (`app/api/categories/**`)
- Product category management
- Used for organizing reviews

## Critical Implementation Details

### Database Migrations

Recent timezone migration (2025-10-15): Converted `schedules` table columns to TIMESTAMPTZ.

Migration file: `sql/migrate-scheduled-for-to-timestamptz-simple.sql`

**Columns affected:**
- `scheduled_for` - When post should be published
- `posted_at` - When post was actually published
- `next_retry_at` - When to retry failed posts

**Post-migration behavior:**
- App sends UTC ISO strings to database
- PostgreSQL stores as UTC internally
- Queries use `scheduled_for <= NOW()` for UTC comparison
- Display converts to GMT+7 using timezone-utils

### Environment Variables

Required for deployment (see `env.example`):

**Supabase (Database & Auth):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

**AI Providers:**
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_AI_API_KEY`

**Social Media:**
- `FACEBOOK_ACCESS_TOKEN` (optional - can use Make.com webhook instead)
- `YOUTUBE_API_KEY`
- `TIKTOK_API_KEY`

**Automation:**
- `WEBHOOK_URL` - Make.com webhook for Facebook posting
- `CRON_SECRET` - Secure token for cron endpoint authentication
- `NEXT_PUBLIC_APP_URL` - Deployed app URL

**GitHub Secrets (for Actions):**
- `CRON_SECRET` - Same as above
- `VERCEL_APP_URL` - Production deployment URL

## Common Development Workflows

### Adding a New API Endpoint

1. Create route file in `app/api/[module]/route.ts`
2. Use error-handler utility: `lib/utils/error-handler.ts`
3. Authenticate requests: `getUserIdFromRequest(request)` from `lib/auth/helpers/auth-helpers.ts`
4. For admin endpoints: Check permissions with RBAC middleware
5. Return responses: `NextResponse.json(data, { status: 200 })`

### Modifying Schedule Logic

**IMPORTANT**: When changing schedule creation/editing:
1. Always use `createTimestampFromDatePicker()` or `createTimestampFromDateTimeLocal()` to convert user input to UTC
2. Always use `parseTimestampFromDatabase()` when reading scheduled_for for editing
3. Test with `test-timezone-fix.js` to verify conversions
4. Remember: User sees GMT+7, database stores UTC

### Working with AI Providers

Primary provider (Gemini) is free but has rate limits. Fallback logic is automatic - don't bypass it.

To add a new provider:
1. Create provider file in `lib/ai/[provider].ts`
2. Implement interface from `lib/ai/index.ts`
3. Add to provider list in `lib/ai/index.ts` with priority order
4. Add API key to environment variables

### Debugging Cron Issues

Tools available:
- `/api/cron/debug-schedules` - Returns current pending schedules and system state
- `/api/cron/check-schedules` - Vercel cron endpoint (runs daily at 9 AM)
- `/api/manual-cron` - Trigger cron manually (requires `CRON_SECRET` header)
- GitHub Actions logs - Check `.github/workflows/cron.yml` execution history

Common issues:
- **Schedule not triggering**: Check `scheduled_for` is in UTC and <= current UTC time
- **Webhook failing**: Verify `WEBHOOK_URL` and Make.com scenario is active
- **Timezone mismatch**: User sees GMT+7 but schedule triggers 7 hours early/late → Use timezone-utils

## TypeScript & Code Standards

- **Strict mode enabled**: All types must be properly defined
- **Type definitions**: Centralized in `types/index.ts`
- **Zod validation**: Use for runtime type checking (already installed)
- **Component pattern**: Prefer Server Components, use `'use client'` only when necessary
- **Error handling**: Always use try-catch in async functions, log errors with context

## Testing After Changes

**Before committing major changes:**
1. Run `npm run build` to catch TypeScript errors
2. Test locally with `npm run dev`
3. If modifying schedules: Run `node test-timezone-fix.js`
4. If modifying cron: Use `./test-manual-cron.ps1` on deployed version
5. Check Vercel deployment logs for runtime errors

**After deploying:**
- Use `./test-after-redeploy.ps1` for comprehensive validation
- Monitor GitHub Actions for cron execution
- Check Supabase logs for database errors

## Production Deployment

Deployed on Vercel with automatic deployments from `master` branch.

**Vercel Configuration** (`vercel.json`):
- Cron job: Daily at 9 AM (Hobby plan limitation)
- Function timeouts:
  - Cron endpoints: 60s
  - AI analysis: 120s
  - Facebook posting: 30s

**GitHub Actions** (`.github/workflows/cron.yml`):
- Primary cron mechanism (every 5 minutes)
- Provides more frequent schedule processing than Vercel's daily limit
- Requires `CRON_SECRET` and `VERCEL_APP_URL` in repository secrets

## Known Issues & TODOs

**Completed:**
- ✅ Timezone handling for schedules (fixed 2025-10-15)
- ✅ Database TIMESTAMPTZ migration
- ✅ GitHub Actions cron setup

**Pending (Low Priority):**
- Email notifications for user approval/rejection (TODOs in `app/api/admin/users/[id]/approve` and `reject`)
- Password reset functionality (UI exists, backend TODO in `components/auth/forms/ForgotPasswordForm.tsx`)
- Profile update implementation (TODO in `lib/auth/hooks/useUser.ts`)
- Rate limiting on API routes
- API documentation (OpenAPI/Swagger)

## Documentation References

- `README.md` - Deployment guide and feature list
- `MODULE_ANALYSIS_REPORT.md` - Comprehensive system analysis (2025-10-15)
- `TIMEZONE_FIX_SUMMARY.md` - Detailed timezone fix documentation
- `MIGRATION_GUIDE.md` - Database migration instructions
- `.cursorrules` - Code style and standards for AI assistants
