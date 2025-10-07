# 🔒 Security Update: Webhook Configuration

## Tổng Quan

Đã di chuyển cấu hình Make.com webhook từ **localStorage** (client-side) sang **environment variables** (server-side) để tăng cường bảo mật.

---

## 🔄 Những Thay Đổi

### 1. Environment Variables (.env.local)

Webhook credentials giờ được lưu trong `.env.local`:

```bash
# Make.com Webhook Configuration (SECURE - Server-side only)
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-id-here
MAKE_WEBHOOK_SECRET=your-secret-key-here
```

**Lợi ích:**
- ✅ Không lộ credentials trong browser
- ✅ Không lộ trong localStorage
- ✅ Không xuất hiện trong client-side JavaScript bundle
- ✅ Chỉ server mới có quyền truy cập

### 2. Settings Context (lib/contexts/settings-context.tsx)

**Trước:**
```typescript
export interface AppSettings {
  youtubeApiKey: string;
  makeWebhookUrl: string;      // ❌ Đã xóa
  webhookSecret: string;        // ❌ Đã xóa
  defaultAffiliatePlatform: string;
}
```

**Sau:**
```typescript
export interface AppSettings {
  youtubeApiKey: string;
  defaultAffiliatePlatform: string;
  // Note: Make.com webhook moved to .env for security
}
```

### 3. Settings Page (app/dashboard/settings/page.tsx)

**Thay đổi:**
- ❌ Xóa input fields cho webhook URL và secret
- ✅ Hiển thị thông báo: "🔒 Webhook được bảo mật trong file .env"
- ✅ Test Webhook button gọi API route `/api/test-webhook`
- ✅ Hướng dẫn cấu hình trong .env.local

### 4. API Routes

#### Mới: `/api/test-webhook/route.ts`
```typescript
// Server-side test webhook
const webhookUrl = process.env.MAKE_WEBHOOK_URL;
const webhookSecret = process.env.MAKE_WEBHOOK_SECRET;
```

#### Cập nhật: `/api/post-facebook/route.ts`
```typescript
// Lấy từ environment variables thay vì request body
const webhookUrl = process.env.MAKE_WEBHOOK_URL;
const webhookSecret = process.env.MAKE_WEBHOOK_SECRET;
```

### 5. FacebookPoster Component (components/FacebookPoster.tsx)

**Trước:**
```typescript
body: JSON.stringify({
  webhookUrl: settings.makeWebhookUrl,    // ❌ Đã xóa
  webhookSecret: settings.webhookSecret,  // ❌ Đã xóa
})
```

**Sau:**
```typescript
body: JSON.stringify({
  reviewId,
  message,
  videoUrl,
  // Webhook handled server-side
})
```

### 6. Documentation (MAKE_COM_SETUP.md)

Đã cập nhật hướng dẫn:
- ✅ Bước 4: Cấu hình webhook trong .env.local
- ✅ Bước 8: Hướng dẫn post affiliate links vào comment
- ✅ Phần 2: Giải thích về bảo mật webhook

---

## 🚀 Migration Guide

### Cho người dùng hiện tại:

1. **Copy webhook URL từ Settings (nếu đã setup):**
   - Trước khi update, copy Webhook URL từ Settings page
   - Hoặc lấy từ Make.com scenario

2. **Thêm vào .env.local:**
   ```bash
   MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-copied-url
   MAKE_WEBHOOK_SECRET=your-secret-if-any
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

4. **Test webhook:**
   - Mở Settings → Click "Test Webhook"
   - Nếu thành công → Setup hoàn tất!

### Cho người dùng mới:

Làm theo hướng dẫn trong [MAKE_COM_SETUP.md](./MAKE_COM_SETUP.md)

---

## 🔐 Tại Sao Thay Đổi?

### Vấn đề với localStorage:

1. **Lộ credentials:**
   - Bất kỳ JavaScript nào trên trang đều có thể đọc localStorage
   - Browser extensions có thể truy cập
   - XSS attacks có thể đánh cắp credentials

2. **Không có server-side protection:**
   - Không thể validate trên server
   - Không thể giới hạn rate limiting
   - Không thể audit logs

### Lợi ích với Environment Variables:

1. **Server-side only:**
   - Chỉ server code mới truy cập được
   - Không xuất hiện trong client bundle
   - Không thể đọc từ browser

2. **Secure deployment:**
   - `.env.local` không commit vào Git
   - Production sử dụng platform environment variables (Vercel, Railway, etc.)
   - Easy rotation khi cần thay đổi credentials

3. **Best practices:**
   - Theo chuẩn Next.js security guidelines
   - Align với industry best practices
   - Dễ maintain và scale

---

## ✅ Checklist

- [x] Di chuyển webhook config sang .env.local
- [x] Cập nhật SettingsContext interface
- [x] Cập nhật Settings page UI
- [x] Tạo /api/test-webhook route
- [x] Cập nhật /api/post-facebook route
- [x] Cập nhật FacebookPoster component
- [x] Build thành công
- [x] Cập nhật MAKE_COM_SETUP.md
- [x] Tạo SECURITY_UPDATE.md

---

## 📝 Notes

- File `.env.local` đã được thêm vào `.gitignore` (mặc định của Next.js)
- `.env.example` đã được cập nhật với template mới
- Backward compatible: Người dùng cũ cần migrate thủ công
- Facebook posting functionality vẫn hoạt động 100% như cũ

---

**Date:** 2025-10-07
**Version:** 2.0 (Security Enhanced)
