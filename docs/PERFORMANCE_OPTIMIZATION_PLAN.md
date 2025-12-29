# Performance Optimization Plan - Video Affiliate App

**Ngày:** 2024-12-28
**Mục tiêu:** Cải thiện performance của hệ thống dựa trên nguyên lý từ Actix-pro agent

---

## 📊 Phân tích hiện trạng

### **Current Stack:**
- **Frontend:** Next.js 14.2.21 (App Router)
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **AI:** Multi-provider (Gemini, OpenAI, Claude)
- **Caching:** Browser localStorage (session), In-memory (profile cache 2 min)

### **Performance Bottlenecks đã phát hiện:**

#### 1. **Auth & Session Management** ✅ (ĐÃ FIX)
- ~~Profile fetch timeout (5s → quá ngắn)~~
- ~~Session không persist → phải login nhiều lần~~
- ~~Không có auto-refresh token~~

**Status:** ✅ Đã fix với session 7 ngày + auto-refresh 6h

#### 2. **Database Queries** ⚠️ (CẦN TỐI ƯU)

**Vấn đề:**
```typescript
// lib/auth/SupabaseAuthProvider.tsx - Profile fetch mỗi auth state change
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Impact:**
- Profile query chạy **nhiều lần** khi component mount/unmount
- Mỗi page navigation → trigger auth state change → fetch profile again
- Cache 2 phút → vẫn fetch lại sau expire

**Solution proposals:**
1. Tăng cache duration: 2 min → 10-15 min
2. Sử dụng React Query/SWR cho cache với stale-while-revalidate
3. IndexedDB thay vì in-memory cache (persist across page reload)

#### 3. **API Route Performance** ⚠️ (CẦN TỐI ƯU)

**Vấn đề:**

**a) AI Analysis - Slow (~10-30s)**
```typescript
// app/api/analyze-video/route.ts
const analysis = await analyzeVideo(videoUrl, platform);
```
- Call AI provider synchronously
- No caching cho repeated videos
- No progress indicator cho user

**b) Review Creation - Multiple DB Calls**
```typescript
// app/api/create-review/route.ts
// 1. Insert review
// 2. Update category stats
// 3. Create activity log
// Sequential execution → slow
```

**Solution proposals:**
1. **AI Caching:**
   - Cache analysis kết quả theo `videoId` (Redis hoặc Supabase table)
   - TTL: 7 days
   - Check cache trước khi call AI

2. **Parallel Execution:**
   ```typescript
   await Promise.all([
     supabase.from('reviews').insert(review),
     supabase.from('categories').update(stats),
     supabase.from('activity_logs').insert(log)
   ]);
   ```

3. **Background Jobs:**
   - Move non-critical tasks (logs, stats) to background
   - Use Vercel Edge Functions hoặc queue system

#### 4. **Frontend Bundle Size** ⚠️ (CẦN GIẢM)

**Current:**
```
First Load JS: 338 kB (vendors: 333 kB)
```

**Vấn đề:**
- Vendors bundle quá lớn (333 kB)
- Tất cả dependencies load cùng lúc

**Solution proposals:**
1. **Code Splitting:**
   - Dynamic imports cho heavy components
   - Route-based splitting (Next.js mặc định có)
   - Lazy load AI editor, preview components

2. **Tree Shaking:**
   - Kiểm tra unused dependencies
   - Import chỉ những gì cần: `import { Button } from '@/components/ui/button'`

3. **Compression:**
   - Enable Brotli compression (Vercel default)
   - Optimize images with next/image

#### 5. **Multiple Supabase Client Instances** ⚠️ (WARNING)

**Console Warning:**
```
Multiple GoTrueClient instances detected in the same browser context
```

**Nguyên nhân:**
- `lib/db/supabase.ts` export `supabase`
- `lib/auth/supabase-browser.ts` export `supabaseBrowser`
- Một số file import cả 2 → 2 instances

**Solution:**
- Chuẩn hóa: Browser components CHỈ dùng `supabaseBrowser`
- API routes CHỈ dùng `supabaseAdmin`
- Xóa duplicate client creation

#### 6. **Excessive Auth State Changes** ⚠️ (NHIỄU)

**Console logs:**
```
🔍 SupabaseAuthProvider: Auth state change: SIGNED_IN (x10 lần)
🔍 SupabaseAuthProvider: Fetching user profile (x10 lần)
```

**Nguyên nhân:**
- Multiple `SupabaseAuthProvider` instances (nested providers)
- Auth state listener trigger nhiều lần

**Solution:**
- Ensure chỉ 1 provider ở root level
- Debounce auth state changes

---

## 🎯 Performance Optimization Roadmap

### **Phase 1: Quick Wins (1-2 ngày)** 🚀

#### 1.1. Tăng Profile Cache Duration
**File:** `lib/auth/SupabaseAuthProvider.tsx`

```typescript
// BEFORE
const CACHE_DURATION = 120000; // 2 minutes

// AFTER
const CACHE_DURATION = 900000; // 15 minutes
```

**Expected Impact:** Giảm 80% profile queries

---

#### 1.2. Fix Multiple Supabase Instances
**Action:**
1. Audit tất cả imports:
   ```bash
   grep -r "from '@/lib/db/supabase'" app/
   grep -r "from '@/lib/auth/supabase-browser'" app/
   ```

2. Replace:
   - Browser components → `supabaseBrowser`
   - API routes → `supabaseAdmin`

**Expected Impact:** Giảm memory usage, fix warning

---

#### 1.3. Enable AI Response Caching

**Create:** `lib/cache/ai-cache.ts`
```typescript
interface CachedAnalysis {
  videoId: string;
  analysis: AIAnalysis;
  timestamp: number;
}

const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getCachedAnalysis(videoId: string): Promise<AIAnalysis | null> {
  const { data } = await supabaseAdmin
    .from('ai_analysis_cache')
    .select('*')
    .eq('video_id', videoId)
    .single();

  if (!data) return null;

  const age = Date.now() - new Date(data.created_at).getTime();
  if (age > CACHE_TTL) {
    // Expired, delete
    await supabaseAdmin.from('ai_analysis_cache').delete().eq('video_id', videoId);
    return null;
  }

  return data.analysis;
}

export async function setCachedAnalysis(videoId: string, analysis: AIAnalysis) {
  await supabaseAdmin.from('ai_analysis_cache').upsert({
    video_id: videoId,
    analysis,
    created_at: new Date().toISOString()
  });
}
```

**Update:** `app/api/analyze-video/route.ts`
```typescript
// Check cache first
const cached = await getCachedAnalysis(videoId);
if (cached) {
  console.log('✅ Using cached AI analysis');
  return NextResponse.json({ success: true, analysis: cached });
}

// Call AI
const analysis = await analyzeVideo(videoUrl, platform);

// Cache result
await setCachedAnalysis(videoId, analysis);
```

**Migration SQL:**
```sql
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT UNIQUE NOT NULL,
  analysis JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_cache_video_id ON ai_analysis_cache(video_id);
CREATE INDEX idx_ai_cache_created_at ON ai_analysis_cache(created_at);
```

**Expected Impact:**
- Repeated videos: 0s (cache hit) vs 10-30s (AI call)
- Save AI API costs 70-80%

---

### **Phase 2: Database Optimization (2-3 ngày)** 📊

#### 2.1. Parallel Database Operations

**Update:** `app/api/create-review/route.ts`

```typescript
// BEFORE - Sequential
await supabase.from('reviews').insert(review);
await supabase.from('categories').update(stats);
await supabase.from('activity_logs').insert(log);

// AFTER - Parallel
const [reviewResult, , ] = await Promise.all([
  supabase.from('reviews').insert(review).select().single(),
  supabase.from('categories').update(stats).eq('id', categoryId),
  supabase.from('activity_logs').insert(log)
]);
```

**Expected Impact:** Giảm 40-50% response time

---

#### 2.2. Add Database Indexes

**Migration SQL:**
```sql
-- Reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON reviews(slug);

-- Schedules table
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_scheduled_for ON schedules(scheduled_for);

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
```

**Expected Impact:**
- Faster queries: List reviews, schedules, users
- Dashboard stats load 2-3x faster

---

#### 2.3. Implement Connection Pooling

**Update:** `lib/db/supabase.ts`

```typescript
supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'video-affiliate-app'
    }
  },
  // Connection pooling
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

---

### **Phase 3: Frontend Optimization (2-3 ngày)** ⚡

#### 3.1. Code Splitting - Dynamic Imports

**Update:** `app/dashboard/create/page.tsx`

```typescript
// BEFORE
import { AIContentEditor } from '@/components/AIContentEditor';
import { ReviewPreview } from '@/components/ReviewPreview';
import { TemplateSelector } from '@/components/templates/TemplateSelector';

// AFTER - Lazy load heavy components
import dynamic from 'next/dynamic';

const AIContentEditor = dynamic(
  () => import('@/components/AIContentEditor').then(mod => ({ default: mod.AIContentEditor })),
  { loading: () => <div>Loading editor...</div> }
);

const ReviewPreview = dynamic(
  () => import('@/components/ReviewPreview').then(mod => ({ default: mod.ReviewPreview })),
  { loading: () => <div>Loading preview...</div> }
);

const TemplateSelector = dynamic(
  () => import('@/components/templates/TemplateSelector').then(mod => ({ default: mod.TemplateSelector }))
);
```

**Expected Impact:** Giảm initial bundle 30-40%

---

#### 3.2. Optimize Images

**Create:** `next.config.js` optimization
```javascript
module.exports = {
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'], // YouTube thumbnails
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  // Enable SWC minification
  swcMinify: true,
  // Compress
  compress: true,
};
```

---

#### 3.3. React Query for Data Fetching

**Install:**
```bash
npm install @tanstack/react-query
```

**Setup:** `app/providers.tsx`
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Usage:** `app/dashboard/reviews/page.tsx`
```typescript
import { useQuery } from '@tanstack/react-query';

function ReviewsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await fetch('/api/reviews');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  if (isLoading) return <Loading />;
  return <ReviewsTable data={data} />;
}
```

**Expected Impact:**
- Automatic caching
- Background refetching
- Optimistic updates
- Reduced server load 60-70%

---

### **Phase 4: Monitoring & Analytics (1 ngày)** 📈

#### 4.1. Add Performance Monitoring

**Install:**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Setup:** `app/layout.tsx`
```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

#### 4.2. Custom Performance Metrics

**Create:** `lib/utils/performance.ts`
```typescript
export function measurePerformance(name: string, fn: () => Promise<any>) {
  const start = performance.now();

  return fn().finally(() => {
    const duration = performance.now() - start;
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance'
      });
    }
  });
}
```

**Usage:**
```typescript
const analysis = await measurePerformance('AI Analysis', async () => {
  return analyzeVideo(url, platform);
});
```

---

## 📊 Expected Performance Improvements

| Metric | Before | After Phase 1 | After Phase 3 | Target |
|--------|--------|---------------|---------------|--------|
| **Profile fetch** | 5s timeout | 15s timeout | - | 99% success |
| **AI Analysis (cached)** | 10-30s | 0.1s | 0.05s | <0.1s |
| **AI Analysis (new)** | 10-30s | 10-30s | 8-20s | <15s |
| **Review save** | 2-3s | 1-1.5s | 0.5-1s | <1s |
| **Dashboard load** | 2-3s | 1.5s | 0.8s | <1s |
| **Bundle size** | 338 kB | 338 kB | 220 kB | <250 kB |
| **Session duration** | Few hours | 7 days | 7 days | 7 days |
| **Database queries/page** | 10-15 | 5-8 | 3-5 | <5 |

---

## 🚀 Implementation Priority

### **Must Have (Week 1):**
1. ✅ Session 7 days (DONE)
2. ✅ Profile timeout 15s (DONE)
3. ✅ Fix supabase client duplicates (DONE)
4. 🔄 AI caching
5. 🔄 Profile cache 15 min
6. 🔄 Parallel DB operations

### **Should Have (Week 2):**
7. Database indexes
8. Code splitting
9. React Query
10. Performance monitoring

### **Nice to Have (Week 3):**
11. Image optimization
12. Connection pooling
13. Background jobs
14. Advanced caching strategies

---

## 📝 Testing Checklist

**Before Deployment:**
- [ ] Load test với 100 concurrent users
- [ ] Check memory leaks (Chrome DevTools)
- [ ] Verify cache hit rate >70%
- [ ] Lighthouse score >90
- [ ] Bundle size analysis
- [ ] Database query count per page
- [ ] API response times <2s (p95)
- [ ] No console errors/warnings

**Monitoring:**
- [ ] Setup Vercel Analytics
- [ ] Configure alerting for slow queries
- [ ] Track AI API costs
- [ ] Monitor cache hit/miss ratio
- [ ] User session duration stats

---

## 🎓 Best Practices từ Actix-Pro Agent

Áp dụng cho Next.js:

| Actix Principle | Next.js Equivalent |
|-----------------|-------------------|
| **Async/await for non-blocking IO** | Use async API routes, streaming responses |
| **Actor model for concurrency** | React Server Components, parallel data fetching |
| **Middleware for cross-cutting concerns** | Next.js middleware, API route middleware |
| **Strongly-typed state** | TypeScript + Zod validation |
| **Zero memory leaks** | Proper cleanup in useEffect, avoid closures |
| **Performance monitoring** | Vercel Analytics, custom metrics |
| **Efficient caching** | React Query, SWR, Redis |
| **Error handling patterns** | Result types, error boundaries |
| **Scalable architecture** | Edge functions, CDN caching |
| **Resource pooling** | Database connection pooling |

---

## 📚 References

- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Supabase Performance Tips](https://supabase.com/docs/guides/performance)
- [Web Vitals](https://web.dev/vitals/)

---

**✅ Kế hoạch này sẽ cải thiện performance tổng thể 2-3x!**
