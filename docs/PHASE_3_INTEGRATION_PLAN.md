# Phase 3: Integration Plan - Affiliate Links Enhancement

## 📊 Current State Analysis

### Hệ Thống Hiện Tại

Sau khi phân tích code, tôi phát hiện **affiliate links đã được tích hợp sẵn** vào review system:

#### ✅ Đã Có (Current Implementation)

1. **Database Schema**:
   - Reviews table có cột `affiliate_links` (JSONB type)
   - Lưu array of `AffiliateLink` objects
   - Format: `{ platform: string, url: string, price?: string, discount?: string }`

2. **UI Components**:
   - ✅ Review Edit Page (`dashboard/reviews/[id]/edit`) - Tab "Affiliate Links" đầy đủ CRUD
   - ✅ Review Create Page (`dashboard/create`) - State management sẵn sàng
   - ✅ AIContentEditor Component - Form để add/remove links
   - ✅ ReviewPreview Component - Hiển thị public với CTA buttons

3. **API Endpoints**:
   - ✅ `POST /api/create-review` - Nhận `affiliate_links` array
   - ✅ `PATCH /api/reviews/[id]` - Update `affiliate_links`
   - ✅ `POST /api/reviews/create-with-template` - Support affiliate_links

4. **Features**:
   - CRUD operations (add, update, remove)
   - Display in review detail page
   - Public preview với grid layout responsive
   - Empty state handling

### ❌ Chưa Có (Missing Features)

1. **Merchant Integration**:
   - Không connect với merchants table
   - Không có dropdown select merchant
   - Không tự động lấy campaign_id

2. **Link Generation**:
   - User phải nhập manual URL
   - Không có nút "Generate Link"
   - Không tích hợp với DeeplinkGenerator/AccessTradeGenerator

3. **Advanced Features**:
   - Không có URL validation
   - Không có link shortening
   - Không có click tracking
   - Không có drag-to-reorder
   - Không có bulk generation

---

## 🎯 Phương Án Tích Hợp (Recommended Approach)

### Option A: Minimal Enhancement (RECOMMENDED) ⭐

**Mục tiêu**: Tích hợp link generation vào UI hiện tại với ít thay đổi nhất

**Ưu điểm**:
- Giữ nguyên UX hiện tại (users đã quen)
- Không phá vỡ code existing
- Thêm tính năng mà không làm phức tạp
- Nhanh deploy (1-2 ngày)

**Nhược điểm**:
- Không tận dụng hết database migration mới (affiliate_links table)
- Vẫn lưu denormalized (JSONB trong reviews)

**Implementation**:

#### 1. Enhance Affiliate Links Tab trong Edit Page

**File**: `app/dashboard/reviews/[id]/edit/page.tsx`

**Changes**:

```typescript
// Add merchant selection state
const [selectedMerchant, setSelectedMerchant] = useState<string>('');
const [merchants, setMerchants] = useState<Merchant[]>([]);
const [generatingLink, setGeneratingLink] = useState(false);

// Load merchants on mount
useEffect(() => {
  fetch('/api/merchants?active_only=true')
    .then(res => res.json())
    .then(data => setMerchants(data.data || []));
}, []);

// NEW: Generate link function
const handleGenerateLink = async (index: number) => {
  if (!selectedMerchant) {
    toast({ title: 'Vui lòng chọn merchant', variant: 'destructive' });
    return;
  }

  const productUrl = affiliateLinks[index].url;
  if (!productUrl || !productUrl.startsWith('http')) {
    toast({ title: 'Vui lòng nhập URL sản phẩm hợp lệ', variant: 'destructive' });
    return;
  }

  setGeneratingLink(true);

  try {
    const res = await fetch('/api/affiliate-links/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantId: selectedMerchant,
        originalUrl: productUrl,
        linkType: 'product'
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    // Update affiliate link with generated URL
    const updated = [...affiliateLinks];
    updated[index] = {
      ...updated[index],
      url: data.shortUrl || data.affiliateUrl, // Use short if available
      platform: data.merchant?.name || updated[index].platform
    };
    setAffiliateLinks(updated);

    toast({ title: 'Link đã được tạo thành công!' });

  } catch (error) {
    toast({
      title: 'Lỗi tạo link',
      description: error.message,
      variant: 'destructive'
    });
  } finally {
    setGeneratingLink(false);
  }
};
```

**UI Changes** (trong Affiliate Links tab):

```tsx
{/* Existing affiliate links tab */}
<TabsContent value="affiliate">
  {/* Add merchant selector at top */}
  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <Label>Chọn Merchant để tạo link tracking</Label>
    <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
      <SelectTrigger>
        <SelectValue placeholder="Chọn merchant (Shopee, Lazada...)" />
      </SelectTrigger>
      <SelectContent>
        {merchants.map(m => (
          <SelectItem key={m.id} value={m.id}>
            {m.name} ({m.domain})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Enhanced link cards */}
  {affiliateLinks.map((link, index) => (
    <Card key={index} className="mb-4">
      <CardContent className="p-4">
        {/* ... existing fields ... */}

        {/* NEW: Product URL field + Generate button */}
        <div className="mb-3">
          <Label>URL Sản Phẩm Gốc</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://shopee.vn/product/..."
              value={link.url}
              onChange={(e) => updateAffiliateLink(index, 'url', e.target.value)}
            />
            <Button
              type="button"
              onClick={() => handleGenerateLink(index)}
              disabled={generatingLink || !selectedMerchant}
            >
              {generatingLink ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Generate
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nhập URL gốc, click Generate để tạo tracking link
          </p>
        </div>

        {/* Show generated tracking link (if different from input) */}
        {link.trackingUrl && link.trackingUrl !== link.url && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
            <Label className="text-green-700">Tracking Link đã tạo:</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={link.trackingUrl}
                readOnly
                className="bg-white"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(link.trackingUrl);
                  toast({ title: 'Đã copy link!' });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ... rest of existing fields (platform, price, discount) ... */}
      </CardContent>
    </Card>
  ))}
</TabsContent>
```

#### 2. Create New API Endpoint: Generate Link (Lightweight)

**File**: `app/api/affiliate-links/generate/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { affiliateLinkService } from '@/lib/affiliate/services/link-service';
import { merchantService } from '@/lib/affiliate/services/merchant-service';

export const dynamic = 'force-dynamic';

/**
 * POST - Generate affiliate link (lightweight, no database save)
 * Just returns the generated URL without saving to affiliate_links table
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { merchantId, originalUrl, linkType = 'product' } = await request.json();

    // Validation
    if (!merchantId || !originalUrl) {
      return NextResponse.json(
        { success: false, error: 'merchantId and originalUrl are required' },
        { status: 400 }
      );
    }

    // Get merchant
    const merchant = await merchantService.getMerchantById(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // Generate link using service (without saving to DB)
    // We'll use the internal method directly
    const settings = await affiliateSettingsService.getSettings();
    if (!settings || !settings.is_active) {
      return NextResponse.json(
        { success: false, error: 'Affiliate settings not configured' },
        { status: 400 }
      );
    }

    // Use the generator directly to get URL without DB save
    const generationMethod = settings.link_mode === 'api' && settings.api_token
      ? 'api'
      : 'deeplink';

    let result;
    if (generationMethod === 'api') {
      result = await accessTradeGenerator.generateLink(
        { userId, merchant, originalUrl, linkType },
        {
          apiToken: settings.api_token!,
          apiUrl: settings.api_url,
          utmSource: settings.utm_source || 'video-affiliate',
          utmCampaign: settings.utm_campaign || 'review'
        }
      );
    } else {
      result = await deeplinkGenerator.generateLink(
        { userId, merchant, originalUrl, linkType },
        {
          publisherId: settings.publisher_id!,
          deeplinkBaseUrl: settings.deeplink_base_url,
          utmSource: settings.utm_source || 'video-affiliate',
          utmCampaign: settings.utm_campaign || 'review'
        }
      );
    }

    return NextResponse.json({
      success: true,
      affiliateUrl: result.affiliateUrl,
      shortUrl: result.shortUrl,
      affSid: result.affSid,
      generationMethod: result.generationMethod,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        domain: merchant.domain
      }
    });

  } catch (error) {
    console.error('Generate link error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate link'
      },
      { status: 500 }
    );
  }
}
```

#### 3. Update AffiliateLink Type (Optional Enhancement)

**File**: `types/index.ts`

```typescript
export interface AffiliateLink {
  platform: string;
  url: string;              // Original product URL
  trackingUrl?: string;     // NEW: Generated tracking URL
  price?: string;
  discount?: string;
  affSid?: string;          // NEW: Tracking ID
  generationMethod?: 'api' | 'deeplink';  // NEW: How it was generated
}
```

#### 4. Update ReviewPreview to Use Tracking URL

**File**: `components/ReviewPreview.tsx`

```typescript
// Line 210: Update href to use trackingUrl if available
<a href={link.trackingUrl || link.url} target="_blank" rel="noopener noreferrer">
```

---

### Option B: Full Separation (Advanced)

**Mục tiêu**: Tách riêng affiliate_links ra table riêng, quản lý độc lập

**Ưu điểm**:
- Tận dụng database migration 002
- Normalized data (better for analytics)
- Có thể track clicks, conversions
- Reuse links across multiple reviews

**Nhược điểm**:
- Breaking change lớn
- Phải migrate data existing
- Phức tạp hơn nhiều
- Mất thời gian deploy (5-7 ngày)

**Implementation**: (Bỏ qua vì quá phức tạp cho use case hiện tại)

---

## 📋 Implementation Plan - Option A (RECOMMENDED)

### Phase 3A: Core Integration (2 days)

#### Day 1: API Endpoint + Types
1. ✅ Create `app/api/affiliate-links/generate/route.ts`
2. ✅ Update `types/index.ts` với trackingUrl field
3. ✅ Create `app/api/merchants/route.ts` (public endpoint, active only)
4. ✅ Test API endpoint với Postman/curl

#### Day 2: UI Integration
1. ✅ Update `app/dashboard/reviews/[id]/edit/page.tsx`:
   - Add merchant selector dropdown
   - Add "Generate" button per link
   - Add tracking URL display
   - Add copy button
2. ✅ Update `components/ReviewPreview.tsx` to use trackingUrl
3. ✅ Test full workflow end-to-end

### Phase 3B: Enhancements (1 day)

1. ✅ Add URL validation (check format)
2. ✅ Add loading states
3. ✅ Add error handling với toast
4. ✅ Add merchant logo display
5. ✅ Add generation method badge (API/Deeplink)

---

## 🎨 UI/UX Mockup

### Before (Current):
```
┌─────────────────────────────────────────┐
│ Affiliate Link #1                    [X]│
│ ┌─────────────┬─────────────────────────┤
│ │ Platform    │ Price                   │
│ │ [Shopee   ] │ [299.000đ          ]   │
│ └─────────────┴─────────────────────────┤
│ URL                                      │
│ [https://shopee.vn/product/12345    ]   │
│ Discount                                 │
│ [-20%                               ]   │
└──────────────────────────────────────────┘
```

### After (Enhanced):
```
┌─────────────────────────────────────────────────┐
│ 🎯 Merchant: [Shopee (shopee.vn)     ▼]        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Affiliate Link #1                    [X]│
│ ┌─────────────┬─────────────────────────┤
│ │ Platform    │ Price                   │
│ │ [Shopee   ] │ [299.000đ          ]   │
│ └─────────────┴─────────────────────────┤
│ URL Sản Phẩm Gốc                         │
│ [https://shopee.vn/product/12345  ] [⚡ Generate]
│ ↳ Nhập URL gốc, click Generate để tạo tracking
│                                          │
│ ✅ Tracking Link đã tạo:                │
│ [https://s.net.vn/abc123          ] [📋]│
│ [API] Đã tạo lúc: 10:30 AM              │
│                                          │
│ Discount                                 │
│ [-20%                               ]   │
└──────────────────────────────────────────┘
```

---

## 🔄 User Workflow

### Workflow Mới (Enhanced):

1. User vào Edit Review
2. Click tab "Affiliate Links"
3. **[NEW]** Chọn merchant từ dropdown (Shopee, Lazada...)
4. Click "Thêm Link"
5. **[CHANGED]** Nhập URL sản phẩm GỐC (không phải tracking link)
6. **[NEW]** Click "Generate" button
7. **[NEW]** Hệ thống gọi API → Generate tracking link
8. **[NEW]** Hiển thị tracking link với copy button
9. Nhập price, discount (optional)
10. Click "Lưu"

### Backend Flow:

```
User clicks "Generate"
    ↓
POST /api/affiliate-links/generate
    {
      merchantId: "merchant-shopee",
      originalUrl: "https://shopee.vn/product/12345",
      linkType: "product"
    }
    ↓
Load merchant (MerchantService)
Load settings (AffiliateSettingsService)
    ↓
Generate link (API or Deeplink)
    ├─ Try API → Success
    └─ Fallback Deeplink
    ↓
Return { affiliateUrl, shortUrl, affSid, method }
    ↓
Frontend updates state
    ↓
Display tracking link in UI
    ↓
User saves review
    ↓
PATCH /api/reviews/[id]
    {
      affiliate_links: [{
        platform: "Shopee",
        url: "https://shopee.vn/product/12345",
        trackingUrl: "https://s.net.vn/abc123",
        price: "299.000đ",
        discount: "-20%",
        affSid: "abc123_def456_1234567890",
        generationMethod: "api"
      }]
    }
    ↓
Save to reviews.affiliate_links (JSONB)
```

---

## 🚀 Deployment Steps

### 1. Database (Optional Type Update)
```sql
-- No migration needed! Using existing JSONB column
-- Just storing additional fields in JSON
```

### 2. Backend Code
```bash
# Already done in Phase 1 & 2
# Just need to create generate endpoint
```

### 3. Frontend Code
```bash
# Update edit page
# Update types
# Test locally
npm run dev
```

### 4. Testing
```bash
# Manual testing checklist:
- [ ] Select merchant dropdown works
- [ ] Generate button creates link
- [ ] Fallback works if API fails
- [ ] Copy button works
- [ ] Tracking URL displayed correctly
- [ ] Save review with tracking link
- [ ] Preview shows correct link
- [ ] Public page uses tracking URL
```

---

## 📊 Comparison: Option A vs Option B

| Feature | Option A (Minimal) | Option B (Full) |
|---------|-------------------|-----------------|
| **Database** | Keep JSONB in reviews | New affiliate_links table |
| **Data Model** | Denormalized | Normalized |
| **Migration** | None needed | Complex migration required |
| **Code Changes** | Minimal (1 endpoint, 1 UI update) | Extensive (APIs, UI, migration) |
| **Deployment Time** | 2-3 days | 5-7 days |
| **Breaking Changes** | None | Yes (data migration) |
| **Analytics** | Basic (stored in JSON) | Advanced (separate table) |
| **Link Reuse** | No | Yes |
| **Click Tracking** | Future enhancement | Built-in |
| **Complexity** | Low | High |
| **Risk** | Low | Medium-High |

---

## ✅ RECOMMENDATION

**Chọn Option A** vì:

1. ✅ **Không phá vỡ code hiện tại** - Reviews đã dùng affiliate_links JSONB
2. ✅ **Nhanh deploy** - 2 ngày là xong
3. ✅ **UX tốt** - Tích hợp mượt vào UI hiện có
4. ✅ **Đủ tính năng** - Generate link tự động, fallback, tracking
5. ✅ **Ít risk** - Không cần migrate data

**Có thể nâng cấp lên Option B sau** nếu cần:
- Click tracking
- Link reuse across reviews
- Advanced analytics
- Link management dashboard

---

## 🎯 Success Metrics

Sau khi deploy Option A, đo lường:

1. **Usage Rate**: % reviews có affiliate links
2. **Generation Success**: % API success vs fallback
3. **Link Quality**: % links valid (not 404)
4. **User Satisfaction**: Feedback về UX
5. **Performance**: Time to generate link (<2s target)

---

## 📝 Next Steps

1. ✅ Review và approve plan này
2. ✅ Implement generate endpoint (API)
3. ✅ Update edit page UI
4. ✅ Test end-to-end
5. ✅ Deploy to production
6. ✅ Monitor metrics
7. ⏳ Plan Phase 4 (URL Shortener) based on data

---

**Kết luận**: Đề xuất triển khai **Option A - Minimal Enhancement** để tích hợp link generation vào review system hiện tại với ít thay đổi nhất, deploy nhanh nhất, và đảm bảo stability.
