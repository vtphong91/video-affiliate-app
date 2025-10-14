# 📧 Hướng dẫn cài đặt Email Service để gửi Password

## 🚨 VẤN ĐỀ VỚI SUPABASE TEMPLATES

### **❌ Supabase Email Templates Limitations:**
- ✅ **Không có `{{ .Password }}`**: Supabase không expose password trong templates
- ✅ **Security First**: Supabase không cho phép gửi password qua email templates
- ✅ **Built-in Variables Only**: Chỉ có `{{ .Email }}`, `{{ .ConfirmationURL }}`, etc.

### **🔧 Giải pháp:**
**Password phải được gửi từ App thông qua External Email Service!**

---

## 🚀 CÁC OPTION EMAIL SERVICE:

### **Option 1: Resend (Recommended) ⭐**

#### **Cài đặt:**
```bash
npm install resend
```

#### **Cấu hình Environment Variables:**
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

#### **Code Implementation:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Thông tin tài khoản Video Affiliate App',
  html: emailContent
});
```

#### **Ưu điểm:**
- ✅ **Developer-friendly**: API đơn giản
- ✅ **Reliable**: Uptime cao
- ✅ **Affordable**: Giá cả hợp lý
- ✅ **Good Documentation**: Docs chi tiết

---

### **Option 2: SendGrid**

#### **Cài đặt:**
```bash
npm install @sendgrid/mail
```

#### **Cấu hình Environment Variables:**
```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
```

#### **Code Implementation:**
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@yourdomain.com',
  subject: 'Thông tin tài khoản Video Affiliate App',
  html: emailContent
});
```

#### **Ưu điểm:**
- ✅ **Enterprise-grade**: Dịch vụ chuyên nghiệp
- ✅ **High Volume**: Xử lý email số lượng lớn
- ✅ **Analytics**: Báo cáo chi tiết
- ✅ **Templates**: Hỗ trợ email templates

---

### **Option 3: Nodemailer (Gmail/SMTP)**

#### **Cài đặt:**
```bash
npm install nodemailer
```

#### **Cấu hình Environment Variables:**
```bash
# .env.local
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### **Code Implementation:**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Thông tin tài khoản Video Affiliate App',
  html: emailContent
});
```

#### **Ưu điểm:**
- ✅ **Free**: Miễn phí với Gmail
- ✅ **Flexible**: Hỗ trợ nhiều SMTP providers
- ✅ **Simple**: Dễ cài đặt
- ✅ **No API Key**: Chỉ cần email/password

---

## 🔧 IMPLEMENTATION STEPS:

### **Step 1: Chọn Email Service**
```bash
# Recommended: Resend
npm install resend
```

### **Step 2: Cấu hình Environment Variables**
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

### **Step 3: Cập nhật Code**
```typescript
// Uncomment trong app/api/admin/members/route.ts
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@yourdomain.com',
  to: email,
  subject: 'Thông tin tài khoản Video Affiliate App',
  html: emailContent
});
```

### **Step 4: Test Email Sending**
```bash
# Test tạo member mới
# Kiểm tra email có được gửi không
```

---

## 📊 COMPARISON TABLE:

| Service | Price | Setup | Reliability | Features |
|---------|-------|-------|-------------|----------|
| **Resend** | $20/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SendGrid** | $19.95/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Nodemailer** | Free | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 RECOMMENDED APPROACH:

### **For Development:**
- ✅ **Use Console Logging**: Hiện tại đang dùng
- ✅ **Test Password Generation**: Verify password strength
- ✅ **Test Email Template**: Check HTML content

### **For Production:**
- ✅ **Use Resend**: Recommended cho production
- ✅ **Setup Domain**: Cấu hình custom domain
- ✅ **Monitor Delivery**: Track email delivery rates
- ✅ **Handle Errors**: Implement proper error handling

---

## 🔐 SECURITY CONSIDERATIONS:

### **Password Security:**
- ✅ **Temporary Only**: Password chỉ sử dụng một lần
- ✅ **Force Change**: Yêu cầu đổi mật khẩu lần đầu
- ✅ **Strong Generation**: Mật khẩu mạnh 12 ký tự
- ✅ **HTTPS Only**: Chỉ gửi qua HTTPS

### **Email Security:**
- ✅ **Rate Limiting**: Giới hạn số lượng email
- ✅ **Validation**: Validate email format
- ✅ **Error Handling**: Handle email failures
- ✅ **Logging**: Log email activities

---

## 🧪 TESTING CHECKLIST:

### **Development Testing:**
- [ ] **Password Generation**: Test password strength
- [ ] **Email Template**: Verify HTML content
- [ ] **Console Logging**: Check console output
- [ ] **API Response**: Verify API response

### **Production Testing:**
- [ ] **Email Service Setup**: Configure email service
- [ ] **Domain Configuration**: Setup custom domain
- [ ] **Email Delivery**: Test actual email sending
- [ ] **Error Handling**: Test error scenarios
- [ ] **Rate Limiting**: Test rate limits
- [ ] **Monitoring**: Setup email monitoring

---

## 🎉 CONCLUSION:

**Supabase Email Templates KHÔNG hỗ trợ password variables!**

**Giải pháp:**
1. **Use External Email Service** (Resend/SendGrid/Nodemailer)
2. **Send Password from App** (không qua Supabase templates)
3. **Implement Proper Security** (temporary passwords, force change)

**Current Status:**
- ✅ **Password Generation**: Hoạt động hoàn hảo
- ✅ **Email Template**: HTML template chuyên nghiệp
- ✅ **Console Logging**: Hiển thị email content
- ⏳ **Email Service**: Cần cài đặt external service

**Next Step:**
Cài đặt Resend hoặc SendGrid để gửi email thật! 🚀


