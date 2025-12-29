# Phase 4: Advanced Features - Implementation Plan

## 📊 Current Status After Phase 3

**Completed**:
- ✅ Affiliate settings & merchants management
- ✅ Link generators (API + Deeplink with fallback)
- ✅ UI integration in review edit page
- ✅ Automatic tracking link generation
- ✅ Public preview uses tracking URLs

**What's Working**:
- Users can generate affiliate tracking links
- Links stored in reviews.affiliate_links (JSONB)
- Preview page displays CTA buttons with tracking URLs
- UTM + sub parameters embedded for tracking

**What's Missing**:
- ❌ No click tracking (can't see how many clicks)
- ❌ No analytics dashboard (no performance insights)
- ❌ Manual one-by-one generation (slow for multiple links)
- ❌ No link validation (domain matching)
- ❌ No link refresh/update mechanism

---

## 🎯 Phase 4 Objectives

### Primary Goals:
1. **Click Tracking** - Know which links are performing
2. **Analytics Dashboard** - Visualize link performance
3. **Bulk Generation** - Generate multiple links at once
4. **Link Management** - Better organization and control

### Secondary Goals:
5. Link validation (verify domain matches merchant)
6. Link refresh mechanism (regenerate expired links)
7. Performance optimization
8. Enhanced UX improvements

---

## 🏗️ Architecture Design

### Option A: Use Existing affiliate_links Table (RECOMMENDED)

**Approach**: Migrate from JSONB to normalized table structure

**Pros**:
- ✅ Proper data normalization
- ✅ Can add click tracking easily
- ✅ Better query performance
- ✅ Supports link reuse across reviews
- ✅ Foundation for advanced analytics

**Cons**:
- ⚠️ Requires data migration from reviews.affiliate_links
- ⚠️ Breaking change (need migration script)
- ⚠️ More complex than Phase 3

**Decision**: This is the RIGHT time to do this migration because:
1. We already have migration 002 (affiliate_links table)
2. System is not in production yet with many reviews
3. Phase 5 (URL Shortener) will need this structure anyway
4. Better to migrate now than later

---

### Option B: Keep JSONB + Add External Tracking (NOT RECOMMENDED)

**Approach**: Keep reviews.affiliate_links, add separate clicks table

**Why Not**:
- ❌ Two sources of truth (confusing)
- ❌ Can't link clicks to specific link without complex joins
- ❌ Doesn't scale well
- ❌ Will need to migrate eventually anyway

---

## 📋 Phase 4 Implementation Plan

### Part 1: Data Migration (Critical)

#### Step 1.1: Create Migration Script

**File**: `sql/migrations/003-migrate-jsonb-to-table.sql`

**What it does**:
1. Read existing reviews.affiliate_links (JSONB)
2. For each review with affiliate links:
   - Insert into affiliate_links table
   - Link to review_id
   - Preserve all data (trackingUrl, affSid, etc.)
3. Add review_affiliate_links junction table (many-to-many)
4. Create function to sync both ways (transition period)

**Schema**:
```sql
-- Reviews can have multiple affiliate links
-- Affiliate links can be used in multiple reviews (reusable)

-- Junction table
CREATE TABLE review_affiliate_links (
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (review_id, affiliate_link_id)
);

-- Update affiliate_links usage
-- Now used for both storage AND click tracking
```

**Migration Strategy**:
- Backward compatible for 1 week (read from both sources)
- Gradual rollout (test with sample data first)
- Rollback plan if issues

#### Step 1.2: Update Review Model

**Change**: Remove reliance on JSONB, use joins

**Before**:
```typescript
const review = await db.getReviewById(id);
// review.affiliate_links from JSONB
```

**After**:
```typescript
const review = await db.getReviewById(id);
// review.affiliate_links from JOIN with affiliate_links table
```

---

### Part 2: Click Tracking

#### Step 2.1: Create Click Tracking Endpoint

**File**: `app/api/affiliate-links/[id]/click/route.ts`

```typescript
POST /api/affiliate-links/:id/click
{
  referrer?: string,
  userAgent?: string,
  ip?: string,
  metadata?: object
}

Response:
{
  success: true,
  redirect_url: "https://shopee.vn/product/..."
}
```

**Flow**:
1. User clicks affiliate link in preview
2. Link points to `/api/affiliate-links/[id]/click`
3. Server logs click (increment counter, store metadata)
4. Server redirects to actual affiliate URL
5. User lands on merchant site with tracking params

**Database Table**: `affiliate_link_clicks`
```sql
CREATE TABLE affiliate_link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_link_id UUID REFERENCES affiliate_links(id),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(10),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clicks_link_id ON affiliate_link_clicks(affiliate_link_id);
CREATE INDEX idx_clicks_date ON affiliate_link_clicks(clicked_at DESC);
```

#### Step 2.2: Update Preview Component

**Change**: Wrap affiliate URLs in click tracking endpoint

**Before**:
```tsx
<a href={link.trackingUrl || link.url}>
```

**After**:
```tsx
<a href={`/api/affiliate-links/${link.id}/click`}>
```

**Benefits**:
- Track every click
- Collect analytics data
- Still redirects to affiliate URL
- Transparent to user

---

### Part 3: Analytics Dashboard

#### Step 3.1: Create Analytics API

**File**: `app/api/affiliate-links/analytics/route.ts`

```typescript
GET /api/affiliate-links/analytics?user_id=...&date_from=...&date_to=...

Response:
{
  success: true,
  data: {
    total_links: 42,
    total_clicks: 1234,
    click_through_rate: 0.15,
    top_links: [
      {
        id: "uuid",
        affiliate_url: "...",
        merchant_name: "Shopee",
        clicks: 450,
        last_clicked: "2024-01-15T10:30:00Z"
      }
    ],
    clicks_by_merchant: [
      { merchant: "Shopee", clicks: 680 },
      { merchant: "Lazada", clicks: 320 }
    ],
    clicks_over_time: [
      { date: "2024-01-01", clicks: 45 },
      { date: "2024-01-02", clicks: 67 }
    ],
    generation_methods: {
      api: { count: 30, clicks: 890 },
      deeplink: { count: 12, clicks: 344 }
    }
  }
}
```

#### Step 3.2: Create Analytics Dashboard Page

**File**: `app/dashboard/analytics/affiliate-links/page.tsx`

**Components**:
1. **Overview Cards**:
   - Total Links Generated
   - Total Clicks
   - Average CTR
   - Top Merchant

2. **Charts**:
   - Line chart: Clicks over time
   - Bar chart: Clicks by merchant
   - Pie chart: Generation methods (API vs Deeplink)

3. **Top Links Table**:
   - Columns: URL, Merchant, Clicks, Last Clicked, Actions
   - Sortable by clicks
   - Search/filter

4. **Filters**:
   - Date range picker
   - Merchant filter
   - Generation method filter

**Libraries**:
- Recharts (already used in project)
- date-fns for date handling
- ShadcN Table component

---

### Part 4: Bulk Link Generation

#### Step 4.1: Create Bulk Generate API

**File**: `app/api/affiliate-links/bulk-generate/route.ts`

```typescript
POST /api/affiliate-links/bulk-generate
{
  reviewId: "uuid",
  links: [
    {
      merchantId: "uuid",
      originalUrl: "https://shopee.vn/product/1",
      linkType: "product"
    },
    {
      merchantId: "uuid",
      originalUrl: "https://lazada.vn/product/2",
      linkType: "product"
    }
  ]
}

Response:
{
  success: true,
  data: {
    generated: 2,
    failed: 0,
    results: [
      {
        success: true,
        affiliateUrl: "...",
        shortUrl: "...",
        affSid: "..."
      }
    ]
  }
}
```

**Logic**:
- Process all links in parallel (Promise.all)
- Each link uses same fallback logic as single generation
- Return results array with success/error per link
- Save all successful links to database

#### Step 4.2: Update Edit Page UI

**New Feature**: "Bulk Generate" button

**Location**: Affiliate Links tab header (next to "Thêm Link")

**Flow**:
1. User adds multiple affiliate links (with URLs only)
2. Selects merchant from dropdown
3. Clicks "Bulk Generate" button
4. System generates all links at once
5. Shows progress (e.g., "Generating 3/5...")
6. Displays results (success/failed per link)
7. Updates all link cards with tracking URLs

**UI**:
```tsx
<Button
  variant="outline"
  onClick={handleBulkGenerate}
  disabled={!selectedMerchant || affiliateLinks.length === 0}
>
  <Wand2 className="mr-2" />
  Bulk Generate ({affiliateLinks.filter(l => l.url && !l.trackingUrl).length})
</Button>
```

---

### Part 5: Enhanced Features

#### 5.1: Link Validation

**Feature**: Verify URL domain matches merchant

**Implementation**:
```typescript
function validateUrlMatchesMerchant(url: string, merchant: Merchant): boolean {
  try {
    const urlObj = new URL(url);
    const urlDomain = urlObj.hostname.replace('www.', '');
    const merchantDomain = merchant.domain.replace('www.', '');

    return urlDomain.includes(merchantDomain) || merchantDomain.includes(urlDomain);
  } catch {
    return false;
  }
}
```

**UI Feedback**:
- Show warning icon if domain doesn't match
- Tooltip: "URL domain doesn't match merchant (expected: shopee.vn)"
- Still allow generation (warning, not error)

#### 5.2: Link Refresh

**Feature**: Regenerate expired or old links

**Use Case**: AccessTrade links may expire or change

**Implementation**:
1. Add "Refresh" button on each link card
2. Calls generate endpoint again with same URL
3. Updates trackingUrl with new value
4. Keeps click history (linked by affiliate_link.id)

**UI**:
```tsx
<Button
  size="sm"
  variant="ghost"
  onClick={() => handleRefreshLink(index)}
>
  <RefreshCw className="w-4 h-4" />
</Button>
```

#### 5.3: Link Performance Badge

**Feature**: Show performance indicator on each link

**Logic**:
```typescript
const getPerformanceBadge = (clicks: number) => {
  if (clicks > 100) return { label: "🔥 Hot", color: "red" };
  if (clicks > 50) return { label: "👍 Good", color: "green" };
  if (clicks > 10) return { label: "📊 Active", color: "blue" };
  return { label: "🆕 New", color: "gray" };
};
```

**Display**: Badge on link card showing clicks + performance level

---

## 📅 Implementation Timeline

### Week 1: Data Migration
- **Day 1-2**: Create migration script + test
- **Day 3**: Update database queries to use affiliate_links table
- **Day 4**: Update review API to join affiliate_links
- **Day 5**: Test migration, rollback plan

### Week 2: Click Tracking
- **Day 1**: Create affiliate_link_clicks table
- **Day 2**: Implement click tracking endpoint
- **Day 3**: Update preview component
- **Day 4**: Test click tracking end-to-end
- **Day 5**: Monitor and optimize

### Week 3: Analytics Dashboard
- **Day 1-2**: Create analytics API
- **Day 3-4**: Build analytics dashboard UI
- **Day 5**: Polish and test

### Week 4: Bulk Generation + Enhanced Features
- **Day 1-2**: Implement bulk generate API
- **Day 3**: Add bulk generate UI
- **Day 4**: Add link validation + refresh
- **Day 5**: Final testing and deployment

**Total**: 4 weeks (~20 working days)

---

## 🎯 Success Metrics

### Technical Metrics:
- Migration success rate: >99%
- Click tracking accuracy: 100%
- API response time: <500ms
- Dashboard load time: <2s

### Business Metrics:
- Affiliate link CTR: Baseline + trend
- Most clicked merchants: Top 3
- API vs Deeplink performance: Conversion rate comparison
- User adoption: % reviews with affiliate links

---

## 🚨 Risks & Mitigation

### Risk 1: Data Migration Failure
**Mitigation**:
- Test on staging with production copy
- Dry-run migration first
- Keep JSONB column for 2 weeks (rollback)
- Manual verification of sample reviews

### Risk 2: Click Tracking Performance Impact
**Mitigation**:
- Asynchronous click logging
- Database indexes on hot paths
- Cache frequently accessed data
- Monitor latency, set alerts

### Risk 3: User Confusion (Breaking Change)
**Mitigation**:
- Document changes in UI
- Show migration notice to users
- Provide migration guide
- Support team training

---

## 🔄 Migration Strategy

### Phase 4A: Preparation (Week 1)
1. Create affiliate_links table (already done)
2. Create migration script
3. Test on dev environment
4. Review and approve

### Phase 4B: Gradual Migration (Week 2)
1. Deploy code with dual-read support
2. Migrate 10% of reviews
3. Monitor for issues
4. Migrate 50% of reviews
5. Monitor for issues
6. Migrate 100% of reviews

### Phase 4C: Cleanup (Week 3)
1. Verify all reviews migrated
2. Remove JSONB read fallback
3. Mark reviews.affiliate_links as deprecated
4. Plan for column removal (future)

---

## 📚 Documentation Updates

After Phase 4:
1. Update AFFILIATE_SYSTEM_OVERVIEW.md
2. Create MIGRATION_GUIDE.md for users
3. Update API documentation
4. Create analytics dashboard user guide
5. Update PHASE_4_COMPLETE.md

---

## 🎉 Expected Outcomes

After Phase 4 completion:

**For Users**:
- 📊 See which affiliate links perform best
- ⚡ Generate multiple links at once (faster)
- 🔄 Refresh outdated links easily
- ✅ Confidence in link quality (validation)

**For Business**:
- 💰 Better understanding of revenue sources
- 📈 Data-driven decisions on merchants
- 🎯 Optimize affiliate strategy
- 🔍 Track ROI per link/merchant

**For System**:
- 🏗️ Normalized data structure (scalable)
- 📊 Rich analytics capabilities
- 🚀 Foundation for Phase 5 (URL Shortener)
- 🔧 Better maintainability

---

## 🤔 Decision Points

### Should we do full migration or keep hybrid?

**Recommendation**: Full migration to affiliate_links table

**Reasoning**:
1. Project is early-stage (not many reviews yet)
2. Phase 5 needs normalized structure anyway
3. Click tracking requires it
4. Analytics much easier with proper schema
5. Better to do it now than later

### Should we track every click or sample?

**Recommendation**: Track every click

**Reasoning**:
1. Early stage = low volume (can handle it)
2. Accurate data is critical for decisions
3. Database can handle millions of rows
4. Can add sampling later if needed

### Should we build analytics from scratch or use external tool?

**Recommendation**: Build custom dashboard

**Reasoning**:
1. Full control over data
2. No external costs
3. Can customize to specific needs
4. Already have Recharts in project
5. Not complex enough to need external tool

---

## ✅ Ready to Proceed?

Phase 4 is a **significant upgrade** that will:
- ✅ Normalize data structure
- ✅ Enable click tracking
- ✅ Provide analytics insights
- ✅ Improve user productivity (bulk generation)
- ✅ Set foundation for Phase 5

**Estimated Effort**: 4 weeks (20 days)
**Risk Level**: Medium (due to migration)
**Value**: High (unlocks analytics + better UX)

**Recommendation**: Proceed with Phase 4 after Phase 3 is stable in production for 1-2 weeks.
