# Kế Hoạch Tích Hợp Core Affiliate Link Module

## 🎯 SCOPE - CHỈ TẬP TRUNG VÀO TẠO LINKS

### ✅ In Scope (Làm)
1. **Tạo affiliate links** cho products trong reviews
2. **3 phương thức** tạo link: Manual Deeplink, AccessTrade API, TikTok API
3. **Lưu trữ links** trong database
4. **UI quản lý links** trong review editor
5. **Copy link** để user sử dụng

### ❌ Out of Scope (Không làm - làm sau)
- ❌ Click tracking
- ❌ Conversion tracking
- ❌ User earnings/balances
- ❌ Cashback calculations
- ❌ Withdraw requests
- ❌ Analytics dashboard
- ❌ Admin monitoring
- ❌ Background jobs/cron

---

## 📊 KIẾN TRÚC TỐI GIẢN

### 1. Database Schema (Chỉ 2 tables)

```sql
-- ============================================================================
-- MERCHANTS TABLE
-- ============================================================================
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,

  -- Affiliate Config
  platform VARCHAR(50) NOT NULL, -- 'accesstrade', 'isclix'
  campaign_id VARCHAR(100) NOT NULL, -- AccessTrade campaign ID
  deep_link_base TEXT, -- Homepage URL

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO merchants (name, domain, platform, campaign_id, deep_link_base) VALUES
('Shopee', 'shopee.vn', 'accesstrade', '4751584435713464237', 'https://shopee.vn'),
('Lazada', 'lazada.vn', 'accesstrade', '4348614231480407268', 'https://lazada.vn'),
('Tiki', 'tiki.vn', 'accesstrade', 'YOUR_TIKI_CAMPAIGN_ID', 'https://tiki.vn'),
('TikTok Shop', 'tiktok.com', 'accesstrade', '4790392958945222748', 'https://vt.tiktok.com');

-- ============================================================================
-- AFFILIATE_LINKS TABLE
-- ============================================================================
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),

  -- Link Data
  original_url TEXT NOT NULL, -- Product URL hoặc homepage
  affiliate_url TEXT NOT NULL, -- Generated affiliate link
  short_url TEXT, -- From AccessTrade API (optional)

  -- Link Info
  link_type VARCHAR(20) NOT NULL, -- 'homepage' or 'product'
  generation_method VARCHAR(20) NOT NULL, -- 'api', 'deeplink', 'tiktok-api'
  label VARCHAR(255), -- User label (e.g., "Mua tại Shopee")

  -- Display
  display_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  INDEX idx_affiliate_links_review (review_id),
  INDEX idx_affiliate_links_user (user_id)
);
```

---

## 🏗️ CODE STRUCTURE (Simplified)

```
lib/affiliate/
├── generators/
│   ├── deeplink-generator.ts      # Manual deeplink (iSclix format)
│   ├── accesstrade-generator.ts   # AccessTrade API v1
│   ├── tiktok-generator.ts        # TikTok Shop API v2
│   └── index.ts
├── services/
│   ├── link-service.ts            # Main service - tạo links
│   └── merchant-service.ts        # Get merchants
├── utils/
│   ├── url-validator.ts           # Validate URLs
│   └── id-generator.ts            # Generate IDs
├── types.ts                       # TypeScript types
└── constants.ts                   # Publisher ID, config
```

---

## 🔧 IMPLEMENTATION PLAN

### Phase 1: Database Setup (30 phút)

**Tasks:**
- [ ] Tạo migration file cho 2 tables
- [ ] Run migration trong Supabase
- [ ] Seed merchants data (Shopee, Lazada, Tiki, TikTok)
- [ ] Verify tables created

**Files:**
- `sql/migrations/001-create-affiliate-tables.sql`

**SQL Migration:**
```sql
-- Create merchants table
CREATE TABLE merchants (...);

-- Create affiliate_links table
CREATE TABLE affiliate_links (...);

-- Seed merchants
INSERT INTO merchants VALUES (...);
```

---

### Phase 2: TypeScript Types (15 phút)

**Tasks:**
- [ ] Define core types
- [ ] Export from index

**Files:**
- `lib/affiliate/types.ts`

**Types:**
```typescript
export interface Merchant {
  id: string;
  name: string;
  domain: string;
  platform: 'accesstrade' | 'isclix';
  campaign_id: string;
  deep_link_base: string;
  logo_url?: string;
  is_active: boolean;
}

export interface AffiliateLink {
  id: string;
  user_id: string;
  review_id: string;
  merchant_id: string;
  original_url: string;
  affiliate_url: string;
  short_url?: string;
  link_type: 'homepage' | 'product';
  generation_method: 'api' | 'deeplink' | 'tiktok-api';
  label?: string;
}

export interface CreateLinkRequest {
  userId: string;
  reviewId: string;
  merchantId: string;
  originalUrl: string;
  linkType: 'homepage' | 'product';
  label?: string;
  method?: 'auto' | 'api' | 'deeplink';
}

export interface GenerateLinkResult {
  affiliateUrl: string;
  shortUrl?: string;
  affSid: string;
  generationMethod: string;
}
```

---

### Phase 3: Link Generators (2-3 giờ)

**Tasks:**
- [ ] Port DeeplinkGenerator từ code sample
- [ ] Implement AccessTradeGenerator
- [ ] Implement TikTokGenerator
- [ ] Add fallback logic

**Files:**
- `lib/affiliate/generators/deeplink-generator.ts`
- `lib/affiliate/generators/accesstrade-generator.ts`
- `lib/affiliate/generators/tiktok-generator.ts`
- `lib/affiliate/constants.ts`

**Key Code:**

```typescript
// constants.ts
export const ISCLIX_BASE = 'https://go.isclix.com/deep_link';
export const ISCLIX_PUBLISHER_ID = '4790392958945222748';
export const ACCESSTRADE_API_BASE = 'https://api.accesstrade.vn/v1';

// deeplink-generator.ts
export class DeeplinkGenerator {
  generate(params: GenerateParams): GenerateLinkResult {
    const affSid = this.generateAffSid(params.userId);
    const clickId = crypto.randomUUID();

    // Build URL: https://go.isclix.com/deep_link/{publisher}/{merchant}?url=...
    const url = `${ISCLIX_BASE}/${ISCLIX_PUBLISHER_ID}/${params.merchant.campaign_id}`;
    const queryParams = new URLSearchParams({
      url: params.originalUrl,
      utm_source: 'video-affiliate',
      utm_medium: params.userId,
      utm_campaign: 'review',
      utm_content: clickId,
      aff_sid: affSid
    });

    return {
      affiliateUrl: `${url}?${queryParams}`,
      affSid,
      generationMethod: 'deeplink'
    };
  }

  private generateAffSid(userId: string): string {
    return `${userId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  }
}

// accesstrade-generator.ts
export class AccessTradeGenerator {
  constructor(private apiToken: string) {}

  async generate(params: GenerateParams): Promise<GenerateLinkResult> {
    const response = await fetch(`${ACCESSTRADE_API_BASE}/product_link/create`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        campaign_id: params.merchant.campaign_id,
        urls: [params.originalUrl],
        url_enc: true,
        utm_source: 'video-affiliate',
        utm_medium: params.userId,
        utm_campaign: 'review',
        utm_content: crypto.randomUUID()
      })
    });

    const data = await response.json();

    if (!data.success || data.data.error_link.length > 0) {
      throw new Error('AccessTrade API failed');
    }

    const link = data.data.success_link[0];

    return {
      affiliateUrl: link.aff_link,
      shortUrl: link.short_link,
      affSid: this.generateAffSid(params.userId),
      generationMethod: 'api'
    };
  }

  private generateAffSid(userId: string): string {
    return `${userId}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  }
}

// tiktok-generator.ts (similar structure)
```

---

### Phase 4: Link Service (1 giờ)

**Tasks:**
- [ ] Implement AffiliateLinkService
- [ ] Add auto-fallback logic
- [ ] Add validation

**Files:**
- `lib/affiliate/services/link-service.ts`

**Key Code:**
```typescript
export class AffiliateLinkService {
  async createAffiliateLink(request: CreateLinkRequest): Promise<AffiliateLink> {
    // 1. Get merchant
    const merchant = await this.getMerchant(request.merchantId);

    // 2. Validate URL
    if (request.linkType === 'product') {
      this.validateUrl(request.originalUrl, merchant.domain);
    }

    // 3. Select generator
    const generator = this.selectGenerator(merchant, request.originalUrl, request.method);

    // 4. Generate link with fallback
    let result: GenerateLinkResult;
    try {
      result = await generator.generate({
        userId: request.userId,
        merchant,
        originalUrl: request.originalUrl,
        linkType: request.linkType
      });
    } catch (error) {
      console.warn('Generator failed, falling back to deeplink', error);
      const fallback = new DeeplinkGenerator();
      result = await fallback.generate({ ... });
      result.generationMethod = 'deeplink-fallback';
    }

    // 5. Save to database
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .insert({
        user_id: request.userId,
        review_id: request.reviewId,
        merchant_id: request.merchantId,
        original_url: request.originalUrl,
        affiliate_url: result.affiliateUrl,
        short_url: result.shortUrl,
        link_type: request.linkType,
        generation_method: result.generationMethod,
        label: request.label
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  private selectGenerator(merchant: Merchant, url: string, method?: string) {
    // Force method if specified
    if (method === 'deeplink') {
      return new DeeplinkGenerator();
    }

    // TikTok detection
    if (url.includes('tiktok.com')) {
      return new TikTokGenerator(process.env.ACCESSTRADE_TOKEN!);
    }

    // Use API if available
    if (process.env.ACCESSTRADE_TOKEN && (method === 'api' || method === 'auto')) {
      return new AccessTradeGenerator(process.env.ACCESSTRADE_TOKEN);
    }

    // Default: deeplink
    return new DeeplinkGenerator();
  }

  private async getMerchant(id: string): Promise<Merchant> {
    const { data, error } = await supabaseAdmin
      .from('merchants')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) throw new Error('Merchant not found');
    return data;
  }

  private validateUrl(url: string, merchantDomain: string) {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes(merchantDomain)) {
      throw new Error(`URL không thuộc merchant ${merchantDomain}`);
    }
  }
}
```

---

### Phase 5: API Endpoints (1 giờ)

**Tasks:**
- [ ] Create affiliate link endpoint
- [ ] List links endpoint
- [ ] Delete link endpoint

**Files:**
- `app/api/affiliate/route.ts` (GET, POST)
- `app/api/affiliate/[id]/route.ts` (DELETE)

**Key Code:**
```typescript
// app/api/affiliate/route.ts

// GET /api/affiliate?review_id=xxx
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('review_id');

  if (!reviewId) {
    return NextResponse.json({ error: 'review_id required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('affiliate_links')
    .select(`
      *,
      merchant:merchants(name, logo_url, domain)
    `)
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .order('display_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// POST /api/affiliate
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { reviewId, merchantId, originalUrl, linkType, label, method } = body;

  // Validation
  if (!reviewId || !merchantId || !originalUrl || !linkType) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const linkService = new AffiliateLinkService();
    const link = await linkService.createAffiliateLink({
      userId,
      reviewId,
      merchantId,
      originalUrl,
      linkType,
      label,
      method
    });

    return NextResponse.json({ success: true, data: link });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create link' },
      { status: 500 }
    );
  }
}

// app/api/affiliate/[id]/route.ts

// DELETE /api/affiliate/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('affiliate_links')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId); // Security: chỉ xóa link của mình

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

### Phase 6: UI Components (2-3 giờ)

**Tasks:**
- [ ] Create AffiliateLinksTab component
- [ ] Create AddLinkDialog component
- [ ] Integrate vào Review Edit page

**Files:**
- `components/affiliate/AffiliateLinksTab.tsx`
- `components/affiliate/AddLinkDialog.tsx`
- `app/dashboard/reviews/[id]/edit/page.tsx` (update)

**Key Code:**

```tsx
// components/affiliate/AffiliateLinksTab.tsx
'use client';

export function AffiliateLinksTab({ reviewId }: { reviewId: string }) {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadLinks();
  }, [reviewId]);

  const loadLinks = async () => {
    setLoading(true);
    const res = await fetch(`/api/affiliate?review_id=${reviewId}`);
    const data = await res.json();
    if (data.success) {
      setLinks(data.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa link này?')) return;

    await fetch(`/api/affiliate/${id}`, { method: 'DELETE' });
    loadLinks();
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Đã copy link!' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Affiliate Links ({links.length})
        </h3>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Link
        </Button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : links.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Chưa có affiliate link. Click "Thêm Link" để tạo.
        </p>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  {/* Merchant logo & info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={link.merchant.logo_url}
                      alt={link.merchant.name}
                      className="w-10 h-10 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {link.label || link.merchant.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {link.short_url || link.affiliate_url}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Method: {link.generation_method}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(link.short_url || link.affiliate_url)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Link Dialog */}
      {showAddDialog && (
        <AddLinkDialog
          reviewId={reviewId}
          onSuccess={() => {
            setShowAddDialog(false);
            loadLinks();
          }}
          onCancel={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}

// components/affiliate/AddLinkDialog.tsx
export function AddLinkDialog({ reviewId, onSuccess, onCancel }: Props) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    merchantId: '',
    linkType: 'product' as 'homepage' | 'product',
    originalUrl: '',
    label: '',
    method: 'auto' as 'auto' | 'api' | 'deeplink'
  });

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    const res = await fetch('/api/merchants');
    const data = await res.json();
    if (data.success) {
      setMerchants(data.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          ...formData
        })
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: 'Tạo link thành công!' });
        onSuccess();
      } else {
        toast({ title: 'Lỗi', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Lỗi', description: 'Không thể tạo link', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Affiliate Link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Link Type */}
          <div>
            <Label>Link Type</Label>
            <RadioGroup
              value={formData.linkType}
              onValueChange={(value) => setFormData({ ...formData, linkType: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="homepage" id="homepage" />
                <Label htmlFor="homepage">Trang chủ (Button)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="product" id="product" />
                <Label htmlFor="product">Sản phẩm cụ thể</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Merchant */}
          <div>
            <Label>Merchant</Label>
            <Select
              value={formData.merchantId}
              onValueChange={(value) => setFormData({ ...formData, merchantId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn merchant" />
              </SelectTrigger>
              <SelectContent>
                {merchants.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product URL */}
          {formData.linkType === 'product' && (
            <div>
              <Label>Product URL</Label>
              <Input
                placeholder="https://shopee.vn/product-abc..."
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                required
              />
            </div>
          )}

          {/* Label */}
          <div>
            <Label>Label (optional)</Label>
            <Input
              placeholder="Mua tại Shopee - Giảm 50%"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            />
          </div>

          {/* Method */}
          <div>
            <Label>Generation Method</Label>
            <RadioGroup
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as any })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto">Auto (API → Deeplink fallback)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="api" />
                <Label htmlFor="api">API only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deeplink" id="deeplink" />
                <Label htmlFor="deeplink">Deeplink only</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tạo Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Update Review Edit Page:**
```tsx
// app/dashboard/reviews/[id]/edit/page.tsx
// Add new tab
<TabsList>
  <TabsTrigger value="custom-content">Nội dung</TabsTrigger>
  <TabsTrigger value="pros-cons">Ưu/Nhược</TabsTrigger>
  <TabsTrigger value="keypoints">Điểm Nổi Bật</TabsTrigger>
  <TabsTrigger value="audience">Đối Tượng</TabsTrigger>
  <TabsTrigger value="affiliate">Affiliate</TabsTrigger> {/* NEW */}
  <TabsTrigger value="facebook">Facebook</TabsTrigger>
</TabsList>

{/* Add new tab content */}
<TabsContent value="affiliate">
  <AffiliateLinksTab reviewId={reviewId} />
</TabsContent>
```

---

### Phase 7: Merchants API (30 phút)

**Tasks:**
- [ ] Get merchants endpoint

**Files:**
- `app/api/merchants/route.ts`

**Code:**
```typescript
// GET /api/merchants
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('merchants')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
```

---

### Phase 8: Environment Variables (5 phút)

**Tasks:**
- [ ] Add env vars
- [ ] Update .env.example

**Files:**
- `.env.local`
- `.env.example`

**Variables:**
```bash
# Affiliate Link Generation
ACCESSTRADE_TOKEN=your_token_here
ISCLIX_PUBLISHER_ID=4790392958945222748
```

---

## ✅ CHECKLIST TỔNG HỢP

### Setup (1 giờ)
- [ ] Create database migration
- [ ] Run migration in Supabase
- [ ] Seed merchants
- [ ] Add environment variables
- [ ] Define TypeScript types

### Backend (3-4 giờ)
- [ ] Implement DeeplinkGenerator
- [ ] Implement AccessTradeGenerator
- [ ] Implement TikTokGenerator
- [ ] Implement AffiliateLinkService
- [ ] Create API endpoints (GET, POST, DELETE)
- [ ] Create Merchants API

### Frontend (2-3 giờ)
- [ ] Create AffiliateLinksTab component
- [ ] Create AddLinkDialog component
- [ ] Integrate into Review Edit page
- [ ] Test UI flow

### Testing (1 giờ)
- [ ] Test link generation (all 3 methods)
- [ ] Test API endpoints
- [ ] Test UI (add, delete, copy)
- [ ] Test fallback logic
- [ ] Verify URLs valid

---

## 🎯 TIMELINE

**Total Estimate**: 7-9 giờ làm việc

**Breakdown:**
- Day 1 (4h): Database + Backend (Phases 1-4)
- Day 2 (3h): API + UI (Phases 5-6)
- Day 3 (2h): Merchants API + Testing (Phases 7-8)

---

## 📝 DELIVERABLES

Sau khi hoàn thành, user có thể:

1. ✅ Vào Review Edit page
2. ✅ Click tab "Affiliate"
3. ✅ Click "Thêm Link"
4. ✅ Chọn merchant (Shopee, Lazada, TikTok...)
5. ✅ Nhập product URL (hoặc chọn homepage)
6. ✅ Chọn method (Auto/API/Deeplink)
7. ✅ Click "Tạo Link"
8. ✅ Xem link được generate
9. ✅ Click "Copy" để copy link
10. ✅ Dùng link trong review hoặc social post

---

## 🔑 KEY DECISIONS

### 1. Database: Separate Table ✅
- Pros: Better querying, indexing, referential integrity
- Cons: More complex schema
- **Decision**: Use separate table (better long-term)

### 2. API vs Deeplink: Auto-fallback ✅
- Pros: Best of both, reliability
- Cons: More complex
- **Decision**: Try API first, fallback to deeplink

### 3. Click Tracking: Later ⏭️
- **Decision**: Skip for now, focus on link generation only

### 4. UI Location: Review Edit Page ✅
- **Decision**: Add as tab in existing edit page

---

## 💰 COST ESTIMATE

**Free tier limits:**
- Supabase: ✅ 500MB database (plenty)
- Vercel: ✅ Hobby plan (sufficient)
- AccessTrade API: ✅ Free (you provide token)

**No additional costs needed**

---

## ❓ QUESTIONS BEFORE START

Trước khi implement, xác nhận:

1. ✅ Bạn có AccessTrade API token? → Bạn đã confirm có
2. ❓ Publisher ID của bạn là `4790392958945222748`? (từ code sample)
3. ❓ Campaign IDs cho Shopee, Lazada, Tiki là gì? (cần để seed merchants)
4. ❓ Có cần hỗ trợ merchants nào khác không? (Sendo, Tiki, v.v.)

---

## 🚀 NEXT ACTION

**Bạn muốn tôi:**

**Option A**: Bắt đầu implement Phase 1 (Database migration) ngay?

**Option B**: Giải đáp thêm câu hỏi trước?

**Option C**: Adjust plan dựa trên feedback?

Bạn quyết định nhé!
