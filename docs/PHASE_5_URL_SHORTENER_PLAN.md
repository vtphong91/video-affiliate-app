# Phase 5: Custom URL Shortener - Implementation Plan

## 📋 Overview

Phase 5 tạo hệ thống URL shortener tự host để:
1. **Giải quyết vấn đề Facebook spam detection** với long URLs
2. **Branded short URLs** (vdaff.link/abc123) tăng trust
3. **Click tracking tích hợp** với affiliate system
4. **Link management** (expiration, refresh, analytics)

**Ưu tiên**: HIGH (Critical for Facebook posting)
**Thời gian ước tính**: 3-4 ngày

---

## 🎯 Goals

### Primary Goals
1. ✅ Shorten long affiliate URLs (280+ chars → 25 chars)
2. ✅ Prevent Facebook spam detection
3. ✅ Track clicks accurately
4. ✅ Branded domain support

### Secondary Goals
1. ✅ Link expiration & auto-refresh
2. ✅ QR code generation
3. ✅ Analytics integration
4. ✅ A/B testing support

---

## 🗄️ Database Schema

### Table: `short_urls`

```sql
CREATE TABLE short_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,

  -- Affiliate tracking integration
  review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
  aff_sid VARCHAR(100),
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,

  -- Metadata
  title VARCHAR(255),
  description TEXT,

  -- Click tracking
  clicks INT DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Link management
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- User tracking
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- A/B testing
  variant VARCHAR(50),

  -- Indexes
  CONSTRAINT short_code_length CHECK (char_length(short_code) >= 4 AND char_length(short_code) <= 10)
);

-- Indexes for performance
CREATE INDEX idx_short_urls_short_code ON short_urls(short_code) WHERE is_active = true;
CREATE INDEX idx_short_urls_review_id ON short_urls(review_id);
CREATE INDEX idx_short_urls_aff_sid ON short_urls(aff_sid);
CREATE INDEX idx_short_urls_created_by ON short_urls(created_by);
CREATE INDEX idx_short_urls_expires_at ON short_urls(expires_at) WHERE is_active = true;

-- Comments
COMMENT ON TABLE short_urls IS 'Custom URL shortener for affiliate links';
COMMENT ON COLUMN short_urls.short_code IS 'Base62 encoded short code (e.g., abc123)';
COMMENT ON COLUMN short_urls.aff_sid IS 'Reference to affiliate link tracking ID';
```

### Table: `short_url_clicks` (Optional - for detailed analytics)

```sql
CREATE TABLE short_url_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_url_id UUID NOT NULL REFERENCES short_urls(id) ON DELETE CASCADE,

  -- Click metadata
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,

  -- Geo-location (optional - can add later)
  country VARCHAR(2),
  city VARCHAR(100),

  -- Device info
  device_type VARCHAR(20), -- mobile, desktop, tablet
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Index
  CONSTRAINT short_url_clicks_short_url_id_fkey FOREIGN KEY (short_url_id) REFERENCES short_urls(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_short_url_clicks_short_url_id ON short_url_clicks(short_url_id);
CREATE INDEX idx_short_url_clicks_clicked_at ON short_url_clicks(clicked_at DESC);

-- Partition by time (optional - for scalability)
-- Can add later if needed
```

---

## 🔧 Technical Implementation

### 1. Short Code Generation Service

**File**: `lib/shortener/services/short-code-generator.ts`

```typescript
/**
 * Short Code Generator
 * Uses Base62 encoding for short, readable URLs
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class ShortCodeGenerator {
  /**
   * Generate short code from UUID
   * UUID → Numeric hash → Base62
   */
  generateFromUUID(uuid: string): string {
    // Remove hyphens and take first 16 chars
    const hex = uuid.replace(/-/g, '').substring(0, 16);

    // Convert hex to number
    const num = BigInt('0x' + hex);

    // Encode to base62
    return this.encodeBase62(num, 6);
  }

  /**
   * Generate short code from timestamp + random
   * For unique, collision-resistant codes
   */
  generateFromTimestamp(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const combined = BigInt(timestamp) * BigInt(100000) + BigInt(random);

    return this.encodeBase62(combined, 8);
  }

  /**
   * Encode number to Base62
   */
  private encodeBase62(num: bigint, minLength: number = 6): string {
    if (num === 0n) return BASE62_CHARS[0].repeat(minLength);

    let result = '';
    let n = num;

    while (n > 0n) {
      const remainder = Number(n % 62n);
      result = BASE62_CHARS[remainder] + result;
      n = n / 62n;
    }

    // Pad to minimum length
    while (result.length < minLength) {
      result = BASE62_CHARS[0] + result;
    }

    return result;
  }

  /**
   * Decode Base62 to number
   */
  decodeBase62(code: string): bigint {
    let result = 0n;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const value = BASE62_CHARS.indexOf(char);

      if (value === -1) {
        throw new Error(`Invalid character in short code: ${char}`);
      }

      result = result * 62n + BigInt(value);
    }

    return result;
  }

  /**
   * Validate short code format
   */
  isValidCode(code: string): boolean {
    if (!code || code.length < 4 || code.length > 10) {
      return false;
    }

    // Check all chars are in BASE62_CHARS
    for (const char of code) {
      if (!BASE62_CHARS.includes(char)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate unique code with collision check
   */
  async generateUniqueCode(checkExists: (code: string) => Promise<boolean>): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = this.generateFromTimestamp();

      const exists = await checkExists(code);
      if (!exists) {
        return code;
      }

      attempts++;
      // Add small delay to avoid same timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    throw new Error('Failed to generate unique short code after 10 attempts');
  }
}

export const shortCodeGenerator = new ShortCodeGenerator();
```

---

### 2. URL Shortener Service

**File**: `lib/shortener/services/url-shortener-service.ts`

```typescript
import { supabaseAdmin } from '@/lib/db/supabase';
import { shortCodeGenerator } from './short-code-generator';

export interface CreateShortUrlRequest {
  originalUrl: string;
  reviewId?: string;
  affSid?: string;
  merchantId?: string;
  userId: string;
  title?: string;
  description?: string;
  expiresInDays?: number;
  variant?: string;
}

export interface ShortUrl {
  id: string;
  short_code: string;
  original_url: string;
  review_id?: string;
  aff_sid?: string;
  merchant_id?: string;
  title?: string;
  description?: string;
  clicks: number;
  last_clicked_at?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  created_by: string;
  variant?: string;
}

export interface ShortUrlStats {
  total_clicks: number;
  unique_ips: number;
  last_30_days_clicks: number;
  top_referrers: Array<{ referrer: string; count: number }>;
  device_breakdown: { mobile: number; desktop: number; tablet: number };
}

class UrlShortenerService {
  /**
   * Create short URL
   */
  async createShortUrl(request: CreateShortUrlRequest): Promise<ShortUrl> {
    // Validate original URL
    try {
      new URL(request.originalUrl);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Generate unique short code
    const checkExists = async (code: string): Promise<boolean> => {
      const { data } = await supabaseAdmin
        .from('short_urls')
        .select('id')
        .eq('short_code', code)
        .single();

      return !!data;
    };

    const shortCode = await shortCodeGenerator.generateUniqueCode(checkExists);

    // Calculate expiration
    let expiresAt: string | null = null;
    if (request.expiresInDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + request.expiresInDays);
      expiresAt = expireDate.toISOString();
    }

    // Insert to database
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .insert({
        short_code: shortCode,
        original_url: request.originalUrl,
        review_id: request.reviewId || null,
        aff_sid: request.affSid || null,
        merchant_id: request.merchantId || null,
        title: request.title || null,
        description: request.description || null,
        created_by: request.userId,
        expires_at: expiresAt,
        variant: request.variant || null
      })
      .select()
      .single();

    if (error) {
      console.error('Create short URL error:', error);
      throw new Error('Failed to create short URL');
    }

    return data;
  }

  /**
   * Get short URL by code
   */
  async getByCode(shortCode: string): Promise<ShortUrl | null> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Check expiration
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        // Mark as inactive
        await this.deactivateShortUrl(data.id);
        return null;
      }
    }

    return data;
  }

  /**
   * Track click
   */
  async trackClick(
    shortUrlId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      referrer?: string;
    }
  ): Promise<void> {
    // Increment counter
    const { error: updateError } = await supabaseAdmin
      .from('short_urls')
      .update({
        clicks: supabaseAdmin.raw('clicks + 1'),
        last_clicked_at: new Date().toISOString()
      })
      .eq('id', shortUrlId);

    if (updateError) {
      console.error('Failed to update click counter:', updateError);
    }

    // Log detailed click (optional - only if short_url_clicks table exists)
    // Can be toggled via feature flag
    if (process.env.ENABLE_DETAILED_CLICK_TRACKING === 'true') {
      await this.logDetailedClick(shortUrlId, metadata);
    }
  }

  /**
   * Log detailed click info
   */
  private async logDetailedClick(
    shortUrlId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      referrer?: string;
    }
  ): Promise<void> {
    const deviceType = this.detectDeviceType(metadata.userAgent);
    const browserInfo = this.parseBrowser(metadata.userAgent);

    const { error } = await supabaseAdmin
      .from('short_url_clicks')
      .insert({
        short_url_id: shortUrlId,
        user_agent: metadata.userAgent?.substring(0, 500) || null,
        ip_address: metadata.ipAddress || null,
        referrer: metadata.referrer?.substring(0, 500) || null,
        device_type: deviceType,
        browser: browserInfo.browser,
        os: browserInfo.os
      });

    if (error) {
      console.error('Failed to log detailed click:', error);
    }
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Parse browser and OS from user agent
   */
  private parseBrowser(userAgent?: string): { browser: string; os: string } {
    if (!userAgent) return { browser: 'unknown', os: 'unknown' };

    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = 'unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    // OS detection
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { browser, os };
  }

  /**
   * Get short URLs by review
   */
  async getByReview(reviewId: string): Promise<ShortUrl[]> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('review_id', reviewId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get short URLs error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get short URLs by user
   */
  async getByUser(userId: string, limit: number = 50): Promise<ShortUrl[]> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('created_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get user short URLs error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Deactivate short URL
   */
  async deactivateShortUrl(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('short_urls')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Deactivate short URL error:', error);
      throw new Error('Failed to deactivate short URL');
    }
  }

  /**
   * Refresh expired link
   */
  async refreshShortUrl(id: string, expiresInDays: number = 90): Promise<ShortUrl> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expiresInDays);

    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .update({
        expires_at: expireDate.toISOString(),
        is_active: true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Refresh short URL error:', error);
      throw new Error('Failed to refresh short URL');
    }

    return data;
  }

  /**
   * Get statistics
   */
  async getStats(shortUrlId: string): Promise<ShortUrlStats> {
    // Get basic stats from short_urls table
    const { data: shortUrl } = await supabaseAdmin
      .from('short_urls')
      .select('clicks, created_at')
      .eq('id', shortUrlId)
      .single();

    if (!shortUrl) {
      throw new Error('Short URL not found');
    }

    // If detailed tracking enabled, get from clicks table
    if (process.env.ENABLE_DETAILED_CLICK_TRACKING === 'true') {
      return this.getDetailedStats(shortUrlId);
    }

    // Basic stats
    return {
      total_clicks: shortUrl.clicks || 0,
      unique_ips: 0, // Not tracked in basic mode
      last_30_days_clicks: shortUrl.clicks || 0, // Approximation
      top_referrers: [],
      device_breakdown: { mobile: 0, desktop: 0, tablet: 0 }
    };
  }

  /**
   * Get detailed statistics
   */
  private async getDetailedStats(shortUrlId: string): Promise<ShortUrlStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total clicks
    const { count: totalClicks } = await supabaseAdmin
      .from('short_url_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('short_url_id', shortUrlId);

    // Unique IPs
    const { data: uniqueIpData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('ip_address')
      .eq('short_url_id', shortUrlId);

    const uniqueIps = new Set(uniqueIpData?.map(r => r.ip_address).filter(Boolean)).size;

    // Last 30 days
    const { count: last30Days } = await supabaseAdmin
      .from('short_url_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('short_url_id', shortUrlId)
      .gte('clicked_at', thirtyDaysAgo.toISOString());

    // Top referrers
    const { data: referrerData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('referrer')
      .eq('short_url_id', shortUrlId)
      .not('referrer', 'is', null);

    const referrerCounts: Record<string, number> = {};
    referrerData?.forEach(r => {
      if (r.referrer) {
        referrerCounts[r.referrer] = (referrerCounts[r.referrer] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown
    const { data: deviceData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('device_type')
      .eq('short_url_id', shortUrlId);

    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
    deviceData?.forEach(r => {
      if (r.device_type === 'mobile') deviceBreakdown.mobile++;
      else if (r.device_type === 'desktop') deviceBreakdown.desktop++;
      else if (r.device_type === 'tablet') deviceBreakdown.tablet++;
    });

    return {
      total_clicks: totalClicks || 0,
      unique_ips: uniqueIps,
      last_30_days_clicks: last30Days || 0,
      top_referrers: topReferrers,
      device_breakdown: deviceBreakdown
    };
  }
}

export const urlShortenerService = new UrlShortenerService();
```

---

## 📡 API Endpoints

### 1. Create Short URL

**File**: `app/api/shortener/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';

export const dynamic = 'force-dynamic';

interface CreateShortUrlRequest {
  originalUrl: string;
  reviewId?: string;
  affSid?: string;
  merchantId?: string;
  title?: string;
  description?: string;
  expiresInDays?: number;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateShortUrlRequest = await request.json();
    const { originalUrl, reviewId, affSid, merchantId, title, description, expiresInDays } = body;

    // Validation
    if (!originalUrl) {
      return NextResponse.json(
        { success: false, error: 'originalUrl is required' },
        { status: 400 }
      );
    }

    // Create short URL
    const shortUrl = await urlShortenerService.createShortUrl({
      originalUrl,
      reviewId,
      affSid,
      merchantId,
      userId,
      title,
      description,
      expiresInDays: expiresInDays || 90 // Default 90 days
    });

    // Build full short URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fullShortUrl = `${baseUrl}/s/${shortUrl.short_code}`;

    return NextResponse.json({
      success: true,
      data: {
        ...shortUrl,
        short_url: fullShortUrl
      },
      message: 'Short URL created successfully'
    });

  } catch (error) {
    console.error('Create short URL error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create short URL'
      },
      { status: 500 }
    );
  }
}
```

### 2. Redirect Short URL (Public)

**File**: `app/s/[code]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    // Get short URL
    const shortUrl = await urlShortenerService.getByCode(code);

    if (!shortUrl) {
      // Return 404 page
      return new NextResponse('Short URL not found or expired', { status: 404 });
    }

    // Track click (async, don't wait)
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     undefined;
    const referrer = request.headers.get('referer') || undefined;

    urlShortenerService.trackClick(shortUrl.id, {
      userAgent,
      ipAddress,
      referrer
    }).catch(err => {
      console.error('Click tracking failed:', err);
    });

    // Redirect to original URL
    return NextResponse.redirect(shortUrl.original_url, { status: 302 });

  } catch (error) {
    console.error('Short URL redirect error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
```

### 3. Get Short URL Stats

**File**: `app/api/shortener/[id]/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get stats
    const stats = await urlShortenerService.getStats(id);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get short URL stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats'
      },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Integration

### Integration Point 1: Auto-Shorten Generated Links

**File**: `app/api/affiliate-links/generate/route.ts`

```typescript
// After generating affiliate link
const affiliateUrl = result.affiliateUrl;
const shortUrl = result.shortUrl; // From AccessTrade

// If no short URL from AccessTrade, create our own
if (!shortUrl) {
  const customShortUrl = await urlShortenerService.createShortUrl({
    originalUrl: affiliateUrl,
    affSid: result.affSid,
    merchantId: merchant.id,
    userId,
    title: `${merchant.name} - Product Link`,
    expiresInDays: 90
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  result.shortUrl = `${baseUrl}/s/${customShortUrl.short_code}`;
}
```

### Integration Point 2: Bulk Generate with Auto-Shortening

**File**: `app/api/affiliate-links/bulk-generate/route.ts`

Similar integration as above for each generated link.

### Integration Point 3: Link Management UI

**File**: `app/dashboard/short-links/page.tsx` (New page)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ExternalLink, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ShortLinksPage() {
  const [shortLinks, setShortLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's short links
  // Display in table with: short_code, original_url, clicks, created_at
  // Actions: Copy, Stats, Refresh, Deactivate

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Short Links Management</h1>

      {/* Links table */}
      {/* Stats modal */}
      {/* Refresh confirmation */}
    </div>
  );
}
```

---

## 🧪 Testing Plan

### Unit Tests
- [ ] Short code generation (unique, valid format)
- [ ] Base62 encoding/decoding
- [ ] URL validation
- [ ] Expiration logic

### Integration Tests
- [ ] Create short URL → verify in database
- [ ] Redirect → verify tracking
- [ ] Get stats → verify calculations
- [ ] Refresh expired link

### End-to-End Tests
- [ ] Generate affiliate link → auto-shorten → save review
- [ ] Click short link → redirect → track click
- [ ] View stats dashboard
- [ ] Refresh link → verify new expiration

---

## 🚀 Implementation Steps

### Step 1: Database Migration (Day 1)
- Create `short_urls` table
- Create `short_url_clicks` table (optional)
- Add indexes
- Test on local

### Step 2: Core Services (Day 1-2)
- Implement `short-code-generator.ts`
- Implement `url-shortener-service.ts`
- Unit tests

### Step 3: API Endpoints (Day 2)
- `/api/shortener/create` (POST)
- `/s/[code]` redirect (GET)
- `/api/shortener/[id]/stats` (GET)

### Step 4: Integration (Day 3)
- Integrate with `generate` endpoint
- Integrate with `bulk-generate` endpoint
- Update review edit UI to show short links

### Step 5: Management UI (Day 3-4)
- Short links dashboard page
- Stats visualization
- Refresh/deactivate actions

### Step 6: Testing & Deployment (Day 4)
- Full testing suite
- Documentation
- Deploy to production

---

## 📊 Success Metrics

- [ ] Short URL generation success rate: >99%
- [ ] Redirect latency: <100ms
- [ ] Click tracking accuracy: 100%
- [ ] Facebook spam detection: 0% (vs previous)
- [ ] User adoption: 80%+ reviews use short links

---

## 🎯 Optional Enhancements

### QR Code Generation
- Generate QR codes for short URLs
- Use in offline marketing materials

### Custom Slugs
- Allow users to set custom short codes
- e.g., `vdaff.link/shopee-sale`

### Link Bundles
- Group multiple short links
- Single QR code → landing page with all links

### Analytics Dashboard
- Visual charts for clicks over time
- Geographic distribution
- Device/browser breakdown

---

## ✅ Ready to Implement?

Phase 5 will complete the affiliate system with:
- ✅ Branded short URLs
- ✅ Facebook spam prevention
- ✅ Integrated click tracking
- ✅ Link management

Estimated timeline: **3-4 days**
