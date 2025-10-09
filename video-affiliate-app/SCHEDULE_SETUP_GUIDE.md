# 📅 Schedule Module - Hướng Dẫn Setup

## 🎯 Tổng Quan

Module Schedule cho phép tự động đăng bài lên Facebook theo lịch đã định trước. Hệ thống sử dụng cron job để kiểm tra và trigger webhook tới Make.com.

## 🗄️ Database Setup

### 1. Chạy Migration

```sql
-- Chạy file migration trong Supabase SQL Editor
-- File: lib/db/schedules-migration.sql
```

### 2. Kiểm tra Tables

```sql
-- Kiểm tra tables đã được tạo
SELECT * FROM schedules LIMIT 5;
SELECT * FROM webhook_logs LIMIT 5;
```

## 🔧 Environment Variables

Thêm vào `.env.local`:

```env
# Cron Job
CRON_SECRET=your-random-secret-string-here

# Make.com Webhook
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
MAKECOM_CALLBACK_SECRET=your-callback-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment Setup

### 1. Vercel Configuration

File `vercel.json` đã được tạo với cron job config:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-schedules",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 2. Environment Variables trên Vercel

Thêm các biến môi trường trong Vercel Dashboard:
- `CRON_SECRET`
- `MAKE_WEBHOOK_URL`
- `MAKECOM_CALLBACK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 🧪 Testing

### 1. Test API Endpoints

```bash
# Test schedules API
curl http://localhost:3000/api/schedules

# Test create schedule
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "your-review-id",
    "scheduledFor": "2024-01-01T10:00:00Z",
    "targetType": "page",
    "targetId": "your-page-id",
    "postMessage": "Test message",
    "landingPageUrl": "https://example.com"
  }'
```

### 2. Test Cron Job

```bash
# Test cron job (sẽ trả về 401 vì thiếu secret)
curl http://localhost:3000/api/cron/check-schedules

# Test với secret
curl -H "x-cron-secret: your-secret" \
  http://localhost:3000/api/cron/check-schedules
```

### 3. Test Callback Handler

```bash
# Test callback endpoint
curl -X POST http://localhost:3000/api/makecom/callback \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": "test-id",
    "status": "success",
    "facebookPostId": "post-123",
    "facebookPostUrl": "https://facebook.com/posts/post-123"
  }'
```

### 4. Browser Console Testing

Mở browser console tại `/dashboard/schedules` và chạy:

```javascript
// Test toàn bộ module
scheduleTests.testScheduleModule();

// Tạo schedule test
scheduleTests.createTestSchedule();

// Test cron job
scheduleTests.triggerCronJobManually();
```

## 📱 UI Testing

### 1. Truy cập Schedule Page

```
http://localhost:3000/dashboard/schedules
```

### 2. Test Features

- ✅ **Tạo lịch mới**: Click "Tạo Lịch Mới"
- ✅ **Xem danh sách**: Tabs All, Pending, Posted, Failed
- ✅ **Thống kê**: Stats cards hiển thị số liệu
- ✅ **Actions**: Edit, Delete, Retry
- ✅ **Responsive**: Test trên mobile/tablet

## 🔄 Workflow Testing

### 1. Tạo Schedule

1. Vào `/dashboard/schedules`
2. Click "Tạo Lịch Mới"
3. Chọn review
4. Chọn thời gian (5 phút sau để test)
5. Nhập Page ID và nội dung
6. Click "Tạo Lịch Đăng Bài"

### 2. Cron Job Trigger

1. Đợi 5 phút (hoặc trigger manual)
2. Kiểm tra logs trong terminal
3. Kiểm tra database: `schedules` table
4. Kiểm tra `webhook_logs` table

### 3. Make.com Integration

1. Make.com nhận webhook
2. Post lên Facebook
3. Gửi callback về `/api/makecom/callback`
4. Update schedule status

## 🐛 Troubleshooting

### 1. Cron Job không chạy

**Kiểm tra:**
- Environment variable `CRON_SECRET` đã set
- Vercel cron job đã enable
- Logs trong Vercel Functions

**Debug:**
```bash
# Test cron endpoint
curl -H "x-cron-secret: your-secret" \
  http://localhost:3000/api/cron/check-schedules
```

### 2. Webhook không gửi được

**Kiểm tra:**
- `MAKE_WEBHOOK_URL` đúng format
- Make.com scenario đang active
- Network connectivity

**Debug:**
```bash
# Test webhook URL
curl -X POST https://hook.eu1.make.com/your-webhook-id \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 3. Callback không nhận được

**Kiểm tra:**
- Make.com scenario có gửi callback
- Callback URL đúng: `https://yourapp.com/api/makecom/callback`
- Database connection

### 4. UI không load

**Kiểm tra:**
- Database connection
- API endpoints hoạt động
- Console errors

**Debug:**
```javascript
// Browser console
scheduleTests.testScheduleAPIs();
scheduleTests.testScheduleUI();
```

## 📊 Monitoring

### 1. Database Queries

```sql
-- Schedules theo status
SELECT status, COUNT(*) FROM schedules GROUP BY status;

-- Schedules hôm nay
SELECT * FROM schedules 
WHERE DATE(created_at) = CURRENT_DATE;

-- Failed schedules cần retry
SELECT * FROM schedules 
WHERE status = 'failed' 
AND retry_count < max_retries 
AND next_retry_at <= NOW();
```

### 2. Webhook Logs

```sql
-- Webhook logs gần đây
SELECT * FROM webhook_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Failed webhooks
SELECT * FROM webhook_logs 
WHERE response_status >= 400 
ORDER BY created_at DESC;
```

### 3. Performance Metrics

- **Cron job execution time**: < 60 seconds
- **Webhook response time**: < 5 seconds
- **Database query time**: < 1 second
- **UI load time**: < 3 seconds

## 🚀 Production Checklist

### Pre-deployment

- [ ] Database migration chạy thành công
- [ ] Environment variables đã set
- [ ] Cron job config trong vercel.json
- [ ] Make.com scenario đã test
- [ ] Webhook URLs đúng

### Post-deployment

- [ ] Test cron job trigger
- [ ] Test webhook gửi tới Make.com
- [ ] Test callback từ Make.com
- [ ] Monitor logs trong 24h đầu
- [ ] Setup error alerting

### Monitoring

- [ ] Database performance
- [ ] Cron job execution logs
- [ ] Webhook success rate
- [ ] UI error rates
- [ ] User feedback

## 📞 Support

Nếu gặp vấn đề:

1. **Check logs**: Terminal, Vercel Functions, Browser Console
2. **Test APIs**: Sử dụng curl hoặc browser console
3. **Check database**: Supabase Dashboard
4. **Verify config**: Environment variables, Make.com scenario
5. **Contact team**: Với logs và error messages

---

**Schedule Module v1.0** - Video Affiliate App
