# Hướng Dẫn Deploy và Configure Vercel Cron

## Các Vấn Đề Đã Fix

### 1. ✅ **Vercel Cron Schedule**
- **Trước:** Chạy 1 lần/ngày lúc 9h sáng (`0 9 * * *`)
- **Sau:** Chạy mỗi 5 phút (`*/5 * * * *`)
- **File:** [vercel.json](vercel.json)

### 2. ✅ **API Authentication**
- **Trước:** Chỉ hỗ trợ `x-cron-secret` header
- **Sau:** Hỗ trợ cả Vercel Cron (header `x-vercel-cron-id`) và manual trigger với secret
- **File:** [app/api/cron/check-schedules/route.ts](app/api/cron/check-schedules/route.ts)

### 3. ✅ **Database Permissions**
- **Trước:** Dùng `supabase` client (có thể bị lỗi permissions)
- **Sau:** Dùng `supabaseAdmin` client (có full permissions)
- **File:** [lib/db/supabase.ts](lib/db/supabase.ts)

### 4. ✅ **Function Timeout**
- Thêm `maxDuration: 60` cho endpoint `/api/cron/check-schedules`
- **File:** [vercel.json](vercel.json)

---

## Các Bước Deploy

### 1. **Push Code Lên GitHub**

```bash
git add .
git commit -m "fix: Configure Vercel Cron to run every 5 minutes with proper authentication"
git push
```

### 2. **Deploy Lên Vercel**

Vercel sẽ tự động deploy khi bạn push code lên GitHub. Hoặc bạn có thể deploy thủ công:

```bash
vercel --prod
```

### 3. **Kiểm Tra Environment Variables Trên Vercel**

Đảm bảo các biến môi trường sau đã được cấu hình:

#### **Required (Bắt buộc):**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase của bạn
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key của Supabase
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (QUAN TRỌNG để getPendingSchedules hoạt động)
- ✅ `MAKECOM_WEBHOOK_URL` - Webhook URL từ Make.com

#### **Optional (Tùy chọn):**
- `CRON_SECRET` - Secret key cho manual trigger (nếu không có sẽ dùng 'dev-secret')
- `GOOGLE_AI_API_KEY` - API key cho Google AI (nếu dùng Gemini)
- `YOUTUBE_API_KEY` - API key cho YouTube Data API

#### **Cách thêm Environment Variables:**

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project của bạn
3. Vào tab **Settings** → **Environment Variables**
4. Thêm từng variable với giá trị tương ứng
5. Nhấn **Save**
6. **Redeploy** project để các biến có hiệu lực

---

## Cách Kiểm Tra Cron Đã Hoạt Động

### 1. **Kiểm Tra Vercel Cron Logs**

1. Vào Vercel Dashboard
2. Chọn project
3. Vào tab **Deployments** → Chọn deployment mới nhất
4. Vào tab **Functions** → Tìm `/api/cron/check-schedules`
5. Xem logs để kiểm tra cron có chạy không

### 2. **Test Manual Trigger**

Bạn có thể test cron thủ công bằng cách:

```bash
# Test với secret
curl -X GET \
  -H "x-cron-secret: dev-secret" \
  https://your-app.vercel.app/api/cron/check-schedules

# Hoặc nếu đã config CRON_SECRET
curl -X GET \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check-schedules
```

### 3. **Debug Schedules**

Dùng endpoint debug để xem chi tiết:

```bash
curl -X GET \
  -H "x-cron-secret: dev-secret" \
  https://your-app.vercel.app/api/cron/debug-schedules
```

Response sẽ có dạng:

```json
{
  "success": true,
  "message": "Debug information retrieved",
  "data": {
    "currentTime": {
      "utc": "2025-10-14T10:00:00.000Z",
      "gmt7": "2025-10-14T17:00:00.000+07:00",
      "gmt7Formatted": "14/10/2025, 17:00:00"
    },
    "pendingSchedules": {
      "count": 2,
      "schedules": [...]
    },
    "failedSchedules": {
      "count": 0,
      "schedules": []
    },
    "webhookConfig": {
      "webhookUrl": "Configured",
      "cronSecret": "Configured"
    }
  }
}
```

---

## Cách Hoạt Động

### **Flow Tự Động:**

```
1. Vercel Cron (mỗi 5 phút)
   ↓
2. GET /api/cron/check-schedules
   ↓
3. getPendingSchedules() - Lấy schedules có status='pending' và scheduled_for <= hiện tại
   ↓
4. Với mỗi schedule:
   - Đổi status = 'processing'
   - Build webhook payload
   - Gửi webhook đến Make.com
   - Nếu thành công: status = 'posted', posted_at = hiện tại
   - Nếu thất bại: status = 'failed', retry_count++, next_retry_at = +15 phút
   ↓
5. Make.com nhận webhook
   ↓
6. Make.com post lên Facebook
```

### **Retry Mechanism:**

- Mỗi schedule có `max_retries` (mặc định là 3)
- Nếu thất bại, schedule sẽ được retry sau 15 phút
- Sau khi hết số lần retry, status sẽ là 'failed' vĩnh viễn

---

## Troubleshooting

### **Vấn đề 1: Cron không chạy**

**Nguyên nhân:**
- Vercel Cron chỉ hoạt động trên **Vercel Pro plan** ($20/tháng)
- Vercel Hobby plan (free) KHÔNG hỗ trợ cron

**Giải pháp:**
1. **Upgrade lên Vercel Pro** (khuyến nghị)
2. Hoặc dùng **GitHub Actions** (xem [.github/workflows/cron.yml](.github/workflows/cron.yml))
3. Hoặc dùng **External Cron Service** như cron-job.org

### **Vấn đề 2: getPendingSchedules trả về rỗng**

**Nguyên nhân:**
- Thiếu `SUPABASE_SERVICE_ROLE_KEY` trên Vercel
- Hoặc schedules không có `scheduled_for <= current time`

**Giải pháp:**
1. Kiểm tra `SUPABASE_SERVICE_ROLE_KEY` đã được config chưa
2. Dùng endpoint `/api/cron/debug-schedules` để xem chi tiết
3. Kiểm tra timezone: Database lưu GMT+7, code cũng dùng GMT+7

### **Vấn đề 3: Webhook gửi thất bại**

**Nguyên nhân:**
- `MAKECOM_WEBHOOK_URL` không đúng hoặc chưa config
- Make.com webhook bị tắt hoặc lỗi

**Giải pháp:**
1. Kiểm tra `MAKECOM_WEBHOOK_URL` trên Vercel
2. Test webhook thủ công:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  YOUR_MAKECOM_WEBHOOK_URL
```
3. Kiểm tra Make.com scenario có đang active không

### **Vấn đề 4: Timezone không đúng**

**Nguyên nhân:**
- Code đang dùng UTC thay vì GMT+7

**Giải pháp:**
- Code đã được fix để dùng GMT+7 trực tiếp
- Kiểm tra [lib/utils/timezone-utils.ts](lib/utils/timezone-utils.ts)
- Format database: `YYYY-MM-DDTHH:mm:ss.sss+07:00`

---

## Alternative: GitHub Actions (FREE)

Nếu không muốn dùng Vercel Pro, có thể dùng GitHub Actions:

1. File [.github/workflows/cron.yml](.github/workflows/cron.yml) đã được tạo sẵn
2. Thêm secrets vào GitHub:
   - `CRON_SECRET` - Secret key của bạn
   - `VERCEL_APP_URL` - URL app trên Vercel (vd: `your-app.vercel.app`)

3. GitHub Actions sẽ tự động chạy mỗi 5 phút

---

## Monitoring

### **Vercel Logs**
- Vào **Vercel Dashboard** → **Functions** → Xem logs real-time

### **Supabase Webhook Logs**
- Kiểm tra table `webhook_logs` để xem lịch sử webhook requests/responses

### **Database Schedules**
- Kiểm tra table `schedules` để xem status của các schedules

---

## Lưu Ý Quan Trọng

⚠️ **KHÔNG thay đổi files trong Auto Cron Webhook Module** trừ khi cần thiết!

Xem thêm: [AUTO_CRON_WEBHOOK_RULES.md](AUTO_CRON_WEBHOOK_RULES.md)

---

## Liên Hệ & Support

Nếu có vấn đề, kiểm tra:
1. Vercel logs
2. Supabase webhook_logs table
3. Debug endpoint: `/api/cron/debug-schedules`

---

**Tạo ngày:** 2025-10-14
**Trạng thái:** ACTIVE - READY TO DEPLOY
