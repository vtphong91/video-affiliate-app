# AI Settings Module Setup Guide

## 🎯 Overview

The AI Settings Module provides a comprehensive admin interface to manage AI providers with:
- ✅ Real-time provider status monitoring
- ✅ API key configuration detection
- ✅ Provider testing functionality
- ✅ Enable/disable providers
- ✅ Usage statistics tracking
- ✅ Performance metrics
- ✅ Cost tracking

---

## 📊 Database Setup

### Step 1: Run SQL Migration

Execute the SQL file in your Supabase SQL Editor:

```bash
# File: sql/create-ai-settings-table.sql
```

Or run it directly in Supabase Dashboard:
1. Go to https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy contents of `sql/create-ai-settings-table.sql`
3. Paste and click "Run"

This will create:
- `ai_provider_settings` table
- `ai_provider_status` view
- Default provider entries (Gemini, Groq, Mistral, OpenAI, Claude)
- Indexes for performance
- Triggers for auto-update timestamps

### Step 2: Verify Tables Created

Run this query to verify:

```sql
SELECT * FROM ai_provider_settings ORDER BY priority_order;
```

You should see 5 providers with default configuration.

---

## 🔧 API Endpoints

The module creates these endpoints:

### 1. **GET /api/admin/ai-settings**
Get all AI provider settings and statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [...],
    "summary": {
      "total": 5,
      "enabled": 3,
      "configured": 2,
      "free": 2,
      "cheap": 1,
      "paid": 2
    }
  }
}
```

### 2. **PUT /api/admin/ai-settings**
Update provider settings (enable/disable, priority, etc.)

**Request:**
```json
{
  "provider_name": "groq",
  "updates": {
    "is_enabled": true,
    "priority_order": 2
  }
}
```

### 3. **POST /api/admin/ai-settings/test**
Test provider connection with a simple prompt

**Request:**
```json
{
  "provider_name": "groq"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider_name": "groq",
    "status": "success",
    "response_time_ms": 1234,
    "test_result": {
      "summary_length": 150,
      "pros_count": 3,
      "cons_count": 2
    }
  },
  "message": "✅ groq is working correctly! Response time: 1234ms"
}
```

---

## 🖥️ UI Access

### Admin Panel Location

Navigate to: **http://localhost:3000/admin/ai-settings**

### Features

1. **Provider Overview Cards**
   - Display name and type (FREE/CHEAP/PAID)
   - Enable/Disable toggle
   - API key configuration status
   - Priority order

2. **Provider Details**
   - Cost per million tokens
   - Speed (tokens/second)
   - Average response time
   - Context window size

3. **Statistics Dashboard**
   - Total requests
   - Success rate percentage
   - Tokens used
   - Total cost
   - Last success/failure timestamps

4. **Test Functionality**
   - One-click provider testing
   - Real-time test results
   - Error message display

5. **Summary Cards**
   - Total providers count
   - API keys configured
   - Provider type breakdown

---

## 🚀 Quick Start

### 1. Run Database Migration

```sql
-- Execute sql/create-ai-settings-table.sql in Supabase
```

### 2. Configure API Keys

Edit `.env.local`:

```env
# Already configured
GOOGLE_AI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_nRZ4vo5b...
OPENAI_API_KEY=sk-proj-...

# Add these for full coverage
MISTRAL_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### 3. Restart Server

```bash
npm run dev
```

### 4. Access UI

Visit: http://localhost:3000/admin/ai-settings

### 5. Test Providers

Click "Test" button on each configured provider to verify connection.

---

## 📊 Screenshot Preview

### Main Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ AI Provider Settings                        [Refresh]   │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│ │ Total: 5 │ │ Config:2 │ │ 🆓2 💰1 │                │
│ └──────────┘ └──────────┘ └──────────┘                │
├─────────────────────────────────────────────────────────┤
│ Google Gemini Flash  [🆓 FREE] [✓ Enabled] [Test][Off] │
│ Priority: #1 | Cost: FREE | Speed: 250 tok/s           │
│ Requests: 45 | Success: 95.6% | Cost: $0.00            │
├─────────────────────────────────────────────────────────┤
│ Groq LLaMA 3.3 70B   [🆓 FREE] [✓ Enabled] [Test][Off] │
│ Priority: #2 | Cost: FREE | Speed: 800 tok/s           │
│ Requests: 12 | Success: 100% | Cost: $0.00             │
├─────────────────────────────────────────────────────────┤
│ Mistral Large 2     [💰 CHEAP] [❌ No API Key]         │
│ Priority: #3 | Cost: $2/1M | Speed: 200 tok/s          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Monitoring & Analytics

### Provider Status Indicators

- **✓ Enabled** (Green) - Provider is active
- **❌ Disabled** (Gray) - Provider is turned off
- **⚠️ No API Key** (Red) - API key not configured

### Performance Metrics

The system tracks:
- **Total Requests** - Number of times provider was called
- **Success Rate** - Percentage of successful requests
- **Avg Response Time** - Average time in milliseconds
- **Tokens Used** - Total tokens consumed
- **Total Cost** - Accumulated cost (for paid providers)

### Cost Tracking

For paid providers (OpenAI, Claude, Mistral):
- Automatic cost calculation based on tokens used
- Real-time cost accumulation
- Cost per million tokens display

---

## 🛠️ Troubleshooting

### Issue: "No API Key" Badge Shows

**Solution:**
1. Add API key to `.env.local`
2. Restart server: `npm run dev`
3. Refresh AI Settings page
4. API key status should update automatically

### Issue: Test Button Fails

**Possible Causes:**
- API key is invalid or expired
- Provider service is down
- Network connectivity issues
- Rate limit exceeded

**Solution:**
1. Check API key validity in provider console
2. Verify internet connection
3. Wait a few minutes if rate limited
4. Check error message for details

### Issue: Provider Not Showing

**Solution:**
1. Run database migration again
2. Check if table `ai_provider_settings` exists
3. Verify provider entry exists:
   ```sql
   SELECT * FROM ai_provider_settings WHERE provider_name = 'groq';
   ```

---

## 📈 Usage Statistics

### Automatic Tracking

The system automatically tracks when you use `analyzeVideo()`:
- Increments request counters
- Records success/failure
- Calculates average response time
- Updates last success/failure timestamps
- Accumulates token usage and costs

### Manual Reset

To reset statistics:

```sql
UPDATE ai_provider_settings
SET
  total_requests = 0,
  successful_requests = 0,
  failed_requests = 0,
  total_tokens_used = 0,
  total_cost = 0
WHERE provider_name = 'provider_name_here';
```

---

## 🎨 Customization

### Add New Provider

1. **Add to Database:**
```sql
INSERT INTO ai_provider_settings (
  provider_name,
  display_name,
  provider_type,
  priority_order,
  cost_per_million_tokens,
  tokens_per_second
) VALUES (
  'custom_provider',
  'My Custom Provider',
  'paid',
  6,
  5.00,
  300
);
```

2. **Add to Code:**
```typescript
// lib/ai/custom-provider.ts
export async function analyzeVideoWithCustomProvider(videoInfo: VideoInfo) {
  // Implementation
}

// lib/ai/index.ts
import { analyzeVideoWithCustomProvider } from './custom-provider';

// Add to AIProvider type
type AIProvider = 'custom_provider' | ...

// Add to switch statement
case 'custom_provider':
  result = await analyzeVideoWithCustomProvider(videoInfo);
  break;
```

3. **Add API Key Check:**
```typescript
// app/api/admin/ai-settings/route.ts
const keyMap: Record<string, string> = {
  'custom_provider': 'CUSTOM_PROVIDER_API_KEY',
  // ...
};
```

### Change Priority Order

Via UI:
- Database will be updated automatically in future version

Via SQL:
```sql
UPDATE ai_provider_settings
SET priority_order = 1
WHERE provider_name = 'groq';
```

---

## 🔐 Security Notes

- ✅ API keys are stored in `.env.local` (NOT in database)
- ✅ UI only shows if key is configured (not the actual key)
- ✅ Admin-only access (add auth middleware if needed)
- ✅ Test endpoint validates provider before testing

---

## 📝 Future Enhancements

Planned features:
- [ ] Drag-and-drop priority ordering
- [ ] Real-time usage charts
- [ ] Cost alerts and limits
- [ ] Automatic provider health checks
- [ ] Usage export (CSV/JSON)
- [ ] Provider performance comparison
- [ ] A/B testing framework

---

## 💡 Best Practices

1. **Always test providers** after configuration
2. **Monitor success rates** regularly
3. **Set up FREE providers first** (Gemini, Groq)
4. **Enable paid providers** only when needed
5. **Check costs** weekly for paid providers
6. **Disable unused providers** to simplify fallback chain

---

## 🤝 Support

**Questions?**
- Check logs in browser console
- Check server logs for API errors
- Verify Supabase tables exist
- Ensure API keys are valid

**Need help?**
- Read full documentation: [AI_PROVIDERS.md](./AI_PROVIDERS.md)
- Quick start: [AI_PROVIDERS_QUICKSTART.md](./AI_PROVIDERS_QUICKSTART.md)

---

**Built with ❤️ for easy AI provider management**
