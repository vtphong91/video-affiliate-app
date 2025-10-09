# 🚀 Hướng Dẫn Setup Make.com Auto Post

## 🎯 Tổng Quan

Make.com (formerly Integromat) là platform automation no-code giúp bạn tự động đăng bài lên Facebook và nhiều platform khác **KHÔNG CẦN** code phức tạp hay quản lý Access Token.

### ✅ Ưu điểm so với Facebook API trực tiếp:
- ✅ **Không cần Facebook App** - Không cần tạo Facebook Developer App
- ✅ **Không cần Access Token** - Make.com quản lý OAuth tự động
- ✅ **Multi-platform** - Dễ dàng post lên Facebook, Twitter, LinkedIn, Telegram...
- ✅ **Visual workflow** - Drag & drop, không cần code
- ✅ **Built-in retry** - Tự động retry khi lỗi
- ✅ **Free tier** - 1,000 operations/tháng miễn phí

---

## 📋 Yêu Cầu

- Tài khoản Make.com (đăng ký free tại https://make.com)
- Facebook Page (không phải profile cá nhân)
- Là Admin của Facebook Page

---

## 🚀 Phần 1: Tạo Make.com Scenario

### Bước 1: Đăng ký Make.com

1. Truy cập: https://make.com/en/register
2. Đăng ký tài khoản (Free plan)
3. Xác nhận email
4. Đăng nhập vào Make.com

### Bước 2: Tạo Scenario Mới

1. Click **"Create a new scenario"** (hoặc **"Scenarios"** → **"Create a new scenario"**)
2. Đặt tên: **"Facebook Auto Post from Video Affiliate App"**

### Bước 3: Thêm Webhook Trigger

1. **Click dấu +** để add module đầu tiên
2. Search: **"Webhook"**
3. Chọn: **"Webhooks" → "Custom webhook"**
4. Click **"Add"**
5. Click **"Create a webhook"**
6. Đặt tên: **"Video Review Webhook"**
7. Click **"Save"**
8. **QUAN TRỌNG:** Copy **Webhook URL** (dạng: `https://hook.eu2.make.com/xxxxxx`)
   - Lưu URL này lại, bạn sẽ cần thêm vào file `.env.local` sau

> **🔒 BẢO MẬT:** Webhook URL giờ được lưu trong file `.env.local` (server-side) thay vì localStorage (client-side) để bảo mật tốt hơn.

### Bước 4: Cấu hình Webhook URL trong .env

1. Mở file `.env.local` trong project
2. Thêm/cập nhật dòng sau:
   ```bash
   MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-id-here
   MAKE_WEBHOOK_SECRET=your-secret-key-here  # Optional, để bảo mật thêm
   ```
3. Thay `your-webhook-id-here` bằng webhook URL bạn vừa copy từ Make.com
4. **Restart dev server** để load environment variables mới:
   ```bash
   npm run dev
   ```

### Bước 5: Test Webhook

1. Click **"Run once"** ở góc dưới bên trái trong Make.com
2. Scenario sẽ wait for data
3. Mở app → Settings → Click **"Test Webhook"**
4. Quay lại Make.com → Thấy data sample hiện lên
5. Click **"OK"** để confirm data structure

### Bước 6: Thêm Facebook Module

1. **Click dấu +** sau webhook module
2. Search: **"Facebook"**
3. Chọn: **"Facebook Pages" → "Create a Page Post"**
4. Click **"Add"**

5. **Kết nối Facebook:**
   - Click **"Create a connection"**
   - Click **"Sign in with Facebook"**
   - Đăng nhập Facebook
   - **Chọn Page** bạn muốn post (nếu có nhiều page)
   - Click **"Continue"**
   - Cấp quyền: **pages_manage_posts**, **pages_show_list**
   - Click **"OK"** → Connection created!

6. **Map dữ liệu:**
   - **Select a Page**: Chọn page của bạn
   - **Message**: Click vào field → Chọn `{{1.message}}` (từ webhook data)
   - **Link**: Click vào field → Chọn `{{1.videoUrl}}` ⚠️ **Quan trọng: Dùng videoUrl (link video gốc), không phải link**
   - **Picture** (optional): Click vào field → Chọn `{{1.imageUrl}}`

> **📌 LƯU Ý:**
> - `{{1.videoUrl}}` = Link video YouTube/TikTok gốc (sẽ hiển thị trong Facebook post)
> - `{{1.link}}` = Link landing page của app (để tracking, dùng cho mục đích khác)
> - `{{1.affiliateComment}}` = Link affiliate (sẽ được post vào comment riêng - xem bước 8)

7. Click **"OK"**

### Bước 7: Thêm Webhook Response (Để app nhận kết quả)

1. **Click dấu +** sau Facebook module
2. Search: **"Webhook Response"**
3. Chọn: **"Webhooks" → "Webhook Response"**
4. **Status**: `200`
5. **Body** (click **"Switch to JSON"**):
   ```json
   {
     "success": true,
     "postId": "{{2.id}}",
     "postUrl": "https://facebook.com/{{2.id}}"
   }
   ```
   - `{{2.id}}` là post ID từ Facebook module (module thứ 2)

6. Click **"OK"**

### Bước 8: (Tùy chọn) Thêm Module Post Affiliate Links vào Comment

Nếu bạn muốn post affiliate links vào comment thay vì trong post chính:

1. **Click dấu +** sau Webhook Response module
2. **Thêm Router** để check xem có affiliate comment không:
   - Search: **"Router"**
   - Chọn **"Flow Control → Router"**

3. **Thiết lập Filter cho route 1:**
   - Click vào connection line từ Webhook Response → Router
   - **Label**: "Has Affiliate Links"
   - **Condition**: `{{1.affiliateComment}}` **exists**

4. **Thêm Facebook Comment Module:**
   - Click dấu **+** sau Router (route 1)
   - Search: **"Facebook"**
   - Chọn: **"Facebook Pages → Create a Page Comment"**
   - **Select a Page**: Chọn page của bạn
   - **Post ID**: `{{2.id}}` (ID từ Facebook post module - module 2)
   - **Message**: `{{1.affiliateComment}}` (affiliate links từ webhook)
   - Click **"OK"**

> **💡 TIP:** Với setup này, affiliate links sẽ tự động được post vào comment sau khi post chính được tạo, giúp bài post trong sạch hơn và dễ đọc hơn.

### Bước 9: Lưu và Activate

1. Click **"Save"** (icon đĩa ở góc dưới trái)
2. **Toggle ON** để activate scenario
3. ✅ Done! Scenario đã sẵn sàng

---

## ⚙️ Phần 2: Cấu Hình Trong App

### Webhook đã được cấu hình trong .env

Webhook URL và Secret giờ được quản lý server-side để bảo mật. Bạn đã cấu hình trong **Bước 4** ở trên.

### Test Webhook từ Settings

1. Mở app → **Dashboard → Settings**
2. Tìm section **"Make.com Integration"**
3. Bạn sẽ thấy thông báo: **"🔒 Webhook được bảo mật trong file .env"**
4. Click **"Test Webhook"** để test kết nối
5. Nếu thành công → Webhook đã sẵn sàng sử dụng!

> **🔒 BẢO MẬT:** Webhook credentials không còn hiển thị trong Settings page vì đã được lưu an toàn trong `.env.local`

---

## ✅ Phần 3: Test Flow Hoàn Chỉnh

### Test End-to-End:

1. **Tạo review mới:**
   - Dashboard → Create Review
   - Nhập video URL (YouTube/TikTok)
   - Phân tích với AI
   - Edit nội dung

2. **Lưu review:**
   - Click **"Lưu & Tiếp Tục"**

3. **Post lên Facebook:**
   - Tab **"Đăng Facebook"**
   - Kiểm tra message preview
   - Chỉnh sửa nếu cần
   - Click **"Gửi tới Make.com"**

4. **Kiểm tra kết quả:**
   - ✅ App hiển thị "Đã gửi thành công"
   - ✅ Make.com dashboard → Thấy execution thành công (màu xanh)
   - ✅ Facebook Page → Thấy bài mới đăng
   - ✅ Click link → Landing page hiển thị đúng

---

## 🎨 Phần 4: Tùy Biến Nâng Cao (Optional)

### A. Post lên nhiều Platform cùng lúc

**Add Router Module:**
```
Webhook → Router →
  ├─ Facebook Page Post
  ├─ Twitter Tweet
  ├─ LinkedIn Post
  └─ Telegram Message
```

**Cách làm:**
1. Thay Facebook module bằng **Router** module
2. Add multiple branches
3. Mỗi branch là 1 platform khác nhau

### B. Lọc và điều kiện

**Ví dụ: Chỉ post lên Facebook vào giờ hành chính**
```
Webhook → Filter (check time 9AM-5PM) → Facebook Post
```

**Cách làm:**
1. Add **Filter** module giữa Webhook và Facebook
2. Condition:
   - `hour(now) >= 9`
   - `AND hour(now) < 17`

### C. AI enhance message

**Tối ưu message trước khi post:**
```
Webhook → OpenAI (optimize) → Facebook Post
```

**Cách làm:**
1. Add **OpenAI** module
2. Model: GPT-4
3. Prompt: "Optimize this Facebook post: {{message}}"
4. Map kết quả vào Facebook module

### D. Lưu log vào Google Sheets

**Track tất cả posts:**
```
Facebook Post → Google Sheets (add row)
```

**Cách làm:**
1. Add **Google Sheets** module sau Facebook
2. Action: "Add a row"
3. Map data: Date, Message, Post URL, Views...

### E. Thông báo qua Email/Slack

**Nhận notify khi post thành công:**
```
Facebook Post → Email/Slack notification
```

---

## 🔧 Phần 5: Troubleshooting

### Lỗi: "Webhook not found" hoặc 404

**Nguyên nhân:** URL sai hoặc scenario chưa active

**Giải pháp:**
- Kiểm tra lại Webhook URL (phải có format `https://hook.*.make.com/...`)
- Vào Make.com → Check scenario đã **ON** chưa
- Thử tạo webhook mới

### Lỗi: "Facebook authentication failed"

**Nguyên nhân:** Connection hết hạn hoặc permissions thiếu

**Giải pháp:**
- Make.com → Connections → Reconnect Facebook
- Đảm bảo cấp đủ permissions: `pages_manage_posts`, `pages_show_list`
- Thử revoke và reconnect

### Lỗi: "This message contains blocked content"

**Nguyên nhân:** Facebook chặn nội dung (spam filter)

**Giải pháp:**
- Giảm tần suất post
- Tránh từ ngữ spam
- Thêm nhiều nội dung unique
- Không post link rút gọn (bit.ly, etc)

### Lỗi: Scenario chạy nhưng không post

**Nguyên nhân:** Có thể do mapping sai data

**Giải pháp:**
- Make.com → Execution history → Xem error details
- Check mapping của message và link
- Thử chạy manual với "Run once"

### Lỗi: "Operations limit exceeded"

**Nguyên nhân:** Vượt quá 1,000 ops/tháng (free plan)

**Giải pháp:**
- Upgrade lên Core plan ($9/month)
- Hoặc reset vào đầu tháng sau

---

## 📊 Phần 6: Monitoring & Analytics

### Make.com Dashboard

**Xem execution history:**
1. Make.com → Scenarios → Click vào scenario
2. Tab **"History"**
3. Xem:
   - ✅ Successful executions (màu xanh)
   - ❌ Failed executions (màu đỏ)
   - ⏱️ Execution time
   - 📊 Operations used

### Facebook Insights

**Track post performance:**
1. Vào Facebook Page
2. Click vào post
3. Xem Insights:
   - Reach
   - Engagement (likes, comments, shares)
   - Clicks
   - Video views (nếu có)

### App Analytics

**Trong app dashboard:**
- Total reviews
- Total views
- Total clicks
- Conversions

---

## 💰 Phần 7: Chi Phí & Optimization

### Free Plan: 1,000 Operations/Tháng

**1 post = 3 operations:**
- 1 op: Webhook receive
- 1 op: Facebook post
- 1 op: Webhook response

**→ 1,000 ops = ~333 posts/tháng = ~11 posts/ngày**

**Tips tiết kiệm operations:**
- Batch posts thay vì post từng cái một
- Dùng filters để chỉ post những reviews quan trọng
- Schedule posts vào giờ cao điểm thay vì post ngay

### Upgrade Plans

| Plan | Ops/Month | Price | Best For |
|------|-----------|-------|----------|
| Free | 1,000 | $0 | Testing, hobby |
| Core | 10,000 | $9 | Small business |
| Pro | 10,000 | $16 | More features |
| Teams | 10,000 | $29 | Team collab |

---

## 🎓 Phần 8: Best Practices

### 1. Security

✅ **DO:**
- Dùng Webhook Secret để verify requests
- Giữ Webhook URL private
- Regularly rotate secrets

❌ **DON'T:**
- Share Webhook URL publicly
- Commit secrets vào Git
- Ignore error logs

### 2. Content Quality

✅ **DO:**
- Viết nội dung unique và valuable
- Add emoji để eye-catching
- Include clear call-to-action
- Test message preview trước khi post

❌ **DON'T:**
- Copy-paste content
- Spam keywords
- Post quá nhiều trong thời gian ngắn
- Violate Facebook Community Standards

### 3. Timing

✅ **Best times to post:**
- Weekdays: 9 AM - 3 PM
- Wednesday & Thursday: Peak engagement
- Avoid: Late night & early morning

### 4. Performance

✅ **Monitor:**
- Click-through rate (CTR)
- Engagement rate
- Conversion rate
- Best performing topics

---

## 🔗 Resources

- **Make.com Docs**: https://www.make.com/en/help/getting-started
- **Make.com Templates**: https://www.make.com/en/templates
- **Facebook API Docs**: https://developers.facebook.com/docs/graph-api
- **Community Forum**: https://community.make.com/

---

## 🎉 Tổng Kết

Setup Make.com cho auto post chỉ mất **~10 phút** và mang lại:

✅ **Đơn giản hơn 10x** so với Facebook API trực tiếp
✅ **Không cần code** phức tạp
✅ **Không lo token expiration**
✅ **Scale dễ dàng** lên multi-platform
✅ **Free tier** đủ dùng cho most use cases

**Happy automating! 🚀**

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Troubleshooting section ở trên
2. Xem Make.com execution logs
3. Google error message
4. Ask trong Make.com Community Forum

**Good luck!** 🍀
