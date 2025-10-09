# 📘 Hướng Dẫn Setup Facebook Auto Post

## 🎯 Mục tiêu
Cấu hình app để tự động đăng bài review lên Facebook Page.

---

## 📋 Yêu cầu
- Có Facebook Page (không phải profile cá nhân)
- Là Admin của Page
- Facebook Developer Account

---

## 🚀 Bước 1: Tạo Facebook App

### 1.1. Truy cập Facebook Developers
1. Mở: https://developers.facebook.com/
2. Click **"My Apps"** → **"Create App"**
3. Chọn loại: **"Business"**
4. Điền thông tin:
   - **App Name**: `Video Affiliate App` (hoặc tên bạn muốn)
   - **App Contact Email**: Email của bạn
5. Click **"Create App"**

### 1.2. Thêm Facebook Login Product
1. Trong Dashboard của App → Click **"Add Product"**
2. Tìm **"Facebook Login"** → Click **"Set Up"**
3. Chọn **"Web"** platform
4. Site URL: `http://localhost:3000` (nếu dev) hoặc domain thật

---

## 🔑 Bước 2: Lấy Access Token

### 2.1. Truy cập Graph API Explorer
1. Mở: https://developers.facebook.com/tools/explorer/
2. Chọn App vừa tạo (góc trên bên phải)

### 2.2. Generate User Access Token
1. Click **"Generate Access Token"**
2. Chọn các permissions sau:
   - ✅ `pages_show_list` - Xem danh sách pages
   - ✅ `pages_read_engagement` - Đọc thông tin page
   - ✅ `pages_manage_posts` - Đăng bài lên page
   - ✅ `pages_manage_engagement` - Quản lý tương tác
3. Click **"Continue"** → **"OK"** để cấp quyền
4. Copy **User Access Token** (bắt đầu bằng `EAAA...`)

### 2.3. Exchange to Long-Lived Token (Optional nhưng nên làm)
1. Mở: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste User Access Token vào
3. Click **"Debug"** → xem thông tin token
4. Click **"Extend Access Token"**
5. Copy **Long-Lived Token** mới (hết hạn sau 60 ngày thay vì 1 giờ)

### 2.4. Get Page Access Token
1. Quay lại Graph API Explorer
2. Paste Long-Lived User Token vào
3. Trong query box, nhập:
   ```
   GET /me/accounts
   ```
4. Click **"Submit"**
5. Tìm Page bạn muốn → copy **access_token** của page đó
6. **Đây là Page Access Token chính thức** - không hết hạn!

---

## 📍 Bước 3: Lấy Facebook Page ID

### Cách 1: Từ Settings
1. Vào Facebook Page của bạn
2. Click **Settings** (⚙️)
3. Sidebar trái → Click **"Page Info"** hoặc **"About"**
4. Tìm **"Page ID"** → Copy

### Cách 2: Từ Graph API Explorer
1. Trong response ở bước 2.4, tìm `"id"` của page
2. Đó là Page ID

---

## ⚙️ Bước 4: Cấu hình trong App

1. **Vào Settings trong app:**
   - Dashboard → Settings

2. **Điền thông tin:**
   - **Facebook Page ID**: Paste Page ID từ bước 3
   - **Page Access Token**: Paste Page Access Token từ bước 2.4

3. **Click "Xác thực kết nối"**
   - Nếu thành công → hiển thị tên page và số followers
   - Nếu lỗi → kiểm tra lại token và permissions

4. **Click "Lưu Cài Đặt"**

---

## ✅ Bước 5: Test Posting

1. Tạo một review mới:
   - Dashboard → Create Review
   - Nhập link YouTube/TikTok
   - Phân tích với AI

2. Trong tab "Đăng Facebook":
   - Kiểm tra message preview
   - Chỉnh sửa nếu cần
   - Click **"Đăng Lên Facebook"**

3. Kiểm tra Facebook Page:
   - Vào page của bạn
   - Xem bài mới đăng
   - Click link để test landing page

---

## 🔧 Troubleshooting

### Lỗi: "Invalid OAuth access token"
**Nguyên nhân:** Token sai hoặc hết hạn
**Giải pháp:**
- Lấy token mới theo bước 2
- Đảm bảo dùng **Page Access Token** (không phải User Token)
- Check token tại: https://developers.facebook.com/tools/debug/accesstoken/

### Lỗi: "The user hasn't authorized the application to perform this action"
**Nguyên nhân:** Thiếu permissions
**Giải pháp:**
- Xóa token cũ
- Generate token mới với đầy đủ permissions (bước 2.2)
- Đảm bảo có `pages_manage_posts`

### Lỗi: "Application does not have permission for this action"
**Nguyên nhân:** App chưa được review (nếu production)
**Giải pháp:**
- Trong Dev mode: Add user làm Admin/Developer/Tester của app
- Facebook Developers → App → Roles → Add People

### Không tìm thấy Page trong /me/accounts
**Nguyên nhân:** User không phải Admin của page
**Giải pháp:**
- Vào Page → Settings → Page Roles
- Đảm bảo tài khoản Facebook của bạn là Admin

### Token hết hạn sau 1 giờ
**Nguyên nhân:** Chưa exchange sang Long-Lived Token
**Giải pháp:**
- Làm theo bước 2.3 để có token 60 ngày
- Hoặc làm bước 2.4 để có Page Token không hết hạn

---

## 📚 Tài liệu tham khảo

- [Facebook Graph API - Pages](https://developers.facebook.com/docs/graph-api/reference/page)
- [Publishing to Pages](https://developers.facebook.com/docs/pages/publishing)
- [Access Tokens](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)
- [Permissions Reference](https://developers.facebook.com/docs/permissions/reference)

---

## 💡 Tips & Best Practices

1. **Security:**
   - Không share Access Token với người khác
   - Không commit token vào Git
   - Dùng Page Access Token (không hết hạn) thay vì User Token

2. **Rate Limits:**
   - Facebook giới hạn ~200 posts/hour/page
   - Không spam quá nhiều posts trong thời gian ngắn

3. **Content Quality:**
   - Đảm bảo message có giá trị
   - Không vi phạm Community Standards
   - Test trên page test trước khi dùng page chính

4. **Monitoring:**
   - Check Post Insights trên Facebook
   - Theo dõi engagement (likes, comments, shares)
   - Adjust content strategy dựa trên performance

---

## 🎉 Hoàn thành!

Bạn đã setup xong! Giờ có thể:
- ✅ Tự động post review lên Facebook
- ✅ Track views và clicks
- ✅ Tối ưu affiliate marketing workflow

**Happy posting! 🚀**
