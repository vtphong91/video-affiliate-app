# 📧 Hướng dẫn cấu hình Email Templates trong Supabase

## 🎯 Tổng quan
Để gửi email thông báo tài khoản mới cho thành viên, bạn cần cấu hình email templates trong Supabase Dashboard.

## 📋 Các bước cấu hình

### 1. Truy cập Supabase Dashboard
1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com/)
2. Chọn project của bạn
3. Vào **Authentication** → **Email Templates**

### 2. Cấu hình Email Template cho "Invite User"
1. Tìm template **"Invite User"** hoặc **"Confirm Sign-Up"**
2. Click vào template để chỉnh sửa

### 3. Template HTML cho Account Information Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông tin tài khoản Video Affiliate App</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Video Affiliate App</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Thông tin tài khoản mới</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">Xin chào {{ .Email }}!</h2>
            
            <p style="color: #6b7280; line-height: 1.6; font-size: 16px;">
                Tài khoản của bạn đã được tạo thành công trên hệ thống <strong>Video Affiliate App</strong>.
            </p>
            
            <!-- Account Information -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0; font-size: 18px;">Thông tin đăng nhập:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Email:</td>
                        <td style="padding: 8px 0; color: #6b7280;">{{ .Email }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mật khẩu:</td>
                        <td style="padding: 8px 0; color: #6b7280; font-family: monospace; background: #f9fafb; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb;">{{ .Password }}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Vai trò:</td>
                        <td style="padding: 8px 0; color: #6b7280;">{{ .Role }}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Important Notice -->
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <h4 style="color: #92400e; margin-top: 0; font-size: 16px;">⚠️ QUAN TRỌNG:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Vui lòng đổi mật khẩu ngay lần đầu đăng nhập</li>
                    <li>Mật khẩu này chỉ sử dụng được một lần</li>
                    <li>Để bảo mật tài khoản, hãy tạo mật khẩu mạnh</li>
                </ul>
            </div>
            
            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ .ConfirmationURL }}" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Đăng nhập ngay
                </a>
            </div>
            
            <!-- Footer -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
                Trân trọng,<br>
                <strong>Đội ngũ Video Affiliate App</strong>
            </p>
        </div>
    </div>
</body>
</html>
```

### 4. Template Subject Line
```
Thông tin tài khoản Video Affiliate App - {{ .Email }}
```

## 🔧 Cấu hình biến trong Supabase

### Các biến có sẵn trong Supabase:
- `{{ .Email }}` - Email của user
- `{{ .ConfirmationURL }}` - URL xác nhận đăng ký
- `{{ .SiteURL }}` - URL của website
- `{{ .RedirectTo }}` - URL redirect sau khi xác nhận

### Biến tùy chỉnh cần thêm:
Để sử dụng password và role, bạn cần:

1. **Cập nhật code API** để gửi custom data
2. **Sử dụng Supabase Edge Functions** để gửi email tùy chỉnh
3. **Hoặc sử dụng email service bên ngoài** (SendGrid, Resend, etc.)

## 🚀 Cách sử dụng trong code

### Option 1: Sử dụng Supabase Auth Admin API
```typescript
// Trong app/api/admin/members/route.ts
const { data, error } = await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email: email,
  password: generatedPassword,
  options: {
    redirectTo: 'http://localhost:3000/auth/login',
    data: {
      full_name: fullName,
      role: role,
      generated_password: generatedPassword
    }
  }
});
```

### Option 2: Sử dụng Email Service bên ngoài
```typescript
// Cài đặt Resend hoặc SendGrid
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Thông tin tài khoản Video Affiliate App',
  html: emailContent
});
```

## 📝 Lưu ý quan trọng

1. **Email Templates** trong Supabase chỉ hỗ trợ các biến có sẵn
2. **Custom data** như password cần được xử lý qua Edge Functions hoặc email service bên ngoài
3. **Security**: Không bao giờ gửi password qua email trong production
4. **Best Practice**: Sử dụng magic links hoặc temporary passwords

## 🔐 Bảo mật

- ✅ **Temporary Password**: Chỉ sử dụng một lần
- ✅ **Force Password Change**: Yêu cầu đổi mật khẩu lần đầu
- ✅ **HTTPS Only**: Chỉ gửi email qua HTTPS
- ✅ **Rate Limiting**: Giới hạn số lượng email gửi

## 🧪 Testing

1. **Test Email Template**: Tạo user test và kiểm tra email
2. **Test Password**: Verify password hoạt động
3. **Test Login Flow**: Kiểm tra quy trình đăng nhập
4. **Test Password Change**: Verify đổi mật khẩu lần đầu

---

**Lưu ý**: Hiện tại code đang log email content ra console. Để gửi email thật, bạn cần cấu hình email service hoặc sử dụng Supabase Edge Functions.
