# Phân Tích Hệ Thống Affiliate - Dashboard & Monitoring

## 📊 Tổng Quan Hệ Thống

### Kiến trúc hiện tại

```
┌─────────────────────────────────────────────────────────────┐
│                    AFFILIATE SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Settings   │  │    Links     │  │  Shortener   │      │
│  │              │  │              │  │              │      │
│  │ • API Token  │  │ • Generate   │  │ • Create     │      │
│  │ • Publisher  │  │ • Track      │  │ • Redirect   │      │
│  │ • Merchants  │  │ • Analytics  │  │ • Analytics  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │  Dashboard  │                         │
│                    │  Monitoring │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Phân Tích Chi Tiết Từng Module

### 1. **Affiliate Settings** (`/admin/affiliate-settings`)

#### ✅ Đã Có:
- **4 Tabs đầy đủ:**
  - Cấu Hình API (API Token, Publisher ID, UTM params)
  - Merchants Management (CRUD merchants)
  - Test Link (Test tạo affiliate links)
  - Short URLs (Quản lý URL rút gọn)

- **Tính năng:**
  - ✅ Mã hóa AES-256-GCM cho API token & Publisher ID
  - ✅ Masking sensitive data (hiển thị ***)
  - ✅ Test kết nối API
  - ✅ Tự động tạo tracking links
  - ✅ Fallback: API → Deeplink

#### ⚠️ Thiếu:
- ❌ Không có monitoring real-time
- ❌ Không có dashboard tổng hợp
- ❌ Không có analytics/charts
- ❌ Không có danh sách links đã tạo
- ❌ Không có export reports

### 2. **Affiliate Links Module**

#### Database Schema:

```sql
Table: affiliate_links
├── id (UUID)
├── user_id (UUID) → auth.users
├── review_id (UUID) → reviews
├── merchant_id (UUID) → merchants
├── original_url (TEXT)
├── affiliate_url (TEXT) - Generated tracking URL
├── short_url (VARCHAR) - Optional shortened version
├── link_type (VARCHAR) - 'product' | 'homepage'
├── generation_method (VARCHAR) - 'api' | 'deeplink' | 'tiktok-api'
├── aff_sid (VARCHAR) - Unique tracking ID
├── label (VARCHAR) - Optional label
├── display_order (INT)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

#### API Endpoints:

| Endpoint | Method | Chức năng | Status |
|----------|--------|-----------|--------|
| `/api/affiliate-links/generate` | POST | Tạo affiliate link | ✅ Hoạt động |
| `/api/affiliate-links/bulk-generate` | POST | Tạo nhiều links | ✅ Hoạt động |
| `/api/affiliate-links/click` | POST | Track clicks | ✅ Hoạt động |

#### ✅ Hoạt động tốt:
- Tự động tạo tracking links
- Fallback mechanism
- Click tracking trong JSONB (reviews.affiliate_links)
- Integration với review creation

#### ⚠️ Cần cải tiến:
- ❌ Không có UI để xem danh sách tất cả links
- ❌ Không có filtering/search
- ❌ Không có export danh sách
- ❌ Không có bulk actions (delete, update)
- ❌ Không có detailed analytics per link

### 3. **URL Shortener Module**

#### Database Schema:

```sql
Table: short_urls
├── id (UUID)
├── short_code (VARCHAR) - Unique 4-10 chars
├── original_url (TEXT)
├── review_id (UUID) → reviews
├── aff_sid (VARCHAR) - Link to affiliate tracking
├── merchant_id (UUID) → merchants
├── title (VARCHAR)
├── description (TEXT)
├── clicks (INT) - Simple counter
├── last_clicked_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
├── expires_at (TIMESTAMPTZ)
├── is_active (BOOLEAN)
├── created_by (UUID) → user_profiles
└── variant (VARCHAR) - A/B testing

Table: short_url_clicks (Optional - detailed tracking)
├── id (UUID)
├── short_url_id (UUID) → short_urls
├── clicked_at (TIMESTAMPTZ)
├── user_agent (TEXT)
├── ip_address (INET)
├── referrer (TEXT)
├── country (VARCHAR)
├── city (VARCHAR)
├── device_type (VARCHAR)
├── browser (VARCHAR)
└── os (VARCHAR)
```

#### API Endpoints:

| Endpoint | Method | Chức năng | Status |
|----------|--------|-----------|--------|
| `/api/shortener/create` | POST | Tạo short URL | ✅ Hoạt động |
| `/s/[code]` | GET | Redirect & track | ✅ Hoạt động |

#### ✅ Hoạt động tốt:
- Tạo short URLs tự động
- Base62 encoding cho codes
- Click tracking
- Expiration support
- RLS policies đầy đủ

#### ⚠️ Cần cải tiến:
- ❌ UI quản lý chưa đầy đủ
- ❌ Không có analytics dashboard
- ❌ Detailed click tracking chưa enabled (cần feature flag)
- ❌ Không có geo-location tracking
- ❌ Không có device/browser breakdown

### 4. **Dashboard UI**

#### Current Dashboard (`/dashboard`):

**Có:**
- ✅ Stats cards (Reviews, Schedules, Posts)
- ✅ Charts (7 days trend)
- ✅ Platform distribution
- ✅ Recent activity
- ✅ Auto-refresh

**Không có về Affiliate:**
- ❌ Affiliate stats
- ❌ Link performance
- ❌ Click tracking
- ❌ Merchant comparison
- ❌ Revenue/conversion tracking

## 🎯 Đề Xuất Cải Tiến

### **Cấp độ 1: Thiết yếu (Ngay lập tức)**

#### 1.1. Affiliate Dashboard Tổng Hợp
✅ **ĐÃ TẠO**: `/admin/affiliate-dashboard`

**Bao gồm:**
- [ ] Real-time stats cards
- [ ] Top performing merchants
- [ ] Recent affiliate links
- [ ] Click trends (7 days)
- [ ] Conversion funnel

#### 1.2. Link Management UI

**Cần:**
- [ ] Danh sách tất cả affiliate links
- [ ] Filter by merchant, method, date
- [ ] Search by URL
- [ ] Bulk actions (delete, deactivate)
- [ ] Export to CSV
- [ ] Edit labels

#### 1.3. Short URL Management UI

**Cần:**
- [ ] Danh sách tất cả short URLs
- [ ] Click statistics per URL
- [ ] Refresh expired links
- [ ] QR code generation
- [ ] Analytics per short URL

### **Cấp độ 2: Quan trọng (Tuần tới)**

#### 2.1. Analytics Dashboard

**Features:**
- [ ] Click heatmap (by hour, day)
- [ ] Device breakdown (mobile, desktop, tablet)
- [ ] Referrer sources
- [ ] Geographic distribution
- [ ] Conversion funnel
- [ ] A/B testing results

#### 2.2. Reporting System

**Features:**
- [ ] Daily/Weekly/Monthly reports
- [ ] Email notifications
- [ ] Export to PDF/CSV
- [ ] Custom date ranges
- [ ] Compare periods
- [ ] Merchant performance reports

### **Cấp độ 3: Nâng cao (Tháng tới)**

#### 3.1. Advanced Features

- [ ] Auto-optimization (pause low-performing links)
- [ ] Smart link rotation
- [ ] Fraud detection
- [ ] Revenue tracking integration
- [ ] API webhooks for events
- [ ] Custom domains for short URLs

#### 3.2. Integrations

- [ ] Google Analytics integration
- [ ] Facebook Pixel tracking
- [ ] Slack notifications
- [ ] Zapier webhooks

## 📈 Metrics Cần Tracking

### Primary Metrics:
1. **CTR (Click-Through Rate)**
   - Formula: `(Total Clicks / Total Links) * 100`
   - Target: > 5%

2. **Conversion Rate**
   - Formula: `(Conversions / Total Clicks) * 100`
   - Target: > 2%

3. **Average Click per Link**
   - Formula: `Total Clicks / Total Links`
   - Target: > 10

4. **Top Merchant Performance**
   - Merchant with most clicks
   - Merchant with highest conversion

### Secondary Metrics:
- Links created per day
- Short URLs created per day
- Active vs Inactive links ratio
- Expired links count
- API vs Deeplink generation ratio
- Failed link generations
- Average response time

## 🔧 Technical Recommendations

### 1. Database Optimizations

```sql
-- Add indexes for analytics queries
CREATE INDEX idx_affiliate_links_created_at_desc ON affiliate_links(created_at DESC);
CREATE INDEX idx_short_urls_clicks_desc ON short_urls(clicks DESC) WHERE is_active = true;
CREATE INDEX idx_short_url_clicks_clicked_at ON short_url_clicks(clicked_at DESC);

-- Add materialized view for stats
CREATE MATERIALIZED VIEW affiliate_stats_daily AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as links_created,
  COUNT(DISTINCT merchant_id) as unique_merchants,
  COUNT(DISTINCT user_id) as unique_users
FROM affiliate_links
GROUP BY DATE(created_at);
```

### 2. Caching Strategy

```typescript
// Redis cache for stats
const CACHE_KEYS = {
  AFFILIATE_STATS: 'affiliate:stats',
  TOP_MERCHANTS: 'affiliate:top_merchants',
  RECENT_LINKS: 'affiliate:recent_links',
};

const CACHE_TTL = {
  STATS: 5 * 60, // 5 minutes
  MERCHANTS: 15 * 60, // 15 minutes
  LINKS: 1 * 60, // 1 minute
};
```

### 3. Real-time Updates

```typescript
// WebSocket for live updates
const socket = io();
socket.on('affiliate:new_click', (data) => {
  updateClickCounter(data.linkId, data.clicks);
});
```

## 🚀 Roadmap

### Phase 1: Foundation (Tuần 1)
- [x] Affiliate Dashboard page
- [x] Stats API endpoint
- [ ] Link Management UI
- [ ] Short URL Management UI

### Phase 2: Analytics (Tuần 2-3)
- [ ] Click tracking dashboard
- [ ] Charts & graphs
- [ ] Device/Browser breakdown
- [ ] Export reports

### Phase 3: Advanced (Tuần 4+)
- [ ] Auto-optimization
- [ ] Fraud detection
- [ ] Revenue tracking
- [ ] API webhooks

## 📝 Kết Luận

**Điểm mạnh:**
- ✅ Hệ thống affiliate cơ bản hoàn chỉnh
- ✅ Database schema tốt
- ✅ API endpoints đầy đủ
- ✅ Security tốt (encryption, RLS)

**Cần cải thiện:**
- ⚠️ UI monitoring chưa có
- ⚠️ Analytics chưa đầy đủ
- ⚠️ Reporting chưa có
- ⚠️ Real-time tracking chưa optimal

**Ưu tiên triển khai:**
1. Affiliate Dashboard (ĐÃ TẠO)
2. Link Management UI
3. Analytics Charts
4. Export/Reports

---

**Ngày phân tích**: 28/12/2025
**Phiên bản**: 1.0
**Tác giả**: Claude Code Analysis
