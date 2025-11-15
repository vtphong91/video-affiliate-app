# Phân Tích Hệ Thống Cron và Scheduling

## 🔍 Tổng Quan Vấn Đề

Vấn đề báo cáo: **Lịch đăng bài quá hạn nhưng không tự động đăng theo lịch**

Thời gian phân tích: 2025-11-15

---

## 📊 Kiến Trúc Hệ Thống Hiện Tại

### 1. Quy Trình Tự Động Đăng Bài

```
User tạo schedule (GMT+7)
    ↓ (convert to UTC via createTimestampFromDatePicker)
Database lưu scheduled_for (UTC timestamptz)
    ↓
GitHub Actions (chạy mỗi 5 phút)
    ↓ (POST /api/manual-cron với CRON_SECRET)
API endpoint /api/manual-cron
    ↓ (gọi CronService.processSchedules)
CronService lấy pending schedules (scheduled_for <= NOW())
    ↓ (build webhook payload)
Gửi webhook đến Make.com (MAKECOM_WEBHOOK_URL)
    ↓
Make.com đăng lên Facebook
    ↓
Update schedule status = 'posted'
```

### 2. Các Component Chính

#### File: `lib/services/cron-service.ts`
- **Chức năng**: Xử lý schedules đến hạn và gửi webhook
- **Điểm quan trọng**:
  - Line 390-446: `getPendingSchedules()` - Lấy ALL pending rồi filter bằng JavaScript
  - Line 276-405: `processSchedule()` - Xử lý từng schedule
  - Line 189-210: **CRITICAL** - Nếu không có MAKECOM_WEBHOOK_URL, schedule sẽ được mark "posted_without_webhook" nhưng KHÔNG thực sự đăng

#### File: `app/api/manual-cron/route.ts`
- **Chức năng**: Endpoint để GitHub Actions trigger
- **Điểm quan trọng**:
  - Line 11-27: Xác thực CRON_SECRET (Bearer token hoặc x-cron-secret header)
  - Nếu secret sai → trả về 401 Unauthorized

#### File: `.github/workflows/cron.yml`
- **Chức năng**: GitHub Actions workflow chạy cron job
- **Lịch chạy**: Mỗi 5 phút (`*/5 * * * *`)
- **Dependencies**:
  - `secrets.CRON_SECRET`: Để xác thực với API
  - `secrets.VERCEL_APP_URL`: URL của app deployed trên Vercel

---

## 🐛 CÁC VẤN ĐỀ TIỀM ẨN ĐÃ PHÁT HIỆN

### ❌ VẤN ĐỀ 1: MAKECOM_WEBHOOK_URL Không Được Config (NGHIÊM TRỌNG)

**Vị trí**: `lib/services/cron-service.ts:189`

```typescript
const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
if (!webhookUrl) {
  console.warn('⚠️ MAKECOM_WEBHOOK_URL not configured');

  // Log the error
  await db.updateWebhookLog(scheduleId, {
    response_status: null,
    response_payload: null,
    error_message: 'Webhook URL not configured',
    response_received_at: new Date().toISOString(),
  });

  return {
    success: false,
    error: 'Webhook URL not configured',
    shouldMarkAsPosted: true, // Mark as posted to avoid infinite retries
  };
}
```

**Hệ quả**:
- Schedules quá hạn sẽ được đánh dấu `status = 'posted'`
- **NHƯNG** không có bài nào được đăng lên Facebook thực sự
- User sẽ thấy schedule "posted" nhưng không có bài đăng

**Cách kiểm tra**:
1. Truy cập Vercel Dashboard → Settings → Environment Variables
2. Tìm biến `MAKECOM_WEBHOOK_URL`
3. Nếu không tồn tại → ĐÂY LÀ NGUYÊN NHÂN

**Cách sửa**:
1. Lấy webhook URL từ Make.com scenario
2. Thêm vào Vercel environment variables:
   - Key: `MAKECOM_WEBHOOK_URL`
   - Value: `https://hook.us1.make.com/YOUR_WEBHOOK_ID`
3. Redeploy app

---

### ❌ VẤN ĐỀ 2: GitHub Actions Không Chạy Hoặc Bị Lỗi

**Vị trí**: `.github/workflows/cron.yml`

**Nguyên nhân có thể**:

#### 2.1. GitHub Secrets Chưa Config
File `.github/workflows/cron.yml:22-35` yêu cầu 2 secrets:
- `CRON_SECRET`: Secret để xác thực với API
- `VERCEL_APP_URL`: URL production của app

**Cách kiểm tra**:
1. Truy cập GitHub repository
2. Settings → Secrets and variables → Actions
3. Kiểm tra 2 secrets:
   - `CRON_SECRET` (phải giống với env var CRON_SECRET trên Vercel)
   - `VERCEL_APP_URL` (ví dụ: `https://your-app.vercel.app`)

#### 2.2. GitHub Actions Bị Tắt
**Cách kiểm tra**:
1. GitHub repo → Actions tab
2. Xem "Process Schedules Cron" workflow
3. Kiểm tra:
   - Workflow có enabled không?
   - Workflow runs có chạy mỗi 5 phút không?
   - Có lỗi gì trong recent runs không?

#### 2.3. Workflow Runs Bị Lỗi
**Cách kiểm tra**:
1. GitHub repo → Actions → Process Schedules Cron
2. Click vào run gần nhất
3. Xem logs:
   - ✅ "Cron job triggered successfully" → OK
   - ❌ HTTP 401 → CRON_SECRET sai
   - ❌ HTTP 500 → Lỗi server
   - ❌ Connection refused → VERCEL_APP_URL sai

---

### ❌ VẤN ĐỀ 3: Timezone Conversion Bugs

**Vị trí**: `lib/utils/timezone-utils.ts`

**Rủi ro tiềm ẩn**:

#### 3.1. User Input Không Được Parse Đúng
File `timezone-utils.ts:13-48` - Hàm `createTimestampFromDatePicker()`

```typescript
// Create date in GMT+7 timezone
const gmt7DateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

// Parse as GMT+7 and convert to UTC
const gmt7Date = toZonedTime(new Date(gmt7DateString), TARGET_TIMEZONE);
const utcDate = fromZonedTime(gmt7Date, TARGET_TIMEZONE);
```

**Vấn đề**:
- `new Date(gmt7DateString)` sẽ parse string theo timezone LOCAL của server
- Nếu server không chạy ở GMT+7, kết quả sẽ SAI

**Test case**:
- User chọn: 15/11/2025 14:00 (GMT+7)
- Expected UTC: 2025-11-15T07:00:00Z
- Nếu bug: Có thể lưu thành 2025-11-15T14:00:00Z hoặc giá trị khác

#### 3.2. Database Comparison Có Thể Sai
File `lib/db/supabase.ts:418-432` - Filter schedules

```typescript
const nowTime = Date.now();
const dueSchedules = (data || []).filter((schedule: any) => {
  const scheduledTime = new Date(schedule.scheduled_for).getTime();
  const isDue = scheduledTime <= nowTime;
  return isDue;
});
```

**Phân tích**: Logic này ĐÚNG vì:
- `Date.now()` trả về UTC timestamp
- `new Date(schedule.scheduled_for)` parse UTC string từ database
- So sánh UTC với UTC → Chính xác

**KẾT LUẬN**: Không có bug ở đây.

---

### ❌ VẤN ĐỀ 4: Vercel Function Timeout

**Vị trí**: `vercel.json` (nếu có)

**Rủi ro**:
- Free tier Vercel: Function timeout = 10s
- Nếu processing schedules > 10s → Function bị kill
- Schedules không được xử lý

**Cách kiểm tra**:
1. Xem file `vercel.json`
2. Kiểm tra config timeout
3. Xem Vercel logs để tìm timeout errors

---

### ❌ VẤN ĐỀ 5: Rate Limiting hoặc Network Issues

**Vị trí**: `lib/services/cron-service.ts:183-271`

**Rủi ro**:
- Make.com webhook có rate limit
- Network timeout khi call webhook
- Make.com scenario bị tắt hoặc lỗi

**Cách kiểm tra**:
1. Xem webhook_logs table trong database:
   ```sql
   SELECT * FROM webhook_logs
   ORDER BY request_sent_at DESC
   LIMIT 10;
   ```
2. Tìm patterns:
   - `response_status = null` → Network error
   - `response_status = 429` → Rate limit
   - `response_status = 500` → Make.com error

---

## ✅ HƯỚNG DẪN KIỂM TRA VÀ SỬA LỖI

### Bước 1: Kiểm Tra Environment Variables trên Vercel

Truy cập: Vercel Dashboard → Your Project → Settings → Environment Variables

Đảm bảo có đầy đủ:
- ✅ `MAKECOM_WEBHOOK_URL` (QUAN TRỌNG NHẤT!)
- ✅ `CRON_SECRET`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

**Nếu thiếu bất kỳ biến nào → Thêm vào và Redeploy**

---

### Bước 2: Kiểm Tra GitHub Actions

Truy cập: GitHub Repo → Actions → Process Schedules Cron

**Kiểm tra**:
1. Workflow có enabled không?
2. Recent runs có success không?
3. Nếu failed, xem logs để tìm lỗi

**Fix GitHub Secrets**:
1. Settings → Secrets and variables → Actions
2. Thêm/Update:
   - `CRON_SECRET`: Copy từ Vercel env var
   - `VERCEL_APP_URL`: `https://your-app.vercel.app`

---

### Bước 3: Test Manual Cron Endpoint

Chạy script sau để test:

```bash
# PowerShell (Windows)
./test-manual-cron.ps1

# Hoặc curl (Linux/Mac)
curl -X POST https://your-app.vercel.app/api/manual-cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Kết quả mong đợi**:
```json
{
  "success": true,
  "message": "Schedules processed successfully",
  "processed": 2,
  "posted": 2,
  "failed": 0
}
```

**Nếu lỗi 401 Unauthorized** → CRON_SECRET sai
**Nếu lỗi 500** → Xem Vercel logs để debug

---

### Bước 4: Kiểm Tra Debug Endpoint

Chạy:
```bash
curl -X GET https://your-app.vercel.app/api/cron/debug-schedules \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

Endpoint này sẽ trả về:
- Current time (UTC và GMT+7)
- Pending schedules count
- Due schedules (quá hạn)
- Failed schedules
- Webhook configuration status

**Nếu thấy "overdueCount" > 0** → Có schedules quá hạn chưa được xử lý!

---

### Bước 5: Kiểm Tra Database Trực Tiếp

Nếu có quyền truy cập Supabase:

```sql
-- Xem pending schedules
SELECT
  id,
  video_title,
  scheduled_for,
  status,
  created_at,
  NOW() as current_time,
  (scheduled_for <= NOW()) as is_due
FROM schedules
WHERE status = 'pending'
ORDER BY scheduled_for ASC;

-- Xem failed schedules
SELECT
  id,
  video_title,
  status,
  error_message,
  retry_count,
  max_retries,
  next_retry_at
FROM schedules
WHERE status = 'failed'
ORDER BY next_retry_at ASC;

-- Xem webhook logs gần nhất
SELECT
  wl.*,
  s.video_title
FROM webhook_logs wl
LEFT JOIN schedules s ON wl.schedule_id = s.id
ORDER BY wl.request_sent_at DESC
LIMIT 10;
```

---

## 🔧 CÁC GIẢI PHÁP ĐỀ XUẤT

### Giải Pháp 1: Fix MAKECOM_WEBHOOK_URL (URGENT)

**Nếu biến này thiếu, ĐÂY LÀ NGUYÊN NHÂN CHÍNH**

1. Đăng nhập Make.com
2. Tìm scenario "Post to Facebook"
3. Copy webhook URL (dạng: `https://hook.us1.make.com/...`)
4. Thêm vào Vercel Environment Variables
5. Redeploy app
6. Test lại

---

### Giải Pháp 2: Thêm Monitoring và Alerts

Tạo file mới: `lib/utils/schedule-monitor.ts`

```typescript
// Hàm kiểm tra schedules quá hạn
export async function checkOverdueSchedules() {
  const { data } = await db.getPendingSchedules();
  const now = Date.now();

  const overdue = data.filter(schedule => {
    const scheduledTime = new Date(schedule.scheduled_for).getTime();
    const diffMinutes = (now - scheduledTime) / 60000;
    return diffMinutes > 30; // Quá hạn > 30 phút
  });

  if (overdue.length > 0) {
    // Send alert (email, Slack, etc.)
    console.error(`⚠️ WARNING: ${overdue.length} schedules quá hạn > 30 phút!`);
  }

  return overdue;
}
```

---

### Giải Pháp 3: Cải Thiện Error Handling

Update `cron-service.ts` để KHÔNG mark as "posted" nếu webhook URL thiếu:

```typescript
// Line 189-210 - THAY ĐỔI LOGIC
if (!webhookUrl) {
  console.error('❌ MAKECOM_WEBHOOK_URL not configured - CRITICAL ERROR');

  // KHÔNG mark as posted, để schedule vẫn pending
  return {
    success: false,
    error: 'Webhook URL not configured - Cannot post to Facebook',
    shouldMarkAsPosted: false, // <-- THAY ĐỔI TỪ true → false
  };
}
```

**Lý do**: Nếu không có webhook URL, không nên fake mark as "posted" vì điều này che giấu vấn đề.

---

### Giải Pháp 4: Thêm Retry Logic Thông Minh

Hiện tại: Retry 3 lần với delay 5 phút (cron-service.ts:366-371)

**Cải thiện**: Exponential backoff
- Retry 1: 5 phút
- Retry 2: 15 phút
- Retry 3: 30 phút

```typescript
// Line 370 - Thay đổi
const retryDelays = [5, 15, 30]; // minutes
const delayMinutes = retryDelays[newRetryCount - 1] || 30;

next_retry_at: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()
```

---

## 📋 CHECKLIST KIỂM TRA TOÀN DIỆN

### Environment Variables
- [ ] MAKECOM_WEBHOOK_URL configured on Vercel
- [ ] CRON_SECRET configured on Vercel
- [ ] CRON_SECRET configured in GitHub Secrets
- [ ] VERCEL_APP_URL configured in GitHub Secrets

### GitHub Actions
- [ ] Workflow "Process Schedules Cron" enabled
- [ ] Recent runs showing success (green checkmarks)
- [ ] No 401/500 errors in logs
- [ ] Runs happening every 5 minutes

### Make.com
- [ ] Scenario "Post to Facebook" active
- [ ] Webhook URL correct
- [ ] Facebook token valid
- [ ] Test webhook manually successful

### Database
- [ ] No pending schedules with scheduled_for < NOW()
- [ ] webhook_logs showing successful posts
- [ ] No failed schedules with retry_count >= max_retries

### Testing
- [ ] Manual cron trigger works: `POST /api/manual-cron`
- [ ] Debug endpoint works: `GET /api/cron/debug-schedules`
- [ ] Created test schedule and verified it posted

---

## 🚀 NEXT STEPS

1. **IMMEDIATE** (Trong 1 giờ):
   - Kiểm tra MAKECOM_WEBHOOK_URL trên Vercel
   - Kiểm tra GitHub Actions có chạy không
   - Xem webhook_logs để tìm patterns lỗi

2. **SHORT TERM** (Trong 1 ngày):
   - Fix environment variables nếu thiếu
   - Test manual cron endpoint
   - Verify schedules được posted

3. **LONG TERM** (Trong 1 tuần):
   - Thêm monitoring và alerts
   - Cải thiện error handling
   - Implement exponential backoff retry
   - Thêm unit tests cho timezone logic

---

## 📞 HOW TO USE THIS REPORT

1. **Chạy debug script** (nếu có .env.local):
   ```bash
   npx tsx debug-cron-system.ts
   ```

2. **Không có .env.local?** → Test trên production:
   - Dùng `test-manual-cron.ps1`
   - Dùng curl với debug endpoint
   - Kiểm tra Vercel logs

3. **Tìm thấy vấn đề?** → Follow hướng dẫn "Cách sửa" trong từng section

4. **Cần help?** → Cung cấp:
   - Output của debug script/endpoint
   - GitHub Actions logs
   - Vercel deployment logs
   - Database query results

---

## 📝 CONCLUSION

Dựa trên phân tích code, **nguyên nhân có khả năng cao nhất** là:

1. **MAKECOM_WEBHOOK_URL không được config** (70% khả năng)
2. **GitHub Actions không chạy hoặc secrets sai** (20% khả năng)
3. **Make.com scenario bị tắt hoặc lỗi** (8% khả năng)
4. **Timezone bugs** (2% khả năng - logic có vẻ đúng)

**Khuyến nghị**: Bắt đầu kiểm tra theo thứ tự ưu tiên trên.
