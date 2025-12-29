# Kế Hoạch Tích Hợp Affiliate Link Module vào Video Affiliate App

## 📋 EXECUTIVE SUMMARY

Tích hợp hệ thống tạo affiliate link tracking từ Cashback System vào Video Affiliate App với mục tiêu:
- Tự động tạo affiliate links cho sản phẩm trong reviews
- Track clicks và conversions từ videos
- Tính toán commission/cashback
- Monitoring và analytics đầy đầu

---

## 🔍 PHÂN TÍCH KIẾN TRÚC HIỆN TẠI

### A. Video Affiliate App (Đích đến)

**Tech Stack:**
- Next.js 14 App Router
- Supabase (PostgreSQL + Auth)
- TypeScript
- Vercel hosting

**Database Tables hiện có:**
- `users` - User authentication & profiles
- `reviews` - Video reviews với affiliate_links JSONB
- `schedules` - Scheduled posts to Facebook
- `categories` - Product categories
- `prompt_templates` - AI generation templates

**Đặc điểm:**
- Review-centric: Mọi thứ xoay quanh reviews từ videos
- AI-powered: Tạo nội dung review tự động từ video analysis
- Social integration: Auto-post to Facebook
- Template system: Flexible content generation

### B. Cashback System (Nguồn)

**Tech Stack:**
- Node.js + Express
- PostgreSQL
- Cron jobs

**Core Features:**
- 3 phương thức tạo link:
  1. **Manual Deeplink** (DIY) - Fast, offline
  2. **AccessTrade API v1** - Official, better tracking
  3. **TikTok Shop API v2** - Special for TikTok

**Tracking Strategy:**
- PRIMARY: `utm_content` = `click_id`
- BACKUP: `sub2` = `click_id`
- Fallback: Manual admin matching

**Database:**
- `merchants` - Merchant info với campaign_id
- `clicks` - Click tracking với UTM + sub params
- `conversions` - Orders từ AccessTrade webhook/API

---

## 🎯 MỤC TIÊU TÍCH HỢP

### 1. Functional Goals

✅ **Link Generation trong Reviews**
- User tạo review → Tự động generate affiliate links cho products
- Hỗ trợ multiple products per review
- Choose link generation method (API/Deeplink)

✅ **Click Tracking**
- Track khi users click affiliate links
- Ghi nhận source: review_id, video_id, platform
- IP, user agent, referrer tracking

✅ **Conversion Attribution**
- Match conversions với clicks
- Calculate commission/cashback
- Update user balances

✅ **Analytics & Reporting**
- Review performance: clicks, conversions, revenue
- User earnings dashboard
- Admin monitoring

### 2. Technical Goals

✅ **Maintain Current Features**
- Không phá vỡ review workflow hiện tại
- Giữ nguyên template system
- Compatibility với scheduled posts

✅ **Scalability**
- Handle thousands of clicks/day
- Efficient database queries
- Background job processing

✅ **User Experience**
- Simple UI for adding affiliate links
- One-click copy affiliate URLs
- Real-time stats

---

## 🏗️ KIẾN TRÚC ĐỀ XUẤT

### Phase 1: Database Schema Extension

```sql
-- ============================================================================
-- MERCHANTS TABLE
-- ============================================================================
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  logo_url TEXT,

  -- Affiliate Platform Config
  platform VARCHAR(50) NOT NULL, -- 'accesstrade', 'isclix'
  campaign_id VARCHAR(100) NOT NULL, -- AccessTrade/iSclix campaign ID
  deep_link_base TEXT, -- Homepage URL for button clicks

  -- API Configuration
  api_config JSONB, -- { api_version: 'v1', supports_batch: true }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  category VARCHAR(100), -- 'ecommerce', 'fashion', 'tech'
  commission_rate DECIMAL(5,2), -- e.g., 3.50 for 3.5%
  cookie_duration INT, -- Days (e.g., 30)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  UNIQUE(domain),
  INDEX idx_merchants_platform (platform),
  INDEX idx_merchants_active (is_active)
);

-- Seed data example
INSERT INTO merchants (name, domain, platform, campaign_id, deep_link_base) VALUES
('Shopee', 'shopee.vn', 'accesstrade', '4751584435713464237', 'https://shopee.vn'),
('Lazada', 'lazada.vn', 'accesstrade', '4348614231480407268', 'https://lazada.vn'),
('TikTok Shop', 'tiktok.com', 'accesstrade', '4790392958945222748', 'https://vt.tiktok.com');

-- ============================================================================
-- AFFILIATE_LINKS TABLE (Enhanced from reviews.affiliate_links JSONB)
-- ============================================================================
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id),

  -- Link Data
  original_url TEXT NOT NULL, -- Product URL hoặc merchant homepage
  affiliate_url TEXT NOT NULL, -- Generated affiliate link
  short_url TEXT, -- From AccessTrade API (optional)

  -- Product Info (optional - for rich display)
  product_name VARCHAR(500),
  product_image TEXT,
  product_price DECIMAL(15,2),

  -- Tracking IDs
  click_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  aff_sid VARCHAR(100) NOT NULL, -- {userId}_{timestamp}_{random}

  -- Link Type
  link_type VARCHAR(20) NOT NULL, -- 'button', 'product'
  generation_method VARCHAR(20) NOT NULL, -- 'api', 'deeplink', 'tiktok-api'

  -- UTM Parameters (PRIMARY tracking)
  utm_source VARCHAR(50) DEFAULT 'video-affiliate',
  utm_medium VARCHAR(50), -- username
  utm_campaign VARCHAR(50) DEFAULT 'review',
  utm_content VARCHAR(100), -- click_id for matching
  utm_term VARCHAR(255), -- aff_sid

  -- Sub Parameters (BACKUP tracking)
  sub1 VARCHAR(100), -- user_id
  sub2 VARCHAR(100), -- click_id (backup)
  sub3 VARCHAR(100), -- link_type
  sub4 VARCHAR(100) DEFAULT 'video-affiliate',
  sub5 VARCHAR(100), -- review_id

  -- Stats (denormalized for performance)
  clicks_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0,
  total_commission DECIMAL(15,2) DEFAULT 0,

  -- Metadata
  label VARCHAR(255), -- User-defined label (e.g., "Mua tại Shopee")
  display_order INT DEFAULT 0, -- Order in review

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_affiliate_links_user (user_id),
  INDEX idx_affiliate_links_review (review_id),
  INDEX idx_affiliate_links_merchant (merchant_id),
  INDEX idx_affiliate_links_click_id (click_id),
  INDEX idx_affiliate_links_utm_content (utm_content),
  INDEX idx_affiliate_links_sub2 (sub2)
);

-- ============================================================================
-- CLICKS TABLE
-- ============================================================================
CREATE TABLE clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  affiliate_link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id), -- NULL for anonymous clicks

  -- Click Metadata
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Location (optional - can add later with IP geolocation)
  country VARCHAR(10),
  city VARCHAR(100),

  -- Source Context
  source_type VARCHAR(50), -- 'review_page', 'facebook_post', 'direct'
  source_id UUID, -- review_id, schedule_id, etc.

  clicked_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_clicks_affiliate_link (affiliate_link_id),
  INDEX idx_clicks_user (user_id),
  INDEX idx_clicks_clicked_at (clicked_at DESC)
);

-- ============================================================================
-- CONVERSIONS TABLE
-- ============================================================================
CREATE TABLE conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  user_id UUID REFERENCES users(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),

  -- AccessTrade Data
  accesstrade_id VARCHAR(255) UNIQUE, -- Transaction ID from AccessTrade
  order_code VARCHAR(255),

  -- Financial Data
  order_amount DECIMAL(15,2) NOT NULL, -- Total order value
  commission DECIMAL(15,2) NOT NULL, -- Received from AccessTrade
  cashback_amount DECIMAL(15,2), -- User share (e.g., 70% of commission)

  -- Status Tracking
  status VARCHAR(50) NOT NULL, -- 'pending', 'approved', 'rejected', 'cancelled'

  -- Matching Info
  matched_via VARCHAR(50), -- 'utm_content', 'sub2', 'manual'

  -- Timestamps
  order_time TIMESTAMPTZ,
  approval_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_conversions_affiliate_link (affiliate_link_id),
  INDEX idx_conversions_user (user_id),
  INDEX idx_conversions_merchant (merchant_id),
  INDEX idx_conversions_accesstrade_id (accesstrade_id),
  INDEX idx_conversions_status (status),
  INDEX idx_conversions_order_time (order_time DESC)
);

-- ============================================================================
-- USER BALANCES (Add columns to existing users table)
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS available_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_earned DECIMAL(15,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(15,2) DEFAULT 0;

-- ============================================================================
-- WITHDRAW REQUESTS (for cashback payouts)
-- ============================================================================
CREATE TABLE withdraw_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'

  -- Payment Info
  payment_method VARCHAR(50), -- 'bank_transfer', 'momo', 'zalopay'
  payment_details JSONB, -- { account_number, account_name, bank_name }

  -- Admin Actions
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_withdraw_user (user_id),
  INDEX idx_withdraw_status (status)
);
```

---

### Phase 2: Service Layer Architecture

```
lib/affiliate/
├── index.ts                          # Main exports
├── generators/
│   ├── base-generator.ts             # Abstract base class
│   ├── deeplink-generator.ts         # Manual deeplink (iSclix format)
│   ├── accesstrade-generator.ts      # AccessTrade API v1
│   ├── tiktok-generator.ts           # TikTok Shop API v2
│   └── index.ts
├── services/
│   ├── link-service.ts               # Main orchestration
│   ├── merchant-service.ts           # Merchant CRUD
│   ├── tracking-service.ts           # Click/conversion tracking
│   ├── analytics-service.ts          # Stats & reporting
│   └── balance-service.ts            # User balance management
├── utils/
│   ├── url-validator.ts              # URL validation
│   ├── utm-builder.ts                # UTM params builder
│   ├── id-generator.ts               # AFF_SID, click_id
│   └── price-formatter.ts            # Currency formatting
├── types/
│   └── index.ts                      # TypeScript types
└── constants.ts                      # Config constants
```

**Key Service: Link Service**

```typescript
// lib/affiliate/services/link-service.ts
import { supabaseAdmin } from '@/lib/db/supabase';
import { DeeplinkGenerator } from '../generators/deeplink-generator';
import { AccessTradeGenerator } from '../generators/accesstrade-generator';
import { TikTokGenerator } from '../generators/tiktok-generator';

export interface CreateAffiliateLinkRequest {
  userId: string;
  reviewId?: string;
  merchantId: string;
  originalUrl: string;
  linkType: 'button' | 'product';
  label?: string;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  generationMethod?: 'auto' | 'api' | 'deeplink';
}

export class AffiliateLinkService {
  /**
   * Create affiliate link with auto-fallback
   */
  async createAffiliateLink(request: CreateAffiliateLinkRequest) {
    // 1. Get merchant info
    const merchant = await this.getMerchant(request.merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // 2. Validate URL
    if (request.linkType === 'product') {
      this.validateProductUrl(request.originalUrl, merchant.domain);
    }

    // 3. Generate click_id
    const clickId = crypto.randomUUID();

    // 4. Choose generator
    const generator = this.selectGenerator(
      merchant,
      request.originalUrl,
      request.generationMethod
    );

    // 5. Generate link
    let result;
    try {
      result = await generator.generate({
        userId: request.userId,
        merchant,
        originalUrl: request.originalUrl,
        clickId,
        linkType: request.linkType
      });
    } catch (error) {
      // Fallback to deeplink if API fails
      if (generator instanceof AccessTradeGenerator || generator instanceof TikTokGenerator) {
        console.warn('API failed, falling back to deeplink', error);
        const fallback = new DeeplinkGenerator();
        result = await fallback.generate({
          userId: request.userId,
          merchant,
          originalUrl: request.originalUrl,
          clickId,
          linkType: request.linkType
        });
        result.generationMethod = 'deeplink-fallback';
      } else {
        throw error;
      }
    }

    // 6. Save to database
    const affiliateLink = await supabaseAdmin
      .from('affiliate_links')
      .insert({
        user_id: request.userId,
        review_id: request.reviewId,
        merchant_id: request.merchantId,
        original_url: request.originalUrl,
        affiliate_url: result.affiliateUrl,
        short_url: result.shortUrl,
        click_id: clickId,
        aff_sid: result.affSid,
        link_type: request.linkType,
        generation_method: result.generationMethod,
        utm_source: result.utmParams.utm_source,
        utm_medium: result.utmParams.utm_medium,
        utm_campaign: result.utmParams.utm_campaign,
        utm_content: result.utmParams.utm_content,
        utm_term: result.utmParams.utm_term,
        sub1: result.subParams.sub1,
        sub2: result.subParams.sub2,
        sub3: result.subParams.sub3,
        sub4: result.subParams.sub4,
        sub5: request.reviewId,
        label: request.label,
        product_name: request.productName,
        product_image: request.productImage,
        product_price: request.productPrice
      })
      .select()
      .single();

    if (affiliateLink.error) {
      throw new Error(`Failed to save affiliate link: ${affiliateLink.error.message}`);
    }

    return affiliateLink.data;
  }

  /**
   * Select best generator based on merchant and settings
   */
  private selectGenerator(merchant: Merchant, url: string, method?: string) {
    // Force specific method if requested
    if (method === 'deeplink') {
      return new DeeplinkGenerator();
    }

    // TikTok Shop detection
    if (this.isTikTokShopUrl(url)) {
      return new TikTokGenerator(process.env.ACCESSTRADE_TOKEN!);
    }

    // Use API for AccessTrade merchants if available
    if (merchant.platform === 'accesstrade' && process.env.ACCESSTRADE_TOKEN) {
      if (method === 'api' || method === 'auto') {
        return new AccessTradeGenerator(process.env.ACCESSTRADE_TOKEN);
      }
    }

    // Default to deeplink
    return new DeeplinkGenerator();
  }

  private isTikTokShopUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  }

  private async getMerchant(id: string) {
    const { data } = await supabaseAdmin
      .from('merchants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    return data;
  }

  private validateProductUrl(url: string, merchantDomain: string) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');

    if (!domain.includes(merchantDomain)) {
      throw new Error(`URL không thuộc merchant ${merchantDomain}`);
    }
  }
}
```

---

### Phase 3: API Endpoints

```typescript
// app/api/affiliate/create/route.ts
/**
 * POST /api/affiliate/create
 * Create affiliate link
 */
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    reviewId,
    merchantId,
    originalUrl,
    linkType,
    label,
    productName,
    productImage,
    productPrice,
    generationMethod
  } = body;

  // Validation
  if (!merchantId || !originalUrl || !linkType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const linkService = new AffiliateLinkService();
    const affiliateLink = await linkService.createAffiliateLink({
      userId,
      reviewId,
      merchantId,
      originalUrl,
      linkType,
      label,
      productName,
      productImage,
      productPrice,
      generationMethod
    });

    return NextResponse.json({
      success: true,
      data: affiliateLink
    });
  } catch (error) {
    console.error('Create affiliate link error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// app/api/affiliate/click/[id]/route.ts
/**
 * GET /api/affiliate/click/:click_id
 * Track click and redirect
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const clickId = params.id;

  try {
    // 1. Get affiliate link
    const { data: link } = await supabaseAdmin
      .from('affiliate_links')
      .select('*')
      .eq('click_id', clickId)
      .single();

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // 2. Log click event
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');

    await supabaseAdmin.from('clicks').insert({
      affiliate_link_id: link.id,
      user_id: null, // Anonymous click
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      source_type: 'review_page',
      source_id: link.review_id
    });

    // 3. Increment click count
    await supabaseAdmin
      .from('affiliate_links')
      .update({ clicks_count: link.clicks_count + 1 })
      .eq('id', link.id);

    // 4. Redirect to affiliate URL
    return NextResponse.redirect(link.affiliate_url, 302);

  } catch (error) {
    console.error('Click tracking error:', error);
    // Still redirect even if tracking fails
    return NextResponse.redirect('https://shopee.vn', 302);
  }
}

// app/api/affiliate/analytics/route.ts
/**
 * GET /api/affiliate/analytics
 * Get affiliate link analytics
 */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('review_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    const analyticsService = new AnalyticsService();
    const stats = await analyticsService.getAffiliateStats({
      userId,
      reviewId,
      startDate,
      endDate
    });

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// app/api/webhook/accesstrade/route.ts
/**
 * POST /api/webhook/accesstrade
 * Receive conversion webhooks from AccessTrade
 */
export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get('x-accesstrade-signature');
  // TODO: Implement signature verification

  const body = await request.json();

  try {
    const trackingService = new TrackingService();
    await trackingService.processConversion(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### Phase 4: UI Components

**4.1. Affiliate Links Manager** (trong Review Edit Page)

```tsx
// components/affiliate/AffiliateLinksManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Copy, Trash, ExternalLink, TrendingUp } from 'lucide-react';

interface AffiliateLink {
  id: string;
  merchant: {
    name: string;
    logo_url: string;
  };
  affiliate_url: string;
  short_url?: string;
  label?: string;
  clicks_count: number;
  conversions_count: number;
  total_commission: number;
}

export function AffiliateLinksManager({ reviewId }: { reviewId: string }) {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadLinks();
  }, [reviewId]);

  const loadLinks = async () => {
    const response = await fetch(`/api/affiliate?review_id=${reviewId}`);
    const data = await response.json();
    if (data.success) {
      setLinks(data.data);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show toast
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Affiliate Links ({links.length})
        </h3>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Link
        </Button>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.map((link) => (
          <div key={link.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={link.merchant.logo_url}
                  alt={link.merchant.name}
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{link.label || link.merchant.name}</div>
                  <div className="text-sm text-gray-500 truncate max-w-md">
                    {link.short_url || link.affiliate_url}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(link.short_url || link.affiliate_url)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(link.affiliate_url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(link.id)}
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{link.clicks_count}</span>
                <span className="text-gray-500">clicks</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-green-600">
                  {link.conversions_count}
                </span>
                <span className="text-gray-500">conversions</span>
              </div>
              {link.total_commission > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-purple-600">
                    {formatCurrency(link.total_commission)}
                  </span>
                  <span className="text-gray-500">earned</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <AddAffiliateLinkForm
          reviewId={reviewId}
          onSuccess={() => {
            setShowAddForm(false);
            loadLinks();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
```

**4.2. User Earnings Dashboard**

```tsx
// app/dashboard/earnings/page.tsx
export default function EarningsPage() {
  const [stats, setStats] = useState({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_clicks: 0,
    total_conversions: 0,
    conversion_rate: 0
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Thu Nhập</h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Số Dư Khả Dụng</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.available_balance)}
                </h3>
              </div>
              <Wallet className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang Chờ Duyệt</p>
                <h3 className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats.pending_balance)}
                </h3>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng Thu Nhập</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.total_earned)}
                </h3>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats & Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Clicks</span>
                <span className="font-bold">{stats.total_clicks}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Conversions</span>
                <span className="font-bold">{stats.total_conversions}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Rate</span>
                <span className="font-bold text-green-600">
                  {stats.conversion_rate.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {/* List top performing reviews */}
          </CardContent>
        </Card>
      </div>

      {/* Conversions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversionsTable userId={userId} />
        </CardContent>
      </Card>

      {/* Withdraw Button */}
      <Button size="lg" onClick={() => setShowWithdrawModal(true)}>
        Rút Tiền
      </Button>
    </div>
  );
}
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Foundation** (Week 1-2)

**Goal**: Setup database and core types

- [ ] Create database migrations
  - [ ] `merchants` table
  - [ ] `affiliate_links` table
  - [ ] `clicks` table
  - [ ] `conversions` table
  - [ ] `withdraw_requests` table
  - [ ] Alter `users` table (add balance columns)
- [ ] Seed merchants data (Shopee, Lazada, TikTok Shop)
- [ ] Define TypeScript types in `lib/affiliate/types`
- [ ] Setup environment variables (ACCESSTRADE_TOKEN, ISCLIX_PUBLISHER_ID)

**Deliverable**: Database ready, types defined

---

### **Phase 2: Link Generation** (Week 2-3)

**Goal**: Implement link generation services

- [ ] Port generators from Cashback system:
  - [ ] `DeeplinkGenerator` - Manual deeplink
  - [ ] `AccessTradeGenerator` - API v1
  - [ ] `TikTokGenerator` - API v2
- [ ] Implement `AffiliateLinkService`:
  - [ ] `createAffiliateLink()`
  - [ ] Auto-fallback logic
  - [ ] URL validation
- [ ] Implement `MerchantService`:
  - [ ] CRUD operations
  - [ ] Get active merchants
- [ ] Write unit tests for generators

**Deliverable**: Working link generation

---

### **Phase 3: API Layer** (Week 3-4)

**Goal**: Expose functionality via API

- [ ] Implement API endpoints:
  - [ ] `POST /api/affiliate/create`
  - [ ] `GET /api/affiliate/click/:id` (redirect + track)
  - [ ] `GET /api/affiliate?review_id=xxx`
  - [ ] `DELETE /api/affiliate/:id`
- [ ] Add authentication middleware
- [ ] Add RBAC checks (user can only manage their links)
- [ ] Write API tests

**Deliverable**: API working and tested

---

### **Phase 4: UI Integration** (Week 4-5)

**Goal**: Add UI to review editor

- [ ] Create components:
  - [ ] `AffiliateLinksManager`
  - [ ] `AddAffiliateLinkForm`
  - [ ] `AffiliateLinkCard`
  - [ ] `MerchantSelector`
- [ ] Integrate into Review Edit Page:
  - [ ] Add "Affiliate" tab
  - [ ] Load links on mount
  - [ ] Add/edit/delete links
  - [ ] Copy link to clipboard
- [ ] Add inline stats display
- [ ] User testing

**Deliverable**: UI working in review editor

---

### **Phase 5: Click Tracking** (Week 5)

**Goal**: Track clicks and show analytics

- [ ] Implement `TrackingService`:
  - [ ] `trackClick()`
  - [ ] `getClickStats()`
- [ ] Setup click redirect endpoint
- [ ] Log IP, user agent, referrer
- [ ] Increment click counters
- [ ] Add click analytics to review page

**Deliverable**: Click tracking working

---

### **Phase 6: Conversion Tracking** (Week 6)

**Goal**: Match conversions from AccessTrade

- [ ] Implement `TrackingService.processConversion()`:
  - [ ] PRIMARY matching via `utm_content`
  - [ ] BACKUP matching via `sub2`
  - [ ] Calculate cashback (70% commission)
  - [ ] Update user balances
- [ ] Create webhook endpoint:
  - [ ] `POST /api/webhook/accesstrade`
  - [ ] Verify signature
  - [ ] Process conversion data
- [ ] Setup cron job (background sync):
  - [ ] Fetch conversions from API every 6 hours
  - [ ] Retry unmatched clicks
- [ ] Test with sample conversion data

**Deliverable**: Conversion matching working

---

### **Phase 7: User Dashboard** (Week 7)

**Goal**: Show earnings and stats

- [ ] Create Earnings page:
  - [ ] Balance cards
  - [ ] Performance stats
  - [ ] Conversions table
  - [ ] Top reviews
- [ ] Create Conversions page:
  - [ ] List all conversions
  - [ ] Filters (status, date range)
  - [ ] Pagination
- [ ] Add withdraw request feature (basic)

**Deliverable**: User can see earnings

---

### **Phase 8: Admin Features** (Week 8)

**Goal**: Admin monitoring and management

- [ ] Merchants management:
  - [ ] CRUD UI
  - [ ] Configure campaign_id
  - [ ] Enable/disable merchants
- [ ] Conversions monitoring:
  - [ ] List all conversions
  - [ ] Search by user/merchant
  - [ ] Sync from AccessTrade
  - [ ] Manual status update
- [ ] Analytics dashboard:
  - [ ] Total clicks/conversions
  - [ ] Top users
  - [ ] Top merchants
  - [ ] Charts

**Deliverable**: Admin can manage system

---

### **Phase 9: Testing & Polish** (Week 9)

**Goal**: Ensure quality and fix bugs

- [ ] End-to-end testing:
  - [ ] Create review → Add link → Click → Convert
  - [ ] Verify balance updates
  - [ ] Test all fallback scenarios
- [ ] Performance testing:
  - [ ] Load test API endpoints
  - [ ] Optimize slow queries
  - [ ] Add caching where needed
- [ ] UI/UX improvements:
  - [ ] Better error messages
  - [ ] Loading states
  - [ ] Animations
- [ ] Documentation:
  - [ ] API docs
  - [ ] User guide
  - [ ] Admin guide

**Deliverable**: Production-ready system

---

## 💡 KEY DECISIONS & TRADE-OFFS

### 1. **Database: Separate Table vs JSONB**

**Decision**: Use separate `affiliate_links` table

**Why:**
- ✅ Better querying performance
- ✅ Foreign key constraints
- ✅ Indexing on click_id, utm_content
- ✅ Easier to aggregate stats
- ❌ More complex schema

**Alternative**: Keep `affiliate_links` as JSONB in `reviews` table
- ✅ Simpler schema
- ❌ Poor query performance
- ❌ No referential integrity
- ❌ Harder to track clicks/conversions

### 2. **Link Generation: Always API vs Fallback**

**Decision**: Try API first, fallback to deeplink

**Why:**
- ✅ Best of both worlds: API features + reliability
- ✅ No downtime if API fails
- ✅ Better tracking attribution with official API
- ❌ More complex error handling

**Alternative**: Always use deeplink
- ✅ Simpler code
- ✅ No API rate limits
- ❌ Lower conversion match rate

### 3. **Tracking: Single vs Dual Parameters**

**Decision**: Use both `utm_content` (PRIMARY) and `sub2` (BACKUP)

**Why:**
- ✅ Redundancy improves match rate
- ✅ Some platforms drop UTM params
- ✅ Sub params more stable
- ❌ Slightly more complex matching logic

### 4. **Balance: Real-time vs Batch Update**

**Decision**: Batch update via cron job (every 6 hours)

**Why:**
- ✅ Reduces API calls
- ✅ More reliable (retry on failure)
- ✅ Less load on database
- ❌ Not real-time (acceptable for cashback use case)

**Alternative**: Real-time via webhook
- ✅ Instant updates
- ❌ Webhook reliability issues
- ❌ More API calls

---

## 🎨 UI/UX MOCKUPS

### Review Edit Page - Affiliate Tab

```
┌─────────────────────────────────────────────────────────────┐
│ Tabs: [Nội dung] [Ưu/Nhược] [Affiliate] [Facebook]         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Affiliate Links (3)                      [+ Thêm Link]    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🛒 Shopee - Mua tại Shopee (Giảm 50%)                │ │
│  │ https://shorten.accesstrade.me/abc123                 │ │
│  │ 👁️ 245 clicks  •  ✅ 12 conversions  •  💰 350.000đ   │ │
│  │ [📋 Copy] [📊 Stats] [🗑️ Delete]                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🛍️ Lazada - Giá tốt tại Lazada                       │ │
│  │ https://go.isclix.com/deep_link/...                   │ │
│  │ 👁️ 89 clicks  •  ✅ 3 conversions  •  💰 85.000đ      │ │
│  │ [📋 Copy] [📊 Stats] [🗑️ Delete]                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🎵 TikTok Shop - Mua ngay trên TikTok                 │ │
│  │ https://vt.tiktok.com/xyz789/                         │ │
│  │ 👁️ 156 clicks  •  ✅ 8 conversions  •  💰 220.000đ    │ │
│  │ [📋 Copy] [📊 Stats] [🗑️ Delete]                      │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Add Link Form

```
┌─────────────────────────────────────────────────────────────┐
│ Thêm Affiliate Link                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Link Type:  ⚪ Trang chủ (Button)  ⚫ Sản phẩm (Product)   │
│                                                             │
│  Merchant: [Shopee ▼]                                      │
│                                                             │
│  Product URL: [https://shopee.vn/may-pha-ca-phe...       ] │
│                                                             │
│  Label (optional): [Mua tại Shopee - Giảm 50%            ] │
│                                                             │
│  Generation Method: [⚪ Auto  ⚪ API  ⚫ Deeplink]          │
│                                                             │
│                               [Cancel]  [Create Link]      │
└─────────────────────────────────────────────────────────────┘
```

### Earnings Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ Thu Nhập                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Số Dư KD     │  │ Chờ Duyệt    │  │ Tổng Thu     │     │
│  │ 1.250.000đ   │  │ 450.000đ     │  │ 5.680.000đ   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  Performance                     Top Reviews               │
│  ┌────────────────────────┐     ┌──────────────────────┐  │
│  │ Total Clicks: 1,234    │     │ 1. iPhone 15 Review  │  │
│  │ Conversions: 87        │     │    250 clicks        │  │
│  │ Rate: 7.1%             │     │ 2. Máy pha cà phê    │  │
│  └────────────────────────┘     │    189 clicks        │  │
│                                  └──────────────────────┘  │
│                                                             │
│  Recent Conversions                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Order     │ Merchant │ Amount    │ Cashback │ Status  │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ #12345    │ Shopee   │ 2.500.000 │ 75.000   │ Pending │ │
│  │ #12344    │ Lazada   │ 1.200.000 │ 36.000   │ Approved│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                                          [Rút Tiền]        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 SUCCESS METRICS

### Technical Metrics

- **Link Generation Success Rate**: > 95%
- **API Response Time**: < 2s
- **Conversion Match Rate**: > 80%
- **System Uptime**: > 99.5%

### Business Metrics

- **Average Clicks per Review**: > 50
- **Click-to-Conversion Rate**: > 5%
- **User Earnings Growth**: +20% month-over-month
- **Active Users with Conversions**: > 30%

---

## 🔒 SECURITY CONSIDERATIONS

1. **API Token Protection**
   - Store AccessTrade token in environment variables
   - Never expose in client-side code
   - Rotate tokens quarterly

2. **Webhook Verification**
   - Verify AccessTrade webhook signatures
   - Whitelist webhook IP addresses
   - Log all webhook attempts

3. **Click Fraud Prevention**
   - Rate limit click tracking endpoint
   - Detect suspicious patterns (same IP multiple clicks)
   - Admin alerts for unusual activity

4. **User Balance Protection**
   - Transaction logs for all balance changes
   - Double-entry accounting
   - Manual verification for large withdrawals

---

## 📝 NEXT STEPS

**Immediate Actions:**

1. ✅ Review this plan with stakeholders
2. ✅ Set up development environment
3. ✅ Create GitHub project board
4. ✅ Start Phase 1: Database migrations

**Questions to Resolve:**

1. Commission split: What % goes to users? (Suggest: 70% user, 30% platform)
2. Minimum withdrawal amount? (Suggest: 100.000đ)
3. Payment methods support? (Suggest: Bank transfer, Momo)
4. AccessTrade API credentials: Who provides?

---

## 🎯 CONCLUSION

Kế hoạch này tích hợp đầy đủ tính năng affiliate link tracking từ Cashback System vào Video Affiliate App với:

✅ **Proven Architecture**: Sử dụng kiến trúc đã test thực tế
✅ **Scalability**: Handle thousands of conversions/day
✅ **Reliability**: Fallback mechanisms, retry logic
✅ **User-Friendly**: Simple UI, clear stats
✅ **Admin Control**: Full monitoring and management

**Estimated Timeline**: 9 weeks (2.5 months)
**Team Size**: 1-2 developers

Ready to start Phase 1!
