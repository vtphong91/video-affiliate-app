# Mock Mode - Test Without API Keys

## 🎭 Hiện Tại: MOCK MODE ENABLED

App đang chạy ở **mock mode** để test UI mà không cần API keys thật.

## ✅ Có thể test:

- [x] Nhập link YouTube
- [x] Preview video embed
- [x] AI analysis (fake data)
- [x] Edit nội dung
- [x] Thêm affiliate links
- [x] Preview landing page
- [x] Full UI workflow

## ❌ Không thể test:

- [ ] Video info thật từ YouTube API
- [ ] AI phân tích thật từ OpenAI
- [ ] Save vào Supabase database
- [ ] Đăng lên Facebook

## 🔧 Tắt Mock Mode

Khi đã có API keys, tắt mock mode:

**File:** `app/api/analyze-video/route.ts`

```typescript
// Đổi từ true → false
const MOCK_MODE = false;
```

## 🔑 Cần Setup (để tắt mock mode):

### 1. YouTube Data API v3
```bash
# Lấy tại: https://console.cloud.google.com
YOUTUBE_API_KEY=AIza...
```

### 2. OpenAI API
```bash
# Lấy tại: https://platform.openai.com
# Cần add credits ($5-10)
OPENAI_API_KEY=sk-proj-...
```

### 3. Supabase Database
```bash
# Tạo tại: https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🎯 Test Workflow với Mock Data

1. Vào `/dashboard/create`
2. Nhập: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Click "Phân Tích"
4. Sẽ thấy mock data về iPhone 16 Pro Max
5. Edit nội dung, thêm affiliate links
6. Preview landing page
7. ⚠️ Save sẽ lỗi (cần Supabase)

## 📊 Mock Data Sample

- **Video:** iPhone 16 Pro Max Review
- **Pros:** 5 items
- **Cons:** 3 items
- **Key Points:** 5 timestamps
- **Comparison:** iPhone vs Galaxy vs Pixel
- **Target:** 3 audience groups

Refresh browser và test ngay!
