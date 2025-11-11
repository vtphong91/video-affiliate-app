# TikTok Integration - Quick Setup Guide 🚀

**Status**: ✅ Implemented - Ready to use with RapidAPI key

---

## 🎯 Current State

TikTok integration is now **ready to use** but requires RapidAPI key for real data.

**Without API key**:
- ⚠️ Returns placeholder data
- Title: "TikTok Video (API Key Required)"
- No real metadata

**With API key** (recommended):
- ✅ Real video metadata
- ✅ Title, description, thumbnail
- ✅ Author info, view count
- ✅ Fast & reliable

---

## 🚀 Setup in 10 Minutes

### Step 1: Sign Up for RapidAPI (3 min)

1. Go to: **https://rapidapi.com/**
2. Click **"Sign Up"**
3. Use GitHub, Google, or email
4. Confirm email

### Step 2: Subscribe to TikTok API (3 min)

1. Search: **"TikTok Video No Watermark"**
2. Select: **"TikTok Video No Watermark2"** by QuanDev
3. Click **"Subscribe to Test"**
4. Choose plan:
   - **FREE**: 100 requests/month (good for testing)
   - **Basic**: $10/month = 10,000 requests (recommended)
5. Click **"Subscribe"**

### Step 3: Get API Key (1 min)

1. After subscribing, go to **"Endpoints"** tab
2. Look for **"X-RapidAPI-Key"** in code snippet
3. Copy your API key (starts with random characters)

### Step 4: Add to Environment (2 min)

**Create or edit `.env` file** in project root:

```env
# Add this line:
RAPIDAPI_KEY=paste_your_api_key_here
```

**Example**:
```env
RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Step 5: Restart Server (1 min)

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

**DONE!** TikTok integration now working! ✅

---

## 🧪 How to Test

### Test 1: Via UI

1. Navigate to: **`/dashboard/create`**
2. Paste TikTok URL:
   ```
   https://www.tiktok.com/@username/video/7123456789012345678
   ```
3. Click: **"Phân tích video"**
4. Should see **REAL data** (not placeholder)

### Test 2: Check Console Logs

With API key configured, you should see:
```
🎯 Fetching TikTok video via RapidAPI...
✅ TikTok video fetched successfully
```

Without API key:
```
⚠️ RAPIDAPI_KEY not configured. TikTok videos will return placeholder data.
💡 To enable real TikTok data: Add RAPIDAPI_KEY to .env
```

---

## 💰 Pricing & Plans

### RapidAPI Pricing

| Plan | Cost | Requests | Best For |
|------|------|----------|----------|
| **FREE** | $0/month | 100/month | Testing, low usage |
| **Basic** | $10/month | 10,000/month | Production (recommended) |
| **Pro** | $50/month | 100,000/month | High volume |

### Usage Estimation

**100 videos/month** → FREE tier ✅
**500 videos/month** → Basic ($10)
**5,000 videos/month** → Pro ($50)

---

## 📊 What Data You Get

### With RapidAPI Key

```json
{
  "platform": "tiktok",
  "videoId": "7123456789012345678",
  "title": "iPhone 15 Pro Max Review",
  "description": "Full review of the new iPhone...",
  "thumbnail": "https://p16-sign.tiktokcdn.com/...",
  "duration": "0:45",
  "channelName": "@techreviewer",
  "channelUrl": "https://www.tiktok.com/@techreviewer",
  "viewCount": 1234567
}
```

### Without API Key (Placeholder)

```json
{
  "platform": "tiktok",
  "videoId": "7123456789012345678",
  "title": "TikTok Video (API Key Required)",
  "description": "Add RAPIDAPI_KEY to .env...",
  "thumbnail": "https://p16-sign.tiktokcdn.com/...",
  "duration": "0:00",
  "channelName": "TikTok User",
  "channelUrl": "",
  "viewCount": 0
}
```

---

## 🔧 Troubleshooting

### Issue 1: Still Getting Placeholder Data

**Solution**:
1. Check `.env` file exists in project root
2. Verify `RAPIDAPI_KEY` is set correctly
3. Restart dev server (`npm run dev`)
4. Clear browser cache

### Issue 2: API Error / 403 Forbidden

**Solution**:
1. Check API key is valid
2. Check subscription is active
3. Check monthly quota not exceeded
4. Verify API endpoint URL is correct

### Issue 3: Slow Response

**Cause**: RapidAPI can be slower than YouTube API (~1-3s vs <1s)

**Solution**: This is normal, wait for response

---

## 🎓 Supported TikTok URL Formats

All these formats work:

```
✅ https://www.tiktok.com/@username/video/7123456789012345678
✅ https://www.tiktok.com/v/7123456789012345678
✅ https://vm.tiktok.com/ZMhKqFe3g/
```

URL parsing works **even without API key**. Only metadata fetching requires key.

---

## 📝 Example Workflow

### User Experience (With API Key)

```
1. User pastes TikTok URL
   ↓
2. System extracts video ID
   ↓
3. Calls RapidAPI to fetch metadata
   ↓
4. Displays real video info (title, author, views)
   ↓
5. AI analyzes video with real data
   ↓
6. Generates high-quality review
```

### User Experience (Without API Key)

```
1. User pastes TikTok URL
   ↓
2. System extracts video ID
   ↓
3. Returns placeholder data
   ↓
4. Shows message: "API Key Required"
   ↓
5. User can still create review (but lower quality)
```

---

## 💡 Tips & Best Practices

### Tip 1: Start with FREE Tier

Start with FREE tier (100 requests/month) to test. Upgrade only when needed.

### Tip 2: Monitor Usage

Check RapidAPI dashboard weekly to monitor:
- Requests used
- Quota remaining
- Error rates

### Tip 3: Cache Results

Consider caching TikTok video metadata to avoid duplicate API calls for same video.

### Tip 4: Handle Errors Gracefully

Code already handles errors:
- RapidAPI down → Falls back to placeholder
- Invalid API key → Falls back to placeholder
- User sees friendly message

---

## 🔐 Security Notes

### Environment Variables

- ✅ **DO**: Store `RAPIDAPI_KEY` in `.env` file
- ❌ **DON'T**: Commit `.env` to git
- ❌ **DON'T**: Share API key publicly
- ✅ **DO**: Add `.env` to `.gitignore` (already done)

### Vercel Deployment

When deploying to Vercel:

1. Go to **Project Settings**
2. Navigate to **Environment Variables**
3. Add:
   - Name: `RAPIDAPI_KEY`
   - Value: `your_api_key_here`
4. Click **Save**
5. Redeploy

---

## 📚 Additional Resources

### RapidAPI
- Dashboard: https://rapidapi.com/developer/dashboard
- Pricing: https://rapidapi.com/pricing
- Support: https://docs.rapidapi.com/

### TikTok API Documentation
- API Endpoint: https://rapidapi.com/yi005/api/tiktok-video-no-watermark2
- Response Schema: See API documentation
- Rate Limits: Based on subscription plan

### Project Documentation
- Full analysis: `TIKTOK_INTEGRATION_ANALYSIS.md`
- Environment setup: `.env.example`

---

## 🎉 Success Checklist

After setup, verify:

- ✅ RapidAPI account created
- ✅ Subscribed to TikTok API
- ✅ API key copied
- ✅ Added to `.env` file
- ✅ Server restarted
- ✅ Tested with real TikTok URL
- ✅ Receiving real metadata (not placeholder)

**All checked?** Congratulations! TikTok integration is working! 🎊

---

## 🆘 Need Help?

1. Check console logs for error messages
2. Review `.env.example` for correct format
3. Verify API key is active in RapidAPI dashboard
4. Read full analysis: `TIKTOK_INTEGRATION_ANALYSIS.md`

---

**Last Updated**: 2025-01-09
**Version**: 1.0
**Status**: Production Ready ✅
