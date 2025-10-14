# Video Affiliate App

A Next.js 14 application for video analysis, AI content generation, and automated Facebook posting.

## 🚀 Deployment on Vercel

### Prerequisites
- Vercel account
- Supabase project
- AI API keys (OpenAI, Anthropic, Google)
- Social media API keys (Facebook, YouTube, TikTok)

### Environment Variables Required

Copy `env.example` to `.env.local` and fill in your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Social Media API Keys
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
YOUTUBE_API_KEY=your_youtube_api_key
TIKTOK_API_KEY=your_tiktok_api_key

# Webhook Configuration
WEBHOOK_URL=your_make_com_webhook_url
CRON_SECRET=your_cron_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Features
- ✅ Schedule Creation & Management
- ✅ Automated Facebook Posting
- ✅ AI Content Generation
- ✅ Video Analysis
- ✅ Admin Panel with RBAC
- ✅ Real-time Status Updates
- ✅ Cron Job Automation

### Tech Stack
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + Radix UI
- Supabase (Database + Auth)
- AI Providers (OpenAI, Claude, Gemini)
- Social APIs (Facebook, YouTube, TikTok)

### Deployment Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy and test

### Cron Jobs
- **Vercel Cron**: Daily at 9 AM (Hobby plan limitation)
- **GitHub Actions**: Every 5 minutes (Free alternative)
- **Manual Trigger**: `/api/manual-cron` endpoint
- Automated Facebook posting
- Status updates and notifications

### Cron Job Solutions
Due to Vercel Hobby plan limitations (1 cron per day), we provide multiple solutions:

1. **GitHub Actions** (Recommended - Free)
   - Runs every 5 minutes
   - Triggers `/api/manual-cron` endpoint
   - Requires `CRON_SECRET` and `VERCEL_APP_URL` in GitHub Secrets

2. **External Cron Service** (Free alternatives)
   - cron-job.org
   - EasyCron
   - Cron-job.net

3. **Manual Trigger**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/manual-cron
   ```
