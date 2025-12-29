# Local Testing Guide - Affiliate System

## 📋 Overview

Hướng dẫn chi tiết để test hệ thống affiliate link tracking trên môi trường local trước khi deploy production.

**Thời gian test**: ~30-45 phút
**Yêu cầu**: Supabase project đã setup, npm dependencies đã install

---

## 🚀 Quick Start

### 1. Database Setup

**Step 1: Run Migrations**

```bash
# Mở Supabase Dashboard → SQL Editor
# Paste và execute từng file migration theo thứ tự:

# Migration 1: Affiliate Settings & Merchants
sql/migrations/001-create-affiliate-settings.sql

# Migration 3: URL Shortener (Migration 2 không dùng trong Phase 4-Lite)
sql/migrations/003-create-short-urls.sql
```

**Verify Migration**:
```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('affiliate_settings', 'merchants', 'short_urls', 'short_url_clicks');

-- Should return 4 rows
```

### 2. Start Development Server

```bash
npm run dev
```

**Verify**: App running at [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Plan

### Phase 1: Admin Setup

#### 1.1 Configure Affiliate Settings

**Navigate**: `/admin/affiliate-settings`

**Test Cases**:

1. **Configure Deeplink Mode**:
   ```
   Link Mode: Deeplink
   Publisher ID: 1234567 (test value)
   Deeplink Base URL: https://go.isclix.com/deep_link
   UTM Source: video-affiliate
   UTM Campaign: review
   ```
   - Click "Save Settings" ✅
   - **Expected**: Settings saved successfully

2. **Test API Mode** (if you have AccessTrade API token):
   ```
   Link Mode: API
   API Token: <your_token>
   API URL: https://api.accesstrade.vn/v1
   Publisher ID: (leave empty or set for fallback)
   ```
   - Click "Test Connection" ✅
   - **Expected**: "Connection successful" OR fallback to deeplink

3. **Verify Settings Persisted**:
   - Refresh page
   - **Expected**: Settings still there (not lost)

#### 1.2 Add Merchants

**Navigate**: `/admin/affiliate-settings` → Tab "Merchants"

**Test Cases**:

1. **Add Shopee**:
   ```
   Name: Shopee
   Domain: shopee.vn
   Platform: AccessTrade
   Campaign ID: 12345 (test value - get real from AccessTrade)
   Logo URL: (optional)
   Display Order: 1
   Active: ✅
   ```
   - Click "Add Merchant" ✅
   - **Expected**: Shopee appears in list

2. **Add Lazada**:
   ```
   Name: Lazada
   Domain: lazada.vn
   Platform: AccessTrade
   Campaign ID: 67890
   Display Order: 2
   Active: ✅
   ```
   - Click "Add Merchant" ✅

3. **Add Tiki**:
   ```
   Name: Tiki
   Domain: tiki.vn
   Platform: AccessTrade
   Campaign ID: 11111
   Display Order: 3
   Active: ✅
   ```
   - Click "Add Merchant" ✅

4. **Verify Merchant List**:
   - Should see 3 merchants
   - Sorted by Display Order
   - All marked as Active

---

### Phase 2: Link Generation (Individual)

#### 2.1 Create Test Review

**Navigate**: `/dashboard/reviews`

1. Click "Create Review" (or use existing review)
2. Fill in basic info:
   ```
   Title: Test Review - iPhone 15 Pro
   Category: Electronics
   Status: Draft
   ```
3. Save review
4. Navigate to "Edit" page

#### 2.2 Generate Single Link

**Navigate**: `/dashboard/reviews/[id]/edit` → Tab "Affiliate Links"

**Test Cases**:

1. **Select Merchant**:
   - Dropdown at top of tab
   - Select "Shopee (shopee.vn)"
   - **Expected**: Merchant selected

2. **Add Affiliate Link**:
   - Click "Thêm Link" button
   - **Expected**: New link card appears

3. **Enter Product URL**:
   ```
   Platform: Shopee (auto-filled from merchant)
   Price: 29,990,000đ
   URL: https://shopee.vn/product/123456789
   ```

4. **Generate Tracking Link**:
   - Click "⚡ Generate" button
   - **Expected**:
     - Loading spinner shows
     - Green box appears with tracking URL
     - Format: `http://localhost:3000/s/abc123` (custom short URL)
     - OR `https://s.net.vn/xyz` (if API mode with token)
     - Tracking ID shown (truncated)
     - Generation method badge (API or Deeplink)

5. **Copy URL**:
   - Click "📋 Copy" button
   - **Expected**: Toast "Copied to clipboard"
   - Paste somewhere to verify

6. **Save Review**:
   - Click "Lưu Thay Đổi"
   - **Expected**: "Review updated successfully"

#### 2.3 Verify Database

```sql
-- Check affiliate links saved
SELECT id, title, affiliate_links
FROM reviews
WHERE title LIKE '%Test Review%';

-- Verify structure
-- affiliate_links should be JSONB array with:
-- - url, trackingUrl, affSid, generationMethod, merchantId, etc.

-- Check short URLs created
SELECT short_code, original_url, clicks, aff_sid
FROM short_urls
ORDER BY created_at DESC
LIMIT 5;
```

---

### Phase 3: Bulk Generation

#### 3.1 Add Multiple Links

**Navigate**: Same review edit page → Tab "Affiliate Links"

**Test Cases**:

1. **Add 5 Links**:
   - Click "Thêm Link" 5 times
   - Enter URLs for each:
     ```
     Link 1: https://shopee.vn/product/111
     Link 2: https://shopee.vn/product/222
     Link 3: https://shopee.vn/product/333
     Link 4: https://shopee.vn/product/444
     Link 5: https://shopee.vn/product/555
     ```
   - DON'T click individual Generate buttons

2. **Verify Bulk Button**:
   - Look at header of Affiliate Links tab
   - **Expected**: "Bulk Generate (5)" button visible
   - Count shows number of ungenerated links

3. **Bulk Generate**:
   - Click "Bulk Generate (5)"
   - **Expected**:
     - Button shows "🔄 Đang tạo..."
     - All 5 links get tracking URLs
     - Toast: "Đã tạo 5 tracking links"
     - All green boxes appear
   - **Time**: Should be ~2-3 seconds (parallel processing)

4. **Verify All Links Have Short URLs**:
   - Each link should have `http://localhost:3000/s/[code]`
   - All different codes (abc123, def456, etc.)
   - All have affSid values

5. **Save Review**:
   - Click "Lưu Thay Đổi"
   - **Expected**: All 5 links saved with tracking URLs

#### 3.2 Test Partial Failure

**Test Cases**:

1. **Add Invalid URL**:
   - Add 3 links:
     - `https://shopee.vn/product/valid1`
     - `invalid-url-format` (no https://)
     - `https://shopee.vn/product/valid2`

2. **Bulk Generate**:
   - Click "Bulk Generate (3)"
   - **Expected**:
     - Toast: "Tạo 2 links thành công, 1 links thất bại"
     - 2 links have tracking URLs
     - 1 link shows error (red text)

---

### Phase 4: URL Shortener & Redirect

#### 4.1 Test Redirect

**Prerequisites**: Have a generated short URL from previous tests (e.g., `/s/abc123`)

**Test Cases**:

1. **Access Short URL**:
   - Copy short URL: `http://localhost:3000/s/abc123`
   - Paste in new browser tab
   - **Expected**:
     - Redirects to original affiliate URL
     - Opens immediately (< 100ms)
     - URL bar shows final destination (AccessTrade or deeplink)

2. **Verify Click Tracked**:
   ```sql
   -- Check clicks incremented
   SELECT short_code, clicks, last_clicked_at
   FROM short_urls
   WHERE short_code = 'abc123';

   -- Should show: clicks = 1, last_clicked_at = just now
   ```

3. **Click Multiple Times**:
   - Click short URL 5 times
   - **Expected**:
     ```sql
     SELECT clicks FROM short_urls WHERE short_code = 'abc123';
     -- Should return: 5
     ```

#### 4.2 Test Invalid/Expired URLs

**Test Cases**:

1. **Invalid Code**:
   - Access: `http://localhost:3000/s/invalid!!!`
   - **Expected**: 404 page with "Invalid short URL format"

2. **Non-Existent Code**:
   - Access: `http://localhost:3000/s/zzzzzz`
   - **Expected**: 404 page with "Short URL not found"

3. **Expired URL** (optional - requires manual setup):
   ```sql
   -- Create short URL with past expiration
   INSERT INTO short_urls (short_code, original_url, expires_at, is_active, created_by)
   VALUES ('expired', 'https://google.com', '2020-01-01', true, (SELECT id FROM user_profiles LIMIT 1));
   ```
   - Access: `http://localhost:3000/s/expired`
   - **Expected**: 404 page "Short URL expired"
   - Verify:
     ```sql
     SELECT is_active FROM short_urls WHERE short_code = 'expired';
     -- Should return: false (auto-deactivated)
     ```

#### 4.3 Test Error Pages

**Test Cases**:

1. **404 Page Design**:
   - Access invalid URL
   - **Expected**:
     - Purple gradient background
     - Large "404" heading
     - Error message clearly displayed
     - "Go to Home" button visible
     - Responsive (test mobile view)

2. **Error Page Links**:
   - Click "Go to Home" button
   - **Expected**: Redirects to `/`

---

### Phase 5: Click Tracking Integration

#### 5.1 Test in Review Preview

**Navigate**: `/dashboard/reviews/[id]` (View mode, not edit)

**Prerequisites**: Review has affiliate links with tracking URLs

**Test Cases**:

1. **Preview Click Tracking**:
   - Review preview shows affiliate link buttons
   - Click "Mua ngay trên Shopee" button
   - **Expected**:
     - Opens new tab with affiliate URL
     - Backend tracks click (check console logs)

2. **Verify Click in Database**:
   ```sql
   -- Check review's affiliate_links JSONB
   SELECT affiliate_links
   FROM reviews
   WHERE id = '<review_id>';

   -- Look for clicks field in JSONB:
   -- affiliate_links[0].clicks should be > 0
   ```

3. **Edit Review to See Clicks**:
   - Go back to edit page
   - Navigate to Affiliate Links tab
   - **Expected**: (Feature to show click count - if implemented)
   - Current: Check database manually

#### 5.2 Test Public Preview

**Navigate**: `/review/[slug]` (Public review page)

**Test Cases**:

1. **Public Page Click**:
   - Publish review (set status = published)
   - Access public URL: `/review/test-review-iphone-15-pro`
   - Click affiliate link button
   - **Expected**:
     - Redirects to merchant
     - Click tracked

2. **Verify Referrer Tracking**:
   ```sql
   -- If detailed tracking enabled (ENABLE_DETAILED_CLICK_TRACKING=true)
   SELECT referrer, clicked_at
   FROM short_url_clicks
   WHERE short_url_id IN (
     SELECT id FROM short_urls WHERE short_code = 'abc123'
   );
   ```

---

### Phase 6: Edge Cases & Error Handling

#### 6.1 Error Scenarios

**Test Cases**:

1. **Generate Without Merchant**:
   - Don't select merchant
   - Click "Generate" on a link
   - **Expected**: Error toast "Vui lòng chọn merchant"

2. **Generate with Empty URL**:
   - Leave URL field empty
   - Click "Generate"
   - **Expected**: Error toast "URL không hợp lệ"

3. **Bulk Generate Without Merchant**:
   - Have 3 ungenerated links
   - Don't select merchant
   - Click "Bulk Generate"
   - **Expected**: Error toast "Vui lòng chọn merchant"

4. **Save Without Generating**:
   - Add link with URL only (no tracking URL)
   - Save review
   - **Expected**:
     - Review saves successfully
     - Link has url but no trackingUrl (valid state)
     - Can generate later

#### 6.2 Concurrent Access

**Test Cases**:

1. **Multiple Users Generate Same Merchant**:
   - Open 2 browser tabs
   - Both generate links for Shopee
   - **Expected**: Different short codes (no collision)

2. **Rapid Clicking**:
   - Click short URL redirect 20 times rapidly
   - **Expected**:
     - All clicks tracked
     - No database lock errors
     - Count = 20

---

## 📊 Performance Testing

### Response Time Benchmarks

**Test with Browser DevTools Network Tab**:

1. **Link Generation**:
   - Single generate: < 2 seconds
   - Bulk generate (5 links): < 5 seconds

2. **Short URL Redirect**:
   - `/s/[code]`: < 100ms
   - Database query: < 20ms
   - Total time: < 100ms

3. **Click Tracking**:
   - POST `/api/affiliate-links/click`: < 50ms
   - Should NOT block redirect

### Load Testing (Optional)

```bash
# Install artillery (if not installed)
npm install -g artillery

# Create test file: artillery-test.yml
---
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Redirect short URL"
    flow:
      - get:
          url: "/s/abc123"

# Run test
artillery run artillery-test.yml
```

**Expected Results**:
- Response time p95: < 200ms
- Error rate: < 1%
- Database handles load without locks

---

## 🗃️ Database Verification

### Data Integrity Checks

```sql
-- 1. Check all reviews have valid affiliate links structure
SELECT
  id,
  title,
  jsonb_array_length(affiliate_links) as link_count,
  affiliate_links
FROM reviews
WHERE affiliate_links IS NOT NULL;

-- 2. Check short URLs have valid tracking IDs
SELECT
  short_code,
  aff_sid,
  review_id,
  clicks,
  is_active
FROM short_urls
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 3. Check orphaned short URLs (no matching review)
SELECT s.short_code, s.review_id
FROM short_urls s
LEFT JOIN reviews r ON s.review_id = r.id
WHERE s.review_id IS NOT NULL AND r.id IS NULL;
-- Should return 0 rows

-- 4. Check click tracking accuracy
SELECT
  short_code,
  clicks,
  (SELECT COUNT(*) FROM short_url_clicks WHERE short_url_id = s.id) as detailed_clicks
FROM short_urls s
WHERE clicks > 0;
-- clicks should match detailed_clicks (if detailed tracking enabled)

-- 5. Check expired links
SELECT short_code, expires_at, is_active
FROM short_urls
WHERE expires_at < NOW() AND is_active = true;
-- Should return 0 rows (auto-deactivated on access)

-- 6. Check merchants
SELECT name, domain, campaign_id, is_active
FROM merchants
ORDER BY display_order;
-- Verify all test merchants present
```

---

## ✅ Final Checklist

### Pre-Deployment Verification

- [ ] **Database**:
  - [ ] All migrations executed successfully
  - [ ] Tables created: affiliate_settings, merchants, short_urls
  - [ ] Indexes created (6 for short_urls)
  - [ ] RLS policies enabled

- [ ] **Admin Setup**:
  - [ ] Affiliate settings configured (API or Deeplink)
  - [ ] At least 1 merchant added (Shopee)
  - [ ] Test connection successful (if API mode)

- [ ] **Link Generation**:
  - [ ] Single link generation works
  - [ ] Bulk generation works (3+ links)
  - [ ] Auto-shortening creates `/s/[code]` URLs
  - [ ] Error handling works (invalid URL, no merchant)

- [ ] **URL Shortener**:
  - [ ] Redirect works (< 100ms)
  - [ ] Click tracking increments counter
  - [ ] 404 pages show for invalid codes
  - [ ] Expired links auto-deactivate

- [ ] **Integration**:
  - [ ] Generate → Save → Preview → Click → Track (end-to-end)
  - [ ] Public page clicking works
  - [ ] Multiple links in single review
  - [ ] Bulk generate with partial failure

- [ ] **Performance**:
  - [ ] Generate time acceptable (< 5s for 5 links)
  - [ ] Redirect time < 100ms
  - [ ] No database locks under load
  - [ ] Console logs clean (no errors)

- [ ] **Build**:
  - [ ] `npm run build` succeeds
  - [ ] 0 TypeScript errors
  - [ ] 0 ESLint errors
  - [ ] Bundle size acceptable

---

## 🐛 Common Issues & Fixes

### Issue 1: "Unauthorized" when generating links

**Cause**: Not logged in or session expired

**Fix**:
```bash
# Check if logged in
# Navigate to /auth/login
# Login with your account
# Try again
```

### Issue 2: "Merchant not found"

**Cause**: Merchant not in database

**Fix**:
```sql
-- Check merchants
SELECT * FROM merchants;

-- If empty, add via admin UI:
-- /admin/affiliate-settings → Merchants tab
```

### Issue 3: Short URL redirect fails

**Cause**: Database connection issue or code not found

**Fix**:
```sql
-- Check if short URL exists
SELECT * FROM short_urls WHERE short_code = 'abc123';

-- Check is_active
SELECT is_active FROM short_urls WHERE short_code = 'abc123';
-- Should be true
```

### Issue 4: Clicks not tracking

**Cause**: Async error or database constraint

**Fix**:
```bash
# Check server logs in terminal
# Look for errors like "Failed to update click counter"

# Check database
SELECT * FROM short_urls WHERE short_code = 'abc123';
# Verify clicks column exists and is NOT NULL
```

### Issue 5: Build fails with TypeScript errors

**Cause**: Missing types or incorrect imports

**Fix**:
```bash
# Clean build cache
rm -rf .next

# Reinstall dependencies
npm install

# Build again
npm run build
```

---

## 📝 Test Report Template

After completing testing, document results:

```markdown
# Test Report - Affiliate System

**Date**: 2025-12-27
**Tester**: [Your Name]
**Environment**: Local (http://localhost:3000)

## Test Results

### Phase 1: Admin Setup
- [ ] Settings configured ✅/❌
- [ ] Merchants added (3 merchants) ✅/❌
- [ ] Test connection successful ✅/❌

### Phase 2: Link Generation
- [ ] Single generation works ✅/❌
- [ ] Bulk generation works ✅/❌
- [ ] Auto-shortening works ✅/❌
- [ ] Error handling works ✅/❌

### Phase 3: URL Shortener
- [ ] Redirect works (< 100ms) ✅/❌
- [ ] Click tracking works ✅/❌
- [ ] 404 pages work ✅/❌
- [ ] Expiration works ✅/❌

### Phase 4: Integration
- [ ] End-to-end flow works ✅/❌
- [ ] Public page works ✅/❌
- [ ] Multiple links work ✅/❌

### Performance
- Generate time: _____ seconds (target: < 5s for 5 links)
- Redirect time: _____ ms (target: < 100ms)
- Click tracking: _____ ms (target: < 50ms)

### Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Status: Fixed/Open
   - Fix: [Description]

## Conclusion
- [ ] Ready for production ✅/❌
- [ ] Needs fixes before deploy ✅/❌

**Notes**: [Additional observations]
```

---

**Testing Complete!** 🎉

Nếu tất cả test cases pass, hệ thống đã sẵn sàng deploy lên production.
