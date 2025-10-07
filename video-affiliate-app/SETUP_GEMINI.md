# 🆓 Setup Google Gemini API (MIỄN PHÍ)

## ⭐ Tại Sao Chọn Gemini?

- ✅ **HOÀN TOÀN MIỄN PHÍ**: 1500 requests/ngày
- ✅ **KHÔNG CẦN THẺ TÍN DỤNG**
- ✅ **Chất lượng cao**: Tương đương GPT-4
- ✅ **Tiếng Việt tốt**
- ✅ **Tốc độ nhanh**

## 📋 Các Bước Setup (5 phút)

### Bước 1: Lấy API Key

1. Truy cập: https://ai.google.dev/
2. Click nút **"Get API Key"** (góc trên bên phải)
3. Đăng nhập bằng tài khoản Google
4. Click **"Create API Key"**
5. Chọn project (hoặc tạo mới)
6. Copy API key (dạng: `AIza...`)

### Bước 2: Thêm Vào .env.local

Mở file `.env.local` và thêm:

```bash
GOOGLE_AI_API_KEY=AIzaSy...YOUR_KEY_HERE
```

### Bước 3: Tắt Mock Mode

Mở file `app/api/analyze-video/route.ts`, đổi:

```typescript
const MOCK_MODE = true;  // Đổi thành false
```

Thành:

```typescript
const MOCK_MODE = false;  // Tắt mock mode
```

### Bước 4: Restart Server

```bash
# Ctrl+C để stop server hiện tại
# Sau đó chạy lại:
npm run dev
```

### Bước 5: Test Thử

1. Vào http://localhost:3001/dashboard/create
2. Nhập link YouTube bất kỳ:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
3. Click "Phân Tích"
4. Đợi 5-10 giây
5. Xem AI phân tích thật! 🎉

## 📊 Free Tier Limits

| Feature | Limit |
|---------|-------|
| Requests per day | 1,500 |
| Requests per minute | 60 |
| Tokens per minute | 1,000,000 |
| Tokens per request | Unlimited |

**Đủ cho:**
- Test: Không giới hạn
- Personal use: 1500 reviews/ngày
- Small business: 45,000 reviews/tháng

## ⚠️ Lưu Ý

### Nếu gặp lỗi:

**"API key not valid"**
- Kiểm tra đã copy đúng key chưa
- Đảm bảo không có space thừa
- API key phải bắt đầu bằng `AIza`

**"Quota exceeded"**
- Đã dùng hết 1500 requests/ngày
- Đợi 24h hoặc dùng tài khoản Google khác

**"403 Forbidden"**
- Enable API tại Google Cloud Console
- Đảm bảo project đã được tạo

## 🔄 Quay Lại Mock Mode

Nếu muốn dùng mock data lại:

```typescript
// app/api/analyze-video/route.ts
const MOCK_MODE = true;  // Bật lại mock mode
```

## 📈 So Sánh Models

App hỗ trợ 2 models Gemini:

| Model | Free Tier | Quality | Speed |
|-------|-----------|---------|-------|
| **gemini-1.5-flash** | 1500 req/day | ⭐⭐⭐⭐ | ⚡⚡⚡⚡ |
| gemini-1.5-pro | 50 req/day | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ |

**Mặc định dùng: gemini-1.5-flash** (đủ tốt cho hầu hết use case)

## 🎯 Video Hướng Dẫn

1. https://ai.google.dev/tutorials/setup
2. https://ai.google.dev/gemini-api/docs/quickstart

## ✅ Checklist

- [ ] Đã có API key từ https://ai.google.dev/
- [ ] Đã thêm `GOOGLE_AI_API_KEY` vào `.env.local`
- [ ] Đã tắt `MOCK_MODE = false`
- [ ] Đã restart server
- [ ] Test thành công với link YouTube

Hoàn thành! Giờ app có thể phân tích video thật với AI miễn phí! 🚀
