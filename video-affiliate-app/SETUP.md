# 🚀 Quick Setup Guide

## Bước 1: Install Dependencies

```bash
cd video-affiliate-app
npm install
```

## Bước 2: Cấu Hình Environment

Tạo file `.env.local`:

```env
# Database - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI - Chọn 1 trong 2
OPENAI_API_KEY=sk-...
# HOẶC
# ANTHROPIC_API_KEY=sk-ant-...

# YouTube API
YOUTUBE_API_KEY=AIza...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Bước 3: Setup Database

1. Tạo Supabase project tại https://supabase.com
2. Copy SQL từ `lib/db/schema.sql`
3. Paste vào SQL Editor trong Supabase Dashboard
4. Execute

## Bước 4: Run Development Server

```bash
npm run dev
```

Mở http://localhost:3000

## 📝 Checklist

- [ ] Đã install dependencies
- [ ] Đã tạo `.env.local` với tất cả keys
- [ ] Đã setup Supabase database
- [ ] Server chạy thành công
- [ ] Truy cập được http://localhost:3000

## 🔑 Lấy API Keys

### Supabase

1. Truy cập https://supabase.com
2. Tạo project mới
3. Settings → API → Copy URL và keys

### OpenAI

1. Truy cập https://platform.openai.com
2. API Keys → Create new key

### YouTube

1. Truy cập https://console.cloud.google.com
2. Tạo project → Enable YouTube Data API v3
3. Credentials → Create API Key

## ❗ Troubleshooting

### Module not found

```bash
npm install
```

### Database connection error

- Kiểm tra Supabase URL và keys
- Verify đã chạy migration

### AI không hoạt động

- Kiểm tra API key
- Verify billing/credits còn

## 🎯 Next Steps

1. Truy cập `/dashboard/create`
2. Nhập link YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ
3. Nhấn "Phân tích"
4. Xem AI tạo nội dung tự động

## 📚 Tài Liệu

- [README.md](./README.md) - Hướng dẫn đầy đủ
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
