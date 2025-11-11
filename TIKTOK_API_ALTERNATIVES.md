# Các Phương Án Lấy API TikTok 🎯

**Tổng quan**: 5 phương án từ dễ đến khó, từ FREE đến trả phí

---

## 📊 So Sánh Nhanh

| Phương Án | Chi Phí | Độ Khó | Độ Ổn Định | Giới Hạn | Khuyến Nghị |
|-----------|---------|---------|------------|----------|-------------|
| **1. RapidAPI** | $0-10/tháng | ⭐ Dễ | ⭐⭐⭐⭐⭐ Cao | 100-10k/tháng | ✅ Best cho production |
| **2. tiktok-scraper** | FREE | ⭐⭐ Trung bình | ⭐⭐⭐ Trung bình | Không giới hạn | ✅ Best cho dev/testing |
| **3. Unofficial APIs** | FREE-$5/tháng | ⭐⭐ Trung bình | ⭐⭐ Thấp | Varies | ⚠️ Rủi ro cao |
| **4. Web Scraping** | FREE | ⭐⭐⭐⭐ Khó | ⭐⭐ Thấp | Depends | ⚠️ Phức tạp |
| **5. Official TikTok API** | FREE | ⭐⭐⭐⭐⭐ Rất khó | ⭐⭐⭐⭐⭐ Cao | High | 🏢 Chỉ cho doanh nghiệp |

---

## 1️⃣ RapidAPI (Đã Implement) ✅

### Ưu Điểm:
- ✅ Setup nhanh (10 phút)
- ✅ Ổn định, reliable
- ✅ Documentation tốt
- ✅ Support nhanh
- ✅ FREE plan có 100 requests/tháng
- ✅ Không lo bị block

### Nhược Điểm:
- ❌ Có giới hạn quota (100/tháng FREE)
- ❌ Cần credit card để verify (ngay cả FREE plan)
- ❌ Phụ thuộc vào third-party

### Giá:
```
FREE:  100 requests/tháng
PRO:   $9.99/tháng = 10,000 requests
ULTRA: $49.99/tháng = 100,000 requests
```

### Hướng Dẫn:
Xem file: `HOW_TO_GET_TIKTOK_API.md`

---

## 2️⃣ NPM Package: tiktok-scraper (MIỄN PHÍ) 🆓

### Tổng Quan:
NPM package miễn phí, không cần API key, scrape trực tiếp từ TikTok

### Ưu Điểm:
- ✅ **HOÀN TOÀN MIỄN PHÍ** - Không giới hạn requests
- ✅ Không cần API key
- ✅ Không cần đăng ký account
- ✅ Cài đặt đơn giản (1 lệnh npm)
- ✅ TypeScript support
- ✅ Nhiều features (video info, user profile, hashtags)

### Nhược Điểm:
- ❌ Độ ổn định thấp hơn (TikTok có thể thay đổi structure)
- ❌ Có thể bị rate limit nếu abuse
- ❌ Chậm hơn official API
- ❌ Vi phạm TikTok ToS (nhưng hiếm khi bị xử lý)

### Setup (5 phút):

**Bước 1: Cài đặt package**
```bash
npm install tiktok-scraper
```

**Bước 2: Import và sử dụng**
```typescript
// lib/apis/tiktok-scraper-method.ts
import TikTokScraper from 'tiktok-scraper';

export async function getTikTokVideoInfoViaScraper(videoId: string) {
  try {
    const videoUrl = `https://www.tiktok.com/@username/video/${videoId}`;

    // Scrape video metadata
    const videoMeta = await TikTokScraper.getVideoMeta(videoUrl);

    return {
      platform: 'tiktok' as const,
      videoId,
      title: videoMeta.collector[0].text || 'TikTok Video',
      description: videoMeta.collector[0].text || '',
      thumbnail: videoMeta.collector[0].covers.default,
      duration: formatDuration(videoMeta.collector[0].videoMeta.duration),
      channelName: `@${videoMeta.collector[0].authorMeta.name}`,
      channelUrl: `https://www.tiktok.com/@${videoMeta.collector[0].authorMeta.name}`,
      viewCount: videoMeta.collector[0].playCount,
    };
  } catch (error) {
    console.error('❌ tiktok-scraper failed:', error);
    throw error;
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

**Bước 3: Tích hợp vào existing code**
```typescript
// lib/apis/tiktok.ts (modify existing)
import TikTokScraper from 'tiktok-scraper';

export async function getTikTokVideoInfo(videoId: string): Promise<VideoInfo> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const USE_SCRAPER = process.env.USE_TIKTOK_SCRAPER === 'true';

  // Priority 1: RapidAPI (if key available)
  if (RAPIDAPI_KEY && !USE_SCRAPER) {
    try {
      console.log('🎯 Fetching TikTok video via RapidAPI...');
      return await getTikTokVideoInfoViaRapidAPI(videoId);
    } catch (error) {
      console.warn('⚠️ RapidAPI failed, trying scraper...');
    }
  }

  // Priority 2: tiktok-scraper (FREE fallback)
  try {
    console.log('🔍 Fetching TikTok video via scraper...');
    return await getTikTokVideoInfoViaScraper(videoId);
  } catch (error) {
    console.error('❌ Scraper also failed:', error);
  }

  // Priority 3: Placeholder data
  return placeholderData;
}
```

**Bước 4: Add env variable (optional)**
```env
# .env
USE_TIKTOK_SCRAPER=true  # Force dùng scraper thay vì RapidAPI
```

### Features Available:

**1. Video Metadata**
```typescript
const videoMeta = await TikTokScraper.getVideoMeta(url);
// Returns: video info, author info, stats, etc.
```

**2. User Profile**
```typescript
const userProfile = await TikTokScraper.getUserProfileInfo('username');
// Returns: follower count, bio, avatar, etc.
```

**3. Hashtag Videos**
```typescript
const hashtag = await TikTokScraper.hashtag('fitness', { number: 10 });
// Returns: top 10 videos with #fitness
```

**4. Trending Videos**
```typescript
const trending = await TikTokScraper.trend('', { number: 20 });
// Returns: 20 trending videos
```

### Giới Hạn:
```
- Không có hard limit về requests
- Rate limit tự nhiên: ~5-10 requests/giây
- Nếu vượt quá → TikTok có thể block IP tạm thời (1-2 giờ)
- Khuyến nghị: Add delay 500ms-1s giữa các requests
```

### Độ Ổn Định:
```
✅ Package được maintain actively (GitHub stars: 1.5k+)
⚠️ TikTok thay đổi structure → Cần update package
📦 Last update: Thường xuyên (check npm page)
```

### Testing:

**Test Script** (`test-tiktok-scraper.ts`):
```typescript
import TikTokScraper from 'tiktok-scraper';

async function testScraper() {
  const testUrl = 'https://www.tiktok.com/@username/video/7123456789';

  console.log('🧪 Testing tiktok-scraper...');

  try {
    const result = await TikTokScraper.getVideoMeta(testUrl);
    console.log('✅ Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

testScraper();
```

**Run test**:
```bash
npx tsx test-tiktok-scraper.ts
```

### Links:
- NPM: https://www.npmjs.com/package/tiktok-scraper
- GitHub: https://github.com/drawrowfly/tiktok-scraper
- Documentation: https://github.com/drawrowfly/tiktok-scraper#readme

---

## 3️⃣ Unofficial APIs (RapidAPI Alternatives)

### 3.1. ScraperAPI + TikTok

**Tổng quan**: Service proxy giúp bypass rate limits

**Setup**:
```bash
# 1. Sign up: https://www.scraperapi.com/
# 2. Get API key
# 3. Use with TikTok URLs

curl "http://api.scraperapi.com?api_key=YOUR_KEY&url=https://www.tiktok.com/@user/video/123"
```

**Giá**:
```
FREE: 1,000 requests/month
HOBBY: $29/month = 50,000 requests
BUSINESS: $99/month = 250,000 requests
```

**Ưu điểm**:
- ✅ Bypass IP blocks
- ✅ Rotate proxies tự động
- ✅ Handle CAPTCHAs

**Nhược điểm**:
- ❌ Đắt hơn RapidAPI
- ❌ Chậm hơn (vì qua proxy)

---

### 3.2. Apify TikTok Scraper

**Tổng quan**: Cloud scraping service chuyên về TikTok

**Setup**:
```bash
# 1. Sign up: https://apify.com/
# 2. Find "TikTok Scraper" actor
# 3. Run via API

curl https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/runs \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startUrls": [{"url": "https://www.tiktok.com/@user/video/123"}]}'
```

**Giá**:
```
FREE: $5 credits (≈ 500 scrapes)
PERSONAL: $49/month
TEAM: $499/month
```

**Ưu điểm**:
- ✅ Infrastructure sẵn (không cần host)
- ✅ Scale tốt
- ✅ UI dashboard dễ dùng

**Nhược điểm**:
- ❌ Phức tạp hơn
- ❌ Chi phí cao với high volume

---

### 3.3. TikAPI (Commercial Service)

**Tổng quan**: Commercial TikTok API service

**Website**: https://tikapi.io/

**Giá**:
```
STARTER: $29/month = 10,000 requests
GROWTH: $99/month = 50,000 requests
BUSINESS: $499/month = 300,000 requests
```

**Ưu điểm**:
- ✅ Rất ổn định (99.9% uptime)
- ✅ Full features (video, profile, search, etc.)
- ✅ Official-like quality

**Nhược điểm**:
- ❌ Đắt (không có FREE tier)
- ❌ Yêu cầu credit card ngay từ đầu

---

## 4️⃣ Web Scraping (Advanced) 🕷️

### 4.1. Puppeteer/Playwright

**Tổng quan**: Browser automation để scrape TikTok

**Setup**:
```bash
npm install puppeteer
# hoặc
npm install playwright
```

**Implementation**:
```typescript
import puppeteer from 'puppeteer';

export async function scrapeTikTokWithPuppeteer(videoUrl: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(videoUrl, { waitUntil: 'networkidle2' });

    // Extract data from page
    const data = await page.evaluate(() => {
      // Find elements and extract info
      const title = document.querySelector('h1')?.textContent || '';
      const views = document.querySelector('[data-e2e="video-views"]')?.textContent || '';
      // ... more extraction logic

      return { title, views };
    });

    await browser.close();
    return data;
  } catch (error) {
    await browser.close();
    throw error;
  }
}
```

**Ưu điểm**:
- ✅ Hoàn toàn miễn phí
- ✅ Full control
- ✅ Không phụ thuộc third-party

**Nhược điểm**:
- ❌ Rất chậm (khởi động browser)
- ❌ Resource intensive (RAM, CPU)
- ❌ Khó maintain (TikTok thay đổi HTML structure)
- ❌ Dễ bị detect và block

**Khuyến nghị**: ❌ KHÔNG nên dùng cho production

---

### 4.2. Cheerio + Axios (HTML Parsing)

**Tổng quan**: Fetch HTML và parse với Cheerio

**Setup**:
```bash
npm install axios cheerio
```

**Implementation**:
```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeTikTokWithCheerio(videoUrl: string) {
  const response = await axios.get(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 ...',
    }
  });

  const $ = cheerio.load(response.data);

  // Extract data
  const title = $('h1').text();
  const description = $('meta[property="og:description"]').attr('content');

  return { title, description };
}
```

**Ưu điểm**:
- ✅ Miễn phí
- ✅ Nhanh hơn Puppeteer
- ✅ Ít resource hơn

**Nhược điểm**:
- ❌ TikTok render JavaScript → Không lấy được hết data
- ❌ Cần parse HTML phức tạp
- ❌ Dễ bị rate limit

**Khuyến nghị**: ⚠️ Chỉ dùng cho simple cases

---

## 5️⃣ Official TikTok API (Doanh Nghiệp) 🏢

### Tổng Quan:
Official API từ TikTok for Developers

**Website**: https://developers.tiktok.com/

### Yêu Cầu:
```
1. ✅ Business/Company account (KHÔNG phải cá nhân)
2. ✅ Website/app đã launch (có users thật)
3. ✅ Business use case hợp lệ
4. ✅ Quá trình review 2-4 tuần
5. ✅ Tài liệu đầy đủ (business plan, app screenshots, etc.)
```

### Quy Trình Apply:

**Step 1: Tạo TikTok Developer Account**
```
1. Go to: https://developers.tiktok.com/
2. Click "Register"
3. Fill company information:
   - Company name
   - Business email (domain email, NOT Gmail)
   - Company website
   - Business address
4. Submit application
⏳ Wait 3-7 days for approval
```

**Step 2: Create App**
```
1. Login to TikTok Developer Portal
2. Click "Manage Apps" → "Create App"
3. Fill app details:
   - App name
   - App description
   - Use case (e.g., "Video Analytics Platform")
   - Redirect URLs
4. Submit for review
⏳ Wait 1-2 weeks
```

**Step 3: Request API Access**
```
1. After app approved
2. Go to "API Products"
3. Request access to:
   - Video API
   - User API
   - etc.
4. Submit use case documentation
⏳ Wait 1-2 weeks
```

**Step 4: Implement OAuth Flow**
```typescript
// Official API requires OAuth 2.0
const authUrl = `https://www.tiktok.com/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&scope=user.info.basic,video.list&redirect_uri=${REDIRECT_URI}`;

// User authorizes → Get access token
// Use token to call API
```

### Features:
```
✅ Video metadata
✅ User profile
✅ Video comments
✅ Analytics data
✅ Upload videos (với permission)
```

### Giới Hạn:
```
Free tier:
- 1,000 requests/day
- Rate limit: 10 requests/second

Enterprise:
- Custom limits
- Dedicated support
```

### Ưu Điểm:
- ✅ Official, ổn định nhất
- ✅ Full features
- ✅ Hợp pháp 100%
- ✅ Support từ TikTok

### Nhược Điểm:
- ❌ Rất khó apply (cần business)
- ❌ Quy trình lâu (1-2 tháng)
- ❌ Chỉ cho doanh nghiệp
- ❌ Phức tạp implement (OAuth flow)

### Khuyến Nghị:
🏢 Chỉ dùng nếu:
- Bạn có công ty chính thức
- App của bạn có nhiều users
- Cần ổn định lâu dài
- Budget cho development time

---

## 🎯 KHUYẾN NGHỊ CHO PROJECT CỦA BẠN

### Scenario 1: Development & Testing
**Dùng**: `tiktok-scraper` NPM package

**Lý do**:
- ✅ FREE, không giới hạn
- ✅ Setup nhanh (5 phút)
- ✅ Không cần API key
- ✅ Đủ tốt cho testing

**Implementation**:
```bash
npm install tiktok-scraper
# Modify lib/apis/tiktok.ts to use scraper as fallback
```

---

### Scenario 2: Small Production (< 1000 videos/tháng)
**Dùng**: RapidAPI FREE plan + tiktok-scraper fallback

**Lý do**:
- ✅ RapidAPI cho 100 requests quan trọng
- ✅ Scraper cho overflow requests
- ✅ Best of both worlds

**Strategy**:
```typescript
// Priority system:
// 1. RapidAPI (100/month) - for important videos
// 2. tiktok-scraper - for additional videos
// 3. Placeholder - final fallback
```

---

### Scenario 3: Medium Production (1k-10k videos/tháng)
**Dùng**: RapidAPI PRO ($9.99/month)

**Lý do**:
- ✅ 10,000 requests/month
- ✅ Reliable
- ✅ Good support
- ✅ Tương đối rẻ

---

### Scenario 4: Large Production (> 10k videos/tháng)
**Dùng**: TikAPI hoặc Official API

**Lý do**:
- ✅ Better pricing at scale
- ✅ Enterprise support
- ✅ SLA guarantees

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Add tiktok-scraper as Fallback (RECOMMENDED)

**Time**: 30 phút

**Steps**:
1. Install package: `npm install tiktok-scraper`
2. Create scraper function trong `lib/apis/tiktok.ts`
3. Update logic để dùng scraper khi RapidAPI fails
4. Test với vài TikTok URLs

**Benefits**:
- ✅ Zero cost
- ✅ Backup khi RapidAPI hết quota
- ✅ Không cần thay đổi nhiều code

---

### Phase 2: Implement Caching (RECOMMENDED)

**Time**: 1 giờ

**Steps**:
1. Add `video_cache` table trong database
2. Cache video metadata sau lần fetch đầu
3. TTL: 7 ngày (video metadata thường không đổi)

**Benefits**:
- ✅ Giảm API calls
- ✅ Faster response
- ✅ Save quota

**Schema**:
```sql
CREATE TABLE video_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  metadata JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(platform, video_id)
);
```

---

### Phase 3: Monitor Usage

**Tools**:
- RapidAPI dashboard cho quota tracking
- Database analytics cho cache hit rate
- Error logging cho scraper failures

---

## 💡 BEST PRACTICES

### 1. Multi-Layer Fallback
```typescript
async function getTikTokVideo(url: string) {
  // Layer 1: Check cache
  const cached = await getCachedVideo(url);
  if (cached && !isExpired(cached)) return cached;

  // Layer 2: RapidAPI
  try {
    const data = await rapidApiCall(url);
    await cacheVideo(url, data);
    return data;
  } catch (e) {
    console.log('RapidAPI failed, trying scraper...');
  }

  // Layer 3: tiktok-scraper
  try {
    const data = await scraperCall(url);
    await cacheVideo(url, data);
    return data;
  } catch (e) {
    console.log('Scraper failed, using placeholder...');
  }

  // Layer 4: Placeholder
  return placeholderData;
}
```

### 2. Rate Limiting
```typescript
import pLimit from 'p-limit';

const limit = pLimit(3); // Max 3 concurrent requests
const results = await Promise.all(
  urls.map(url => limit(() => getTikTokVideo(url)))
);
```

### 3. Error Handling
```typescript
try {
  const video = await getTikTokVideo(url);
} catch (error) {
  // Log error with context
  logger.error('TikTok fetch failed', {
    url,
    method: 'rapidapi',
    error: error.message,
    timestamp: new Date().toISOString()
  });

  // Return graceful fallback
  return placeholderData;
}
```

---

## 🔗 USEFUL LINKS

### Package & Tools:
- tiktok-scraper: https://www.npmjs.com/package/tiktok-scraper
- RapidAPI: https://rapidapi.com/
- ScraperAPI: https://www.scraperapi.com/
- Apify: https://apify.com/
- TikAPI: https://tikapi.io/

### Official:
- TikTok Developers: https://developers.tiktok.com/
- TikTok API Docs: https://developers.tiktok.com/doc/overview

### Communities:
- TikTok API Reddit: https://www.reddit.com/r/TikTokAPI/
- Stack Overflow: https://stackoverflow.com/questions/tagged/tiktok-api

---

## ❓ FAQ

**Q: Phương án nào MIỄN PHÍ hoàn toàn?**
A: `tiktok-scraper` NPM package - FREE, không giới hạn, không cần API key

**Q: Phương án nào ổn định nhất?**
A: RapidAPI hoặc TikAPI (commercial services)

**Q: Phương án nào dễ setup nhất?**
A: RapidAPI (10 phút) hoặc tiktok-scraper (5 phút)

**Q: Có thể dùng nhiều phương án cùng lúc?**
A: Có! Nên dùng fallback system: RapidAPI → Scraper → Placeholder

**Q: Có vi phạm ToS của TikTok không?**
A:
- ✅ Official API: Hợp pháp
- ⚠️ RapidAPI/Commercial: Gray area (họ lo)
- ⚠️ Scraping: Vi phạm ToS (nhưng hiếm khi bị xử lý)

**Q: Nên chọn phương án nào cho production?**
A: RapidAPI PRO ($9.99/month) + tiktok-scraper fallback = Best value

---

## 🎯 NEXT STEPS

**Để tôi giúp bạn implement?**

1. **Option A**: Thêm tiktok-scraper fallback (30 phút, FREE)
2. **Option B**: Setup ScraperAPI (alternative paid service)
3. **Option C**: Implement caching system để save quota
4. **Option D**: Apply Official TikTok API (long-term solution)

Bạn muốn implement phương án nào? 🚀

---

**Last Updated**: 2025-01-09
**Author**: Claude Code
**Status**: Complete Guide ✅
