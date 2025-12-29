# Phân Tích URL Shortener cho Affiliate Links

## 🎯 VẤN ĐỀ

### Vấn đề với URL dài:

**Ví dụ URL từ AccessTrade API:**
```
https://tracking.dev.accesstrade.me/deep_link/4348611760548105593/4751584435713464237?utm_campaign=test_campaign&sub4=test_sub4&sub2=test_sub2&sub3=test_sub3&sub1=test_sub1&url=https%3A%2F%2Fshopee.vn&utm_content=test_content&utm_source=test_source&utm_medium=test_medium
```

**Độ dài**: ~280 ký tự

**Vấn đề khi share lên Facebook:**
1. ❌ URL quá dài, khó đọc
2. ❌ Facebook có thể đánh dấu là spam
3. ❌ Người dùng không tin tưởng click
4. ❌ Khó nhớ, không professional
5. ❌ Tracking parameters lộ ra ngoài

### Giải pháp cần có:

✅ **URL ngắn**: `https://yourdomain.com/l/abc123` (30-40 ký tự)
✅ **Branded domain**: Dùng domain của hệ thống
✅ **Click tracking**: Log mọi click qua short URL
✅ **Analytics**: Biết được bao nhiêu người click
✅ **Safe for Facebook**: Không bị chặn spam

---

## 🏗️ KIẾN TRÚC URL SHORTENER

### Option 1: Self-Hosted Shortener (ĐỀ XUẤT)

**Architecture:**
```
User clicks short link
    ↓
https://yourdomain.com/l/abc123
    ↓
Next.js API Route: /api/l/[code]
    ↓
1. Lookup code in database
2. Log click (IP, user agent, referrer)
3. Increment counter
4. Redirect 302 to affiliate_url
```

**Database Schema:**
```sql
CREATE TABLE short_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Short code
  code VARCHAR(10) UNIQUE NOT NULL, -- 'abc123'

  -- Target
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  long_url TEXT NOT NULL, -- Original affiliate URL

  -- Stats (denormalized for performance)
  clicks_count INT DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiry
  is_active BOOLEAN DEFAULT true,

  -- Indexes
  INDEX idx_short_urls_code (code),
  INDEX idx_short_urls_affiliate_link (affiliate_link_id)
);

-- Click logs (optional - for detailed analytics)
CREATE TABLE short_url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_url_id UUID REFERENCES short_urls(id) ON DELETE CASCADE,

  -- Click info
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country VARCHAR(10),

  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_clicks_short_url (short_url_id),
  INDEX idx_clicks_timestamp (clicked_at DESC)
);
```

**Pros:**
- ✅ Full control
- ✅ No API limits
- ✅ Free (no third-party costs)
- ✅ Custom domain
- ✅ Detailed analytics
- ✅ GDPR compliant (own data)

**Cons:**
- ❌ Need to implement
- ❌ Database storage
- ❌ Handle redirects load

---

### Option 2: Third-Party Service (KHÔNG ĐỀ XUẤT)

**Services:**
- Bitly, TinyURL, Short.io, Rebrandly

**Pros:**
- ✅ Quick setup
- ✅ Proven infrastructure

**Cons:**
- ❌ Monthly costs ($29-$99/month for custom domain)
- ❌ API rate limits
- ❌ External dependency
- ❌ Data privacy concerns
- ❌ Less control

**Kết luận**: KHÔNG phù hợp cho long-term

---

## 💡 GIẢI PHÁP ĐỀ XUẤT: SELF-HOSTED

### 1. Database Schema

```sql
-- ============================================================================
-- SHORT_URLS TABLE
-- ============================================================================
CREATE TABLE short_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Short code (6 chars: base62 encoding)
  code VARCHAR(10) UNIQUE NOT NULL,

  -- Relations
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  review_id UUID REFERENCES reviews(id),

  -- Target URL
  long_url TEXT NOT NULL,

  -- Stats
  clicks_count INT DEFAULT 0,
  unique_clicks_count INT DEFAULT 0, -- Unique IPs
  last_clicked_at TIMESTAMPTZ,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  UNIQUE INDEX idx_short_urls_code (code),
  INDEX idx_short_urls_affiliate (affiliate_link_id),
  INDEX idx_short_urls_user (user_id)
);

-- ============================================================================
-- URL_CLICKS TABLE (Optional - for detailed analytics)
-- ============================================================================
CREATE TABLE url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_url_id UUID NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,

  -- Click metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Browser/Device info (parsed from user agent)
  browser VARCHAR(50),
  device VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
  os VARCHAR(50),

  -- Location (optional - IP geolocation)
  country VARCHAR(10),
  city VARCHAR(100),

  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_url_clicks_short_url (short_url_id),
  INDEX idx_url_clicks_timestamp (clicked_at DESC)
);
```

---

### 2. Code Generation Algorithm

**Base62 Encoding** (a-z, A-Z, 0-9):

```typescript
// lib/affiliate/utils/short-code-generator.ts

const BASE62_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate random short code
 * Length 6 = 62^6 = 56.8 billion combinations
 */
export function generateShortCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARS.length);
    code += BASE62_CHARS[randomIndex];
  }
  return code;
}

/**
 * Generate unique short code (check database)
 */
export async function generateUniqueShortCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateShortCode(6);

    // Check if code exists
    const { data } = await supabaseAdmin
      .from('short_urls')
      .select('id')
      .eq('code', code)
      .single();

    if (!data) {
      return code; // Code is unique!
    }

    attempts++;
  }

  // Fallback: use 8 chars if collision persists
  return generateShortCode(8);
}

/**
 * Alternative: Increment-based with base62 encoding
 * More predictable, but sequential
 */
export function encodeBase62(num: number): string {
  if (num === 0) return BASE62_CHARS[0];

  let encoded = '';
  while (num > 0) {
    encoded = BASE62_CHARS[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded.padStart(6, BASE62_CHARS[0]);
}
```

**Collision Probability:**
- 6 chars = 62^6 = 56.8 billion combinations
- Even with 1 million links, collision probability < 0.002%
- Safe for production

---

### 3. Short URL Service

```typescript
// lib/affiliate/services/short-url-service.ts

export class ShortUrlService {
  /**
   * Create short URL for affiliate link
   */
  async createShortUrl(
    affiliateLinkId: string,
    userId: string,
    reviewId?: string
  ): Promise<ShortUrl> {
    // 1. Get affiliate link
    const { data: affiliateLink } = await supabaseAdmin
      .from('affiliate_links')
      .select('affiliate_url')
      .eq('id', affiliateLinkId)
      .single();

    if (!affiliateLink) {
      throw new Error('Affiliate link not found');
    }

    // 2. Check if short URL already exists
    const { data: existing } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('affiliate_link_id', affiliateLinkId)
      .eq('is_active', true)
      .single();

    if (existing) {
      return existing; // Return existing short URL
    }

    // 3. Generate unique code
    const code = await generateUniqueShortCode();

    // 4. Create short URL
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .insert({
        code,
        affiliate_link_id: affiliateLinkId,
        user_id: userId,
        review_id: reviewId,
        long_url: affiliateLink.affiliate_url
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create short URL: ${error.message}`);
    }

    return data;
  }

  /**
   * Get full short URL
   */
  getShortUrl(code: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/l/${code}`;
  }

  /**
   * Track click and redirect
   */
  async trackAndRedirect(
    code: string,
    clickMetadata: {
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
    }
  ): Promise<string> {
    // 1. Get short URL
    const { data: shortUrl } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (!shortUrl) {
      throw new Error('Short URL not found or expired');
    }

    // 2. Log click
    await this.logClick(shortUrl.id, clickMetadata);

    // 3. Increment counter
    await supabaseAdmin
      .from('short_urls')
      .update({
        clicks_count: shortUrl.clicks_count + 1,
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', shortUrl.id);

    // 4. Return long URL for redirect
    return shortUrl.long_url;
  }

  /**
   * Log click event
   */
  private async logClick(
    shortUrlId: string,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      referrer?: string;
    }
  ) {
    // Parse user agent for device info
    const deviceInfo = this.parseUserAgent(metadata.userAgent || '');

    await supabaseAdmin.from('url_clicks').insert({
      short_url_id: shortUrlId,
      ip_address: metadata.ipAddress,
      user_agent: metadata.userAgent,
      referrer: metadata.referrer,
      browser: deviceInfo.browser,
      device: deviceInfo.device,
      os: deviceInfo.os
    });
  }

  /**
   * Parse user agent (basic implementation)
   */
  private parseUserAgent(userAgent: string) {
    // Simple detection - can use library like 'ua-parser-js' for better accuracy
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    const isTablet = /Tablet|iPad/i.test(userAgent);

    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) os = 'iOS';

    return {
      browser,
      device: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      os
    };
  }

  /**
   * Get analytics for short URL
   */
  async getAnalytics(code: string) {
    const { data: shortUrl } = await supabaseAdmin
      .from('short_urls')
      .select(`
        *,
        url_clicks (
          id,
          ip_address,
          device,
          browser,
          clicked_at
        )
      `)
      .eq('code', code)
      .single();

    if (!shortUrl) {
      throw new Error('Short URL not found');
    }

    // Calculate unique clicks (by IP)
    const uniqueIPs = new Set(
      shortUrl.url_clicks.map((c: any) => c.ip_address)
    );

    return {
      code: shortUrl.code,
      shortUrl: this.getShortUrl(shortUrl.code),
      longUrl: shortUrl.long_url,
      totalClicks: shortUrl.clicks_count,
      uniqueClicks: uniqueIPs.size,
      lastClickedAt: shortUrl.last_clicked_at,
      createdAt: shortUrl.created_at,
      clicks: shortUrl.url_clicks
    };
  }
}
```

---

### 4. API Endpoints

**Create Short URL:**
```typescript
// app/api/shorten/route.ts

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { affiliateLinkId, reviewId } = await request.json();

  if (!affiliateLinkId) {
    return NextResponse.json(
      { error: 'affiliateLinkId required' },
      { status: 400 }
    );
  }

  try {
    const service = new ShortUrlService();
    const shortUrl = await service.createShortUrl(affiliateLinkId, userId, reviewId);
    const fullUrl = service.getShortUrl(shortUrl.code);

    return NextResponse.json({
      success: true,
      data: {
        code: shortUrl.code,
        shortUrl: fullUrl,
        longUrl: shortUrl.long_url
      }
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to shorten URL' },
      { status: 500 }
    );
  }
}
```

**Redirect Endpoint:**
```typescript
// app/l/[code]/route.ts
// OR app/api/l/[code]/route.ts (depending on preference)

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;

  // Get click metadata
  const ipAddress = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || '';

  try {
    const service = new ShortUrlService();
    const longUrl = await service.trackAndRedirect(code, {
      ipAddress,
      userAgent,
      referrer
    });

    // 302 redirect to long URL
    return NextResponse.redirect(longUrl, 302);

  } catch (error) {
    console.error('Redirect error:', error);

    // Redirect to homepage if short URL not found
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}?error=link-not-found`, 302);
  }
}
```

**Analytics Endpoint:**
```typescript
// app/api/shorten/[code]/analytics/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const service = new ShortUrlService();
    const analytics = await service.getAnalytics(params.code);

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
```

---

### 5. Integration với Affiliate Links

**Update AffiliateLinkService:**
```typescript
// lib/affiliate/services/link-service.ts

export class AffiliateLinkService {
  async createAffiliateLink(request: CreateLinkRequest): Promise<AffiliateLink> {
    // ... existing code to create affiliate link ...

    // AUTO-CREATE SHORT URL
    const shortUrlService = new ShortUrlService();
    const shortUrl = await shortUrlService.createShortUrl(
      affiliateLink.id,
      request.userId,
      request.reviewId
    );

    // Update affiliate link with short URL
    await supabaseAdmin
      .from('affiliate_links')
      .update({
        short_url: shortUrlService.getShortUrl(shortUrl.code)
      })
      .eq('id', affiliateLink.id);

    affiliateLink.short_url = shortUrlService.getShortUrl(shortUrl.code);

    return affiliateLink;
  }
}
```

**Update affiliate_links schema:**
```sql
-- Add short_url column if not exists
ALTER TABLE affiliate_links
ADD COLUMN IF NOT EXISTS short_url TEXT;
```

---

### 6. UI Display

**AffiliateLinksTab Component:**
```tsx
<div className="space-y-2">
  {/* Long URL */}
  <div className="text-xs text-gray-500">
    <span className="font-medium">Full URL:</span>
    <div className="truncate">{link.affiliate_url}</div>
  </div>

  {/* Short URL - HIGHLIGHTED */}
  {link.short_url && (
    <div className="border-l-4 border-blue-500 pl-3 bg-blue-50 p-2 rounded">
      <div className="text-xs font-medium text-blue-700 mb-1">
        📎 Short URL (for sharing):
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
          {link.short_url}
        </code>
        <Button
          size="sm"
          onClick={() => handleCopy(link.short_url)}
        >
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </Button>
      </div>
    </div>
  )}

  {/* Stats */}
  <div className="flex items-center gap-4 text-xs text-gray-500">
    <span>👁️ {link.clicks_count || 0} clicks</span>
    <span>Method: {link.generation_method}</span>
  </div>
</div>
```

---

## 📊 SO SÁNH URL

### Before (Long URL):
```
https://tracking.dev.accesstrade.me/deep_link/4348611760548105593/4751584435713464237?utm_campaign=test_campaign&sub4=test_sub4&sub2=test_sub2&sub3=test_sub3&sub1=test_sub1&url=https%3A%2F%2Fshopee.vn&utm_content=test_content&utm_source=test_source&utm_medium=test_medium
```
**Length**: 280 chars ❌

### After (Short URL):
```
https://yourdomain.com/l/Xk9pQw
```
**Length**: 33 chars ✅

**Reduction**: 88% shorter! 🎉

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### 1. Domain Setup

**Option A: Use main domain**
```
https://yourapp.com/l/abc123
```

**Option B: Use subdomain (RECOMMENDED)**
```
https://go.yourapp.com/abc123
```

**Benefits of subdomain:**
- ✅ Cleaner separation
- ✅ Easier to track in analytics
- ✅ Can use different CDN config
- ✅ Looks more professional

**Setup:**
1. Add subdomain DNS record (CNAME to Vercel)
2. Add domain to Vercel project
3. Update `NEXT_PUBLIC_APP_URL` env var

### 2. Performance Optimization

**Caching Strategy:**
```typescript
// app/l/[code]/route.ts

export const runtime = 'edge'; // Use Edge runtime for faster redirects
export const revalidate = 0; // Don't cache redirects
```

**Database Indexing:**
```sql
-- Already included in schema
CREATE UNIQUE INDEX idx_short_urls_code ON short_urls(code);
```

**Redis Caching (Optional):**
- Cache code → URL mapping in Redis
- Reduce database queries
- Faster redirects (sub-10ms)

### 3. Security

**Rate Limiting:**
```typescript
// Prevent abuse
const MAX_CLICKS_PER_IP_PER_HOUR = 100;

// Check in trackAndRedirect()
const recentClicks = await getRecentClicksByIP(ipAddress, shortUrlId);
if (recentClicks > MAX_CLICKS_PER_IP_PER_HOUR) {
  throw new Error('Rate limit exceeded');
}
```

**Bot Detection:**
```typescript
// Filter out bots from analytics
const BOT_USER_AGENTS = ['Googlebot', 'bingbot', 'facebookexternalhit'];

function isBot(userAgent: string): boolean {
  return BOT_USER_AGENTS.some(bot => userAgent.includes(bot));
}

// Don't count bot clicks in stats
if (!isBot(userAgent)) {
  await incrementClickCount();
}
```

**Expiry:**
```sql
-- Set expiry for short URLs (optional)
UPDATE short_urls
SET expires_at = NOW() + INTERVAL '1 year'
WHERE expires_at IS NULL;

-- Query only active URLs
SELECT * FROM short_urls
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
```

---

## 📈 ANALYTICS & MONITORING

### Key Metrics to Track:

1. **Click-through Rate (CTR)**
   ```sql
   SELECT
     s.code,
     s.clicks_count,
     COUNT(DISTINCT c.ip_address) as unique_visitors,
     s.clicks_count::float / NULLIF(COUNT(DISTINCT c.ip_address), 0) as avg_clicks_per_visitor
   FROM short_urls s
   LEFT JOIN url_clicks c ON c.short_url_id = s.id
   GROUP BY s.id;
   ```

2. **Top Performing Links**
   ```sql
   SELECT
     s.code,
     al.label,
     m.name as merchant,
     s.clicks_count
   FROM short_urls s
   JOIN affiliate_links al ON al.id = s.affiliate_link_id
   JOIN merchants m ON m.id = al.merchant_id
   ORDER BY s.clicks_count DESC
   LIMIT 10;
   ```

3. **Device Breakdown**
   ```sql
   SELECT
     device,
     COUNT(*) as clicks
   FROM url_clicks
   WHERE short_url_id = 'xxx'
   GROUP BY device;
   ```

4. **Geographic Distribution** (if IP geolocation added)
   ```sql
   SELECT
     country,
     COUNT(*) as clicks
   FROM url_clicks
   WHERE short_url_id = 'xxx'
   GROUP BY country
   ORDER BY clicks DESC;
   ```

---

## 💰 COST ANALYSIS

### Self-Hosted Solution:

**Database Storage:**
- 1M short URLs × 1KB = 1GB
- 1M click logs × 500 bytes = 500MB
- **Total**: ~1.5GB

**Vercel/Supabase Free Tier:**
- ✅ Supabase: 500MB free (upgrade to $25/mo for 8GB if needed)
- ✅ Vercel: Unlimited redirects on Hobby plan

**Estimated Cost:**
- 0-10K links: **FREE** ✅
- 10K-100K links: **$0-25/month** ✅
- 100K+ links: **$25-50/month** ✅

**vs Third-Party:**
- Bitly: $29-$199/month
- Short.io: $20-$100/month

**Savings**: $300-$2000/year! 💰

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database (30 min)
- [ ] Create `short_urls` table
- [ ] Create `url_clicks` table (optional)
- [ ] Add indexes
- [ ] Add `short_url` column to `affiliate_links`

### Phase 2: Backend (2-3 hours)
- [ ] Implement `short-code-generator.ts`
- [ ] Implement `ShortUrlService`
- [ ] Create `POST /api/shorten` endpoint
- [ ] Create `GET /l/[code]` redirect endpoint
- [ ] Create analytics endpoint

### Phase 3: Integration (1 hour)
- [ ] Update `AffiliateLinkService` to auto-create short URLs
- [ ] Update UI to display short URLs
- [ ] Add copy button for short URLs

### Phase 4: Testing (1 hour)
- [ ] Test short URL creation
- [ ] Test redirects
- [ ] Test click tracking
- [ ] Test analytics
- [ ] Verify Facebook sharing

### Phase 5: Optional Enhancements
- [ ] Setup custom subdomain (go.yourapp.com)
- [ ] Add Redis caching
- [ ] Add IP geolocation
- [ ] Add rate limiting
- [ ] Add bot detection

---

## 🎯 RECOMMENDED WORKFLOW

### Current Flow (WITH URL Shortener):

```
1. User tạo review
   ↓
2. User vào tab "Affiliate"
   ↓
3. User click "Thêm Link"
   ↓
4. Chọn merchant + nhập URL
   ↓
5. System:
   - Generate affiliate URL (AccessTrade/Deeplink)
   - Auto-create short URL
   - Save both to database
   ↓
6. Display to user:
   - Long URL: https://tracking.accesstrade.me/... (for reference)
   - Short URL: https://yourapp.com/l/abc123 (for sharing) ⭐
   ↓
7. User copies SHORT URL
   ↓
8. User shares to Facebook comment
   ↓
9. Customer clicks short URL
   ↓
10. System:
    - Logs click (IP, device, browser)
    - Increments counter
    - Redirects to long affiliate URL
   ↓
11. Customer lands on Shopee/Lazada
   ↓
12. Customer buys → Conversion tracked by AccessTrade
```

---

## 🚀 NEXT STEPS

**Immediate:**
1. ✅ Confirm workflow above
2. ✅ Choose domain strategy (main domain vs subdomain)
3. ✅ Decide on optional features (analytics detail level)

**Then implement:**
1. Phase 1: Database schema
2. Phase 2: Backend services
3. Phase 3: API endpoints
4. Phase 4: UI integration
5. Phase 5: Testing

**Timeline:**
- Core shortener: 4-5 hours
- With analytics: +2 hours
- Total: 6-7 hours

---

## 💡 BONUS: QR CODE INTEGRATION

Nếu muốn share offline (poster, flyer):

```typescript
// Generate QR code for short URL
import QRCode from 'qrcode';

async function generateQRCode(shortUrl: string): Promise<string> {
  return await QRCode.toDataURL(shortUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}

// Usage in UI
<img src={qrCodeDataUrl} alt="Scan to visit" />
```

**Use case:** Print QR code on review thumbnails for offline marketing!

---

## 📝 CONCLUSION

**URL Shortener là CRITICAL** cho affiliate marketing vì:

1. ✅ **Trust**: Short, branded URLs được tin tưởng hơn
2. ✅ **Facebook**: Tránh bị đánh dấu spam
3. ✅ **Analytics**: Track được clicks chi tiết
4. ✅ **Professional**: Branding cho business
5. ✅ **Flexible**: Có thể update target URL sau này nếu cần

**Recommendation:**
- Implement self-hosted solution
- Use subdomain (go.yourapp.com)
- Start with basic tracking
- Add advanced analytics later if needed

**Cost**: Gần như FREE với Vercel + Supabase free tier ✅
