# Affiliate Links Sync System - Tài liệu triển khai

## 📋 Tổng quan

Hệ thống đồng bộ affiliate links được thiết kế để:
1. **Giữ nguyên** kiến trúc hiện tại (lưu trong `reviews.affiliate_links` JSONB)
2. **Thêm song song** tracking vào bảng `affiliate_links` riêng
3. **Không ảnh hưởng** code cron/posting hiện tại
4. **Tracking chính xác** qua cấu trúc UTM tối ưu

---

## 🎯 Cấu trúc UTM mới (Đã cải tiến)

### **Trước đây (không tối ưu):**
```
utm_source=video-affiliate    ✅ Cố định
utm_medium=affiliate          ✅ Cố định
utm_campaign=review           ❌ Cố định - không phân biệt được merchant
utm_content=shopee            ✅ Tên merchant
```

### **Sau khi sửa (tối ưu cho tracking):**
```
utm_source=video-affiliate    ✅ Nguồn traffic (cố định)
utm_medium=affiliate          ✅ Loại traffic (cố định)
utm_campaign=shopee           ✅ Tên merchant (ĐỘNG) ← Tracking merchant nào
utm_content=review            ✅ Loại content (từ settings)
```

### **Lợi ích:**
- Trong AccessTrade dashboard, bạn thấy ngay:
  - **Campaign**: `shopee` / `lazada` / `tiki` → Đơn từ sàn nào
  - **Content**: `review` → Đơn từ loại content nào
- Dễ dàng phân tích hiệu suất theo từng merchant
- Linh hoạt thay đổi content type (`review`, `comparison`, `unboxing`, etc.)

---

## 🏗️ Kiến trúc hệ thống

### **Luồng hoạt động:**

```
User tạo Review với Affiliate Links
          ↓
┌─────────────────────────────────┐
│ API: /api/create-review         │
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│ 1. Lưu vào reviews table        │
│    - affiliate_links (JSONB)    │ ← Code hiện tại (GIỮ NGUYÊN)
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│ 2. Sync sang affiliate_links    │
│    table (SONG SONG)            │ ← Code mới (THÊM)
└─────────────────────────────────┘
          ↓
┌─────────────────────────────────┐
│ ✅ Hoàn thành                   │
│ - JSONB: Cho cron/posting       │
│ - Table: Cho tracking/analytics │
└─────────────────────────────────┘
```

### **Các file đã sửa/thêm:**

#### **1. UTM Structure (Đã sửa):**
- `lib/affiliate/generators/accesstrade-generator.ts` (line 40-58)
- `lib/affiliate/generators/deeplink-generator.ts` (line 39-50)

#### **2. Sync Service (Mới):**
- `lib/affiliate/services/sync-service.ts` (Mới tạo - 245 dòng)
  - `syncToAffiliateLinkTable()` - Sync khi tạo review
  - `updateSyncedLinks()` - Re-sync khi update review
  - `deleteSyncedLinks()` - Xóa khi xóa review
  - `getSyncStats()` - Thống kê sync

#### **3. API Integration (Đã sửa):**
- `app/api/create-review/route.ts` (line 6, 97-111)
  - Thêm sync sau khi lưu review
- `app/api/reviews/[id]/route.ts` (line 6, 58-69, 142-156)
  - Thêm re-sync khi update
  - Thêm delete sync khi xóa

#### **4. UI Update (Đã sửa):**
- `app/admin/affiliate-settings/page.tsx` (line 596-604)
  - Đổi label từ "UTM Campaign" → "UTM Content"
  - Thêm tooltip giải thích

---

## 🔧 Chi tiết implementation

### **1. Cấu trúc dữ liệu trong bảng affiliate_links:**

```sql
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  review_id UUID,              -- Link tới review
  merchant_id UUID NOT NULL,   -- Link tới merchant (Shopee, Lazada...)

  -- URLs
  original_url TEXT NOT NULL,     -- URL gốc sản phẩm
  affiliate_url TEXT NOT NULL,    -- URL affiliate đầy đủ (với UTM)
  short_url VARCHAR(255),         -- URL rút gọn (optional)

  -- Tracking
  aff_sid VARCHAR(100) NOT NULL,  -- Tracking ID unique
  generation_method VARCHAR(20),  -- 'api', 'deeplink', 'tiktok-api'

  -- Metadata
  link_type VARCHAR(20),          -- 'product' hoặc 'homepage'
  label VARCHAR(255),             -- Giá/discount để hiển thị
  display_order INT,              -- Thứ tự hiển thị

  -- Timestamps
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### **2. Logic sync trong create review:**

```typescript
// Sau khi lưu review thành công
if (affiliateLinks && affiliateLinks.length > 0) {
  console.log('🔄 Syncing affiliate links to tracking table...');

  const syncResult = await affiliateLinksSyncService.syncToAffiliateLinkTable(
    review.id,      // Review ID
    userId,         // User ID
    affiliateLinks  // Array từ JSONB
  );

  if (syncResult.success) {
    console.log(`✅ Synced ${syncResult.synced} affiliate links`);
  } else {
    console.warn('⚠️ Some links failed to sync:', syncResult.errors);
  }
}
```

### **3. Logic sync trong update review:**

```typescript
// Khi update affiliate_links
if (updates.affiliate_links && userId) {
  console.log('🔄 Re-syncing affiliate links after update...');

  // Delete cũ + Insert mới
  const syncResult = await affiliateLinksSyncService.updateSyncedLinks(
    id,                          // Review ID
    userId,                      // User ID
    updates.affiliate_links      // Array mới
  );

  console.log(`✅ Re-synced ${syncResult.synced} affiliate links`);
}
```

### **4. Merchant mapping:**

Sync service tự động map merchant:
1. Tìm merchant bằng `merchantId` (nếu có)
2. Nếu không có, tìm bằng `platform` name
3. Nếu vẫn không có, skip link đó

### **5. UTM parameters được tạo:**

```typescript
// Trong sync-service.ts
const utmCampaign = merchantName.toLowerCase().replace(/\s+/g, '-');
const utmContent = utmContentType; // Từ settings (mặc định: "review")

// URL sẽ có dạng:
// ?utm_source=video-affiliate
// &utm_medium=affiliate
// &utm_campaign=shopee          ← Tên merchant (tracking chính)
// &utm_content=review            ← Loại nội dung
```

---

## 📊 Testing

### **Script test:**
```bash
node test-affiliate-sync.js
```

**Kết quả hiện tại:**
- ✅ Bảng `affiliate_links` tồn tại
- ✅ Settings đã cấu hình đúng
- ⚠️ Chưa có dữ liệu sync (cần tạo review mới để test)

### **Test checklist:**

1. **Tạo review mới:**
   - ✅ Lưu vào `reviews.affiliate_links` (JSONB)
   - ✅ Sync song song vào bảng `affiliate_links`
   - ✅ Merchant mapping đúng
   - ✅ UTM structure: campaign=merchant, content=review

2. **Update review:**
   - ✅ Update JSONB
   - ✅ Delete links cũ trong table
   - ✅ Insert links mới vào table

3. **Delete review:**
   - ✅ Delete review
   - ✅ Cascade delete links trong table

4. **Cron/Posting:**
   - ✅ Vẫn đọc từ JSONB như cũ
   - ✅ Không bị ảnh hưởng

---

## 🎯 Lợi ích

### **1. Không phá vỡ code hiện tại:**
- ✅ Cron vẫn đọc từ `reviews.affiliate_links` (JSONB)
- ✅ Posting vẫn hoạt động bình thường
- ✅ Không cần migration dữ liệu cũ

### **2. Tracking chính xác:**
- ✅ Biết đơn hàng từ merchant nào (utm_campaign)
- ✅ Biết loại content nào (utm_content)
- ✅ Có dữ liệu lịch sử chi tiết trong bảng riêng

### **3. Dễ mở rộng:**
- ✅ Có thể thêm tracking clicks chi tiết sau
- ✅ Có thể tạo báo cáo phân tích
- ✅ Có thể tích hợp URL shortener

### **4. Performance:**
- ✅ Query nhanh hơn (index trên bảng riêng)
- ✅ Không ảnh hưởng tốc độ posting
- ✅ Async sync (không block user)

---

## 📈 Sử dụng dữ liệu tracking

### **Query ví dụ:**

```sql
-- Top merchants theo số lượng links
SELECT
  m.name,
  COUNT(*) as total_links
FROM affiliate_links al
JOIN merchants m ON al.merchant_id = m.id
GROUP BY m.name
ORDER BY total_links DESC;

-- Links theo user
SELECT
  u.email,
  m.name as merchant,
  COUNT(*) as link_count
FROM affiliate_links al
JOIN user_profiles u ON al.user_id = u.id
JOIN merchants m ON al.merchant_id = m.id
GROUP BY u.email, m.name
ORDER BY link_count DESC;

-- Links tạo gần đây
SELECT
  al.created_at,
  m.name as merchant,
  al.generation_method,
  al.affiliate_url
FROM affiliate_links al
JOIN merchants m ON al.merchant_id = m.id
ORDER BY al.created_at DESC
LIMIT 10;
```

### **Trong AccessTrade Dashboard:**

Bạn sẽ thấy báo cáo theo:
- **Campaign = Merchant**: `shopee`, `lazada`, `tiki`, `tiktok-shop`
- **Content = Type**: `review`, `comparison`, `unboxing`
- **Source**: `video-affiliate`

→ Dễ dàng phân tích merchant nào hiệu quả nhất

---

## ⚠️ Lưu ý quan trọng

### **1. Không cần migration dữ liệu cũ:**
- Dữ liệu cũ vẫn ở JSONB
- Chỉ reviews MỚI mới được sync vào bảng
- Nếu muốn sync cũ, chạy script riêng

### **2. Error handling:**
- Nếu sync fails, review vẫn được tạo
- Chỉ log warning, không block request
- Có thể re-sync sau bằng cách update review

### **3. Performance:**
- Sync chạy AFTER review được save
- Không block response về user
- Nếu có nhiều links (>10), có thể hơi chậm

### **4. Merchant mapping:**
- Merchant phải tồn tại trong bảng `merchants`
- Nếu không tìm thấy merchant, link sẽ bị skip
- Kiểm tra merchant trước khi tạo review

---

## 🚀 Next Steps (Optional)

1. **URL Shortener integration:**
   - Tích hợp bảng `short_urls`
   - Tự động tạo short URL khi sync
   - Tracking clicks chi tiết

2. **Analytics Dashboard:**
   - Trang admin xem thống kê
   - Charts theo merchant
   - Export reports

3. **Batch sync dữ liệu cũ:**
   - Script migrate JSONB → table
   - Cho 171 links hiện tại

4. **Click tracking:**
   - Update clicks vào cả JSONB và table
   - Sync 2 chiều

---

## 📞 Support

Nếu có vấn đề:
1. Check logs console khi tạo review
2. Chạy `node test-affiliate-sync.js`
3. Query trực tiếp bảng `affiliate_links`
4. Kiểm tra merchant mapping

---

**Ngày tạo**: 30/12/2024
**Version**: 1.0
**Status**: ✅ Completed & Ready for testing
