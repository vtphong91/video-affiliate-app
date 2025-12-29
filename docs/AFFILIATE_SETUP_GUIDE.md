# Hướng Dẫn Setup Affiliate Link Module

## ✅ ĐÃ HOÀN THÀNH

Module cấu hình API AccessTrade đã được implement với các tính năng:

1. ✅ Database schema (affiliate_settings, merchants)
2. ✅ Service layer (AffiliateSettingsService)
3. ✅ API endpoints (GET, PATCH, POST test)
4. ✅ Admin UI page (Cấu hình API)
5. ✅ Dual mode: API Mode + Deeplink Mode (backup)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Chạy Database Migration

**Option A: Supabase Dashboard (Khuyến nghị)**

1. Vào https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (sidebar trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file: `sql/migrations/001-create-affiliate-settings.sql`
6. Paste vào editor
7. Click **Run** (hoặc Ctrl+Enter)

**Option B: Supabase CLI**

```bash
supabase db execute --file sql/migrations/001-create-affiliate-settings.sql
```

**Kết quả mong đợi:**
- ✅ Tạo table `affiliate_settings` (1 row default)
- ✅ Tạo table `merchants` (4 merchants mẫu: Shopee, Lazada, Tiki, TikTok)

### Step 2: Verify Database

Kiểm tra trong Supabase Table Editor:

```sql
-- Check affiliate_settings
SELECT * FROM affiliate_settings;

-- Check merchants
SELECT * FROM merchants;
```

Nên thấy:
- `affiliate_settings`: 1 row với link_mode = 'api'
- `merchants`: 4 rows (Shopee, Lazada, Tiki, TikTok Shop)

### Step 3: Update Campaign IDs (QUAN TRỌNG)

Cập nhật campaign IDs thực tế từ AccessTrade:

```sql
-- Update Shopee
UPDATE merchants
SET campaign_id = 'YOUR_SHOPEE_CAMPAIGN_ID'
WHERE domain = 'shopee.vn';

-- Update Lazada
UPDATE merchants
SET campaign_id = 'YOUR_LAZADA_CAMPAIGN_ID'
WHERE domain = 'lazada.vn';

-- Update Tiki
UPDATE merchants
SET campaign_id = 'YOUR_TIKI_CAMPAIGN_ID'
WHERE domain = 'tiki.vn';

-- Update TikTok Shop
UPDATE merchants
SET campaign_id = 'YOUR_TIKTOK_CAMPAIGN_ID'
WHERE domain = 'tiktok.com';
```

### Step 4: Build & Deploy

```bash
# Test build locally
npm run build

# If success, commit và push
git add .
git commit -m "feat: Add affiliate settings module

- Create affiliate_settings & merchants tables
- Implement settings service
- Add admin UI for API configuration
- Support dual mode: API + Deeplink
"

git push origin master
```

Vercel sẽ tự động deploy.

### Step 5: Cấu Hình API trong Admin

1. Vào admin dashboard: `https://yourapp.com/admin/affiliate-settings`

2. Nhập thông tin:
   - **API URL**: `https://api.accesstrade.vn/v1`
   - **API Token**: Token từ AccessTrade Publisher account
   - **Link Mode**: Chọn `API Mode` (khuyến nghị)
   - **Publisher ID**: ID của bạn (mặc định: `4790392958945222748`)

3. Click **Test Kết Nối API**
   - Nếu thành công → Click **Lưu Cấu Hình**
   - Nếu thất bại → Kiểm tra lại token

4. Xác nhận:
   - Trạng thái hiển thị "API Token: Đã cấu hình"
   - Test API lần cuối: "Thành công"

---

## 🧪 TESTING

### Test 1: Database Schema

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('affiliate_settings', 'merchants');

-- Should return 2 rows
```

### Test 2: API Endpoints

```bash
# Get settings (requires admin login)
curl -X GET https://yourapp.com/api/admin/affiliate-settings \
  -H "Cookie: your-auth-cookie"

# Expected response:
{
  "success": true,
  "data": {
    "id": "...",
    "api_url": "https://api.accesstrade.vn/v1",
    "link_mode": "api",
    "has_api_token": false
  }
}
```

### Test 3: UI Access

1. Login as admin
2. Vào `/admin/affiliate-settings`
3. Nên thấy form cấu hình
4. Thử nhập API token (fake) và click Test
5. Nên báo lỗi authentication

### Test 4: API Connection

Với API token thật:
1. Nhập token vào form
2. Click "Test Kết Nối API"
3. Chờ ~5 giây
4. Nên thấy: "Kết nối thành công! Token is valid."

---

## 📊 DATABASE STRUCTURE

### affiliate_settings (1 row - global config)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| api_token | TEXT | AccessTrade token (encrypted) |
| api_url | TEXT | API base URL |
| link_mode | VARCHAR | 'api' or 'deeplink' |
| publisher_id | VARCHAR | iSclix publisher ID |
| utm_source | VARCHAR | Fixed: 'video-affiliate' |
| utm_campaign | VARCHAR | Fixed: 'review' |
| is_active | BOOLEAN | Enable/disable |
| last_tested_at | TIMESTAMPTZ | Last API test time |
| test_status | VARCHAR | 'success', 'failed', 'pending' |
| test_message | TEXT | Test result message |

### merchants (4 rows - supported platforms)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Merchant name |
| domain | VARCHAR | Domain (unique) |
| logo_url | TEXT | Logo image URL |
| platform | VARCHAR | 'accesstrade', 'isclix' |
| campaign_id | VARCHAR | **AccessTrade campaign ID** |
| deep_link_base | TEXT | Homepage URL |
| is_active | BOOLEAN | Enable/disable |
| display_order | INT | Sort order |

---

## 🔑 KEY FEATURES

### Dual Mode Strategy

**API Mode (Primary):**
- Sử dụng AccessTrade API chính thức
- Tỷ lệ tracking conversion CAO hơn
- Set cookies tốt hơn
- Tự động lấy short link từ API

**Deeplink Mode (Backup):**
- Tạo link thủ công (manual deeplink)
- Không cần API call
- Fallback khi API lỗi hoặc rate limit
- Vẫn track được nhưng tỷ lệ thấp hơn

**Auto-Fallback Logic:**
```typescript
// Khi tạo affiliate link:
1. Check link_mode trong settings
2. Nếu API mode:
   - Try call AccessTrade API
   - If success → Use API link
   - If fail → Fallback to deeplink
3. Nếu Deeplink mode:
   - Generate deeplink directly
```

### Security

- ✅ API token stored encrypted in database
- ✅ Token masked in API responses (`abc12345...xyz9`)
- ✅ Admin-only access (RBAC check)
- ✅ Test endpoint with timeout protection

### Monitoring

- ✅ Last test timestamp
- ✅ Test status (success/failed)
- ✅ Test message for debugging
- ✅ UI indicators (green/red status)

---

## 🔧 TROUBLESHOOTING

### Issue 1: Migration fails

**Error**: `relation "affiliate_settings" already exists`

**Solution**:
```sql
-- Drop and recreate
DROP TABLE IF EXISTS affiliate_settings CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- Then run migration again
```

### Issue 2: API test fails with 401

**Cause**: Invalid API token

**Solution**:
1. Vào AccessTrade Publisher dashboard
2. Vào Settings → API Management
3. Generate new token
4. Copy và paste vào form

### Issue 3: "Permission denied"

**Cause**: User không phải admin

**Solution**:
```sql
-- Grant admin role
UPDATE users
SET role = 'admin'
WHERE email = 'your@email.com';
```

### Issue 4: Merchants không hiển thị

**Check**:
```sql
SELECT * FROM merchants WHERE is_active = true;
```

**Fix**:
```sql
UPDATE merchants
SET is_active = true
WHERE is_active = false;
```

---

## 📝 NEXT STEPS

Sau khi setup xong module này, tiếp tục:

1. ✅ **Phase 2**: Implement affiliate link generators
   - DeeplinkGenerator (manual)
   - AccessTradeGenerator (API)
   - TikTokGenerator (TikTok Shop API)

2. ✅ **Phase 3**: Create affiliate links API
   - POST /api/affiliate (create link)
   - GET /api/affiliate?review_id=xxx
   - DELETE /api/affiliate/:id

3. ✅ **Phase 4**: UI trong Review Edit page
   - Affiliate Links Tab
   - Add Link Dialog
   - Copy button

4. ✅ **Phase 5**: URL Shortener
   - Short URLs table
   - Redirect endpoint
   - Click tracking

---

## 💡 TIPS

1. **Test với một merchant trước** (Shopee) để đảm bảo flow hoạt động

2. **Lưu API token backup** - Nếu mất token, phải generate lại

3. **Monitor test status** - Nếu test failed, check lại token

4. **Campaign IDs chuẩn xác** - Sai campaign ID = không track được conversion

5. **Deeplink mode luôn sẵn sàng** - Backup khi API down

---

## 📊 SUCCESS METRICS

Sau khi setup, check:

- [ ] Database migration chạy thành công
- [ ] 4 merchants hiển thị trong database
- [ ] Admin page load được
- [ ] API test thành công
- [ ] Settings lưu được
- [ ] Test status = 'success'

Tất cả ✅ = Ready cho Phase 2!
