# 🔑 Hướng Dẫn Cấu Hình API Keys

## 📊 Kết Quả Kiểm Tra Hiện Tại

✅ **Gemini API**: Hoạt động tốt
- Model khả dụng: `gemini-2.5-flash`
- Quota: 1500 requests/ngày (MIỄN PHÍ)

✅ **YouTube Data API v3**: Hoạt động tốt
- Quota: 10,000 units/ngày (MIỄN PHÍ)

---

## 🎯 Cách Kiểm Tra API Keys

### Quick Test (Đã tạo sẵn)

```bash
# Test Gemini API
node test-gemini-api.js

# Test YouTube API
node test-youtube-api.js
```

---

## 🆕 Tạo API Keys Mới (Nếu Cần)

### 1. **Google AI Studio API (Gemini)** - Dùng cho phân tích video

#### Bước 1: Truy cập trang tạo API key
🔗 https://aistudio.google.com/app/apikey

#### Bước 2: Đăng nhập Google
- Dùng tài khoản Google cá nhân hoặc công ty

#### Bước 3: Tạo API Key
1. Nhấn nút **"Create API Key"**
2. Chọn **Google Cloud Project** (hoặc tạo mới)
3. Nhấn **"Create API key in new project"** hoặc chọn project có sẵn
4. Copy API key (dạng: `AIzaSy...`)

#### Bước 4: Kiểm tra models có sẵn
🔗 https://aistudio.google.com/

Xem danh sách models:
- ⭐ **gemini-2.5-flash** (Khuyên dùng - Nhanh + Miễn phí)
- gemini-2.5-pro (Chất lượng cao hơn nhưng chậm hơn)
- gemini-2.0-flash-exp (Experimental)

#### Bước 5: Cập nhật `.env.local`
```bash
GOOGLE_AI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
```

---

### 2. **YouTube Data API v3** - Dùng để lấy thông tin video

#### Bước 1: Truy cập Google Cloud Console
🔗 https://console.cloud.google.com/

#### Bước 2: Tạo hoặc chọn Project
1. Góc trên bên trái → Nhấn dropdown "Select a project"
2. Nhấn **"NEW PROJECT"**
3. Đặt tên: `video-affiliate-app` (hoặc tên khác)
4. Nhấn **"CREATE"**
5. Chờ 10-30 giây để project được tạo

#### Bước 3: Enable YouTube Data API v3
1. Truy cập: https://console.cloud.google.com/apis/library
2. Tìm kiếm: **"YouTube Data API v3"**
3. Nhấn vào kết quả đầu tiên
4. Nhấn nút **"ENABLE"** (màu xanh)

#### Bước 4: Tạo Credentials
1. Sau khi enable → Nhấn **"CREATE CREDENTIALS"**
2. Hoặc vào: https://console.cloud.google.com/apis/credentials
3. Nhấn **"+ CREATE CREDENTIALS"** → **"API key"**
4. Copy API key được tạo

#### Bước 5: (Tùy chọn) Bảo mật API Key
1. Nhấn vào API key vừa tạo
2. Phần **"Application restrictions"**:
   - Chọn **"HTTP referrers (web sites)"** nếu dùng cho web
   - Hoặc **"None"** nếu dùng cho server
3. Phần **"API restrictions"**:
   - Chọn **"Restrict key"**
   - Tick chọn **"YouTube Data API v3"**
4. Nhấn **"SAVE"**

#### Bước 6: Cập nhật `.env.local`
```bash
YOUTUBE_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
```

---

## 📝 File `.env.local` Hoàn Chỉnh

```bash
# Database - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider - Priority: Gemini (FREE) > OpenAI > Claude

# ⭐ Google Gemini (FREE 1500 requests/day - RECOMMENDED)
GOOGLE_AI_API_KEY=AIzaSy_YOUR_GEMINI_KEY

# YouTube API (FREE 10,000 units/day)
YOUTUBE_API_KEY=AIzaSy_YOUR_YOUTUBE_KEY

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Make.com Webhook (Nếu có)
MAKECOM_WEBHOOK_URL=https://hook.us2.make.com/...
MAKE_WEBHOOK_SECRET=...
MAKECOM_CALLBACK_SECRET=...

# Cron Job Security
CRON_SECRET=...
```

---

## 🔧 Cấu Hình Model trong Code

Sau khi có API key, cần đảm bảo code dùng đúng model:

### File: `lib/ai/gemini.ts`

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash', // ✅ Model này có sẵn
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2000,
    responseMimeType: 'application/json',
  },
});
```

Nếu model `gemini-2.5-flash` không có, thử:
- `gemini-2.0-flash`
- `gemini-1.5-flash`
- `gemini-1.5-pro`

---

## ⚠️ Troubleshooting

### Lỗi 1: "API key not valid"
**Nguyên nhân:** API key sai hoặc đã hết hạn

**Cách fix:**
1. Kiểm tra API key trong `.env.local`
2. Đảm bảo không có khoảng trắng thừa
3. Tạo API key mới nếu cần

### Lỗi 2: "YouTube API quota exceeded"
**Nguyên nhân:** Vượt quá 10,000 units/ngày

**Cách fix:**
1. Đợi đến 12:00 AM Pacific Time (ngày mới)
2. Hoặc tạo project mới với API key mới
3. Hoặc request tăng quota tại: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas

### Lỗi 3: "YouTube Data API v3 has not been used in project"
**Nguyên nhân:** Chưa enable API trong Google Cloud Console

**Cách fix:**
1. Vào: https://console.cloud.google.com/apis/library/youtube.googleapis.com
2. Chọn đúng project
3. Nhấn **"ENABLE"**

### Lỗi 4: "Model 'gemini-x.x-flash' not found"
**Nguyên nhân:** Model không tồn tại hoặc chưa có quyền truy cập

**Cách fix:**
1. Chạy: `node test-gemini-api.js` để xem models có sẵn
2. Cập nhật model name trong `lib/ai/gemini.ts`

---

## 📊 Monitoring & Quotas

### Gemini API
- Xem usage: https://aistudio.google.com/
- Quota mặc định: **1500 requests/ngày**
- Reset: 12:00 AM Pacific Time

### YouTube Data API
- Xem usage: https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas
- Quota mặc định: **10,000 units/ngày**
- Reset: 12:00 AM Pacific Time

**Cost per operation:**
- Video info (snippet + statistics + contentDetails): 1 unit
- Transcript fetch: MIỄN PHÍ (qua youtube-transcript package)

---

## ✅ Checklist Sau Khi Cấu Hình

- [ ] Chạy `node test-gemini-api.js` → Thấy "✅ ✅ ✅ Gemini API is working correctly!"
- [ ] Chạy `node test-youtube-api.js` → Thấy "✅ ✅ ✅ YouTube API is working correctly!"
- [ ] File `.env.local` có đầy đủ keys
- [ ] Model name trong `lib/ai/gemini.ts` khớp với model có sẵn
- [ ] Restart dev server: `npm run dev`
- [ ] Test phân tích video trên UI: http://localhost:3001

---

## 🆘 Cần Thêm Hỗ Trợ?

### Google AI Studio
- Docs: https://ai.google.dev/docs
- Community: https://discuss.ai.google.dev/

### YouTube Data API
- Docs: https://developers.google.com/youtube/v3
- Support: https://support.google.com/youtube/

### Issues trong Project
- GitHub: Tạo issue mô tả lỗi chi tiết
- Logs: Attach logs từ browser console + terminal

---

## 🎉 Xong!

Nếu cả 2 test scripts đều pass, API keys của bạn đã sẵn sàng sử dụng!
