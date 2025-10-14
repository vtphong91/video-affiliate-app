# External Cron Service for Vercel Hobby Plan

## Problem
Vercel Hobby plan only allows 1 cron job per day, but we need to process schedules every 5 minutes.

## Solutions

### Solution 1: Use External Cron Service
Use services like:
- **cron-job.org** (Free)
- **EasyCron** (Free tier)
- **Cron-job.net** (Free)
- **GitHub Actions** (Free)

### Solution 2: Manual Trigger API
Use the `/api/manual-cron` endpoint with external cron service:

```bash
# Example with cron-job.org
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/manual-cron
```

### Solution 3: Upgrade to Vercel Pro
- $20/month
- Unlimited cron jobs
- More function execution time
- Better performance

## Recommended Setup

### Using cron-job.org (Free)
1. Go to https://cron-job.org
2. Create account
3. Add new cron job:
   - **URL**: `https://your-app.vercel.app/api/manual-cron`
   - **Method**: POST
   - **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Timeout**: 60 seconds

### Using GitHub Actions (Free)
Create `.github/workflows/cron.yml`:

```yaml
name: Process Schedules
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  process-schedules:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/manual-cron
```

## Current Configuration
- **Vercel Cron**: `0 9 * * *` (9 AM daily)
- **Manual Trigger**: `/api/manual-cron` (with auth)
- **External Service**: Recommended for frequent triggers
