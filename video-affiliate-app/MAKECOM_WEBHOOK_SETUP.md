# Hướng dẫn cấu hình Make.com Webhook URL

## Bước 1: Lấy Webhook URL từ Make.com
1. Vào Make.com dashboard
2. Mở scenario của bạn
3. Click vào module "Webhooks" (Custom webhook)
4. Copy webhook URL (dạng: https://hook.eu1.make.com/xxxxx)

## Bước 2: Tạo file .env.local
Tạo file .env.local trong thư mục gốc với nội dung:

```bash
# Make.com Webhook Configuration
MAKECOM_WEBHOOK_URL=https://hook.eu1.make.com/your_webhook_id_here
MAKECOM_WEBHOOK_SECRET=your_webhook_secret_here

# Database (nếu chưa có)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Bước 3: Restart Server
Sau khi tạo .env.local, restart server:
```bash
npm run dev
```

## Bước 4: Test Webhook
```bash
# Test với webhook URL thật
curl -X POST http://localhost:3000/api/test-makecom-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl":"https://hook.eu1.make.com/your_webhook_id_here"}'
```

## Bước 5: Trigger Manual Cron
```bash
# Trigger manual cron để xử lý schedules
curl -X POST http://localhost:3000/api/manual-cron
```
