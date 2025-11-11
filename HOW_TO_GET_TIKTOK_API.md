# Hướng Dẫn Lấy TikTok API Key (RapidAPI) 🔑

**Thời gian**: 5-10 phút
**Chi phí**: FREE (100 requests/tháng)

---

## 📋 BƯỚC 1: Đăng Ký RapidAPI (2 phút)

### 1.1. Truy cập RapidAPI

Mở trình duyệt và vào: **https://rapidapi.com/**

### 1.2. Đăng ký tài khoản

Bạn có 3 options để đăng ký:

**Option A: Dùng Google (Nhanh nhất)** ⭐
```
1. Click nút "Sign Up" ở góc trên phải
2. Click "Sign Up with Google"
3. Chọn Gmail account của bạn
4. Allow permissions
✅ Xong! Tự động đăng nhập
```

**Option B: Dùng GitHub**
```
1. Click "Sign Up"
2. Click "Sign Up with GitHub"
3. Authorize RapidAPI
✅ Xong! Tự động đăng nhập
```

**Option C: Dùng Email**
```
1. Click "Sign Up"
2. Nhập email, password
3. Click "Sign Up"
4. Check email → Click link xác nhận
✅ Xong! Đăng nhập lại
```

### 1.3. Xác nhận email (nếu dùng Email signup)

```
1. Check inbox (hoặc spam folder)
2. Tìm email từ "RapidAPI"
3. Click link "Verify Email"
4. Browser tự động redirect về RapidAPI
✅ Email verified!
```

---

## 🔍 BƯỚC 2: Tìm TikTok API (2 phút)

### 2.1. Search TikTok API

Sau khi đăng nhập:

```
1. Nhìn lên góc trên, thấy search bar
2. Gõ: "TikTok Video No Watermark"
3. Press Enter
```

### 2.2. Chọn đúng API

Trong search results, tìm:

```
✅ Tên: "TikTok Video No Watermark2"
✅ Tác giả: QuanDev (hoặc tương tự)
✅ Icon: TikTok logo
✅ Rating: 4-5 stars
✅ Description: "Get TikTok video info without watermark"

Click vào API này!
```

**⚠️ LƯU Ý**: Có nhiều TikTok APIs, chọn đúng "**TikTok Video No Watermark2**"

**Direct Link** (nếu search không thấy):
```
https://rapidapi.com/yi005/api/tiktok-video-no-watermark2
```

---

## 💳 BƯỚC 3: Subscribe API (2 phút)

### 3.1. Click "Subscribe to Test"

Trên trang API, bạn sẽ thấy:

```
- Nút "Subscribe to Test" (màu xanh/xanh lá)
- Click vào nút này
```

### 3.2. Chọn Plan

Một popup hiện ra với các plan:

```
┌─────────────────────────────────────────┐
│ BASIC (FREE) - RECOMMENDED              │ ⭐
├─────────────────────────────────────────┤
│ Price: $0/month                         │
│ Requests: 100/month                     │
│ Hard Limit: Yes                         │
│ Rate Limit: 10 requests/minute          │
│                                         │
│ [Subscribe] button                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRO ($9.99/month)                       │
├─────────────────────────────────────────┤
│ Price: $9.99/month                      │
│ Requests: 10,000/month                  │
│ Hard Limit: Yes                         │
│ Rate Limit: 50 requests/minute          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ULTRA ($49.99/month)                    │
├─────────────────────────────────────────┤
│ Price: $49.99/month                     │
│ Requests: 100,000/month                 │
│ Hard Limit: No                          │
│ Rate Limit: 500 requests/minute         │
└─────────────────────────────────────────┘
```

**Chọn BASIC (FREE)** cho việc test:

```
1. Scroll tìm plan "BASIC" ($0/month)
2. Click nút "Subscribe" dưới BASIC plan
3. Có thể yêu cầu add payment method (nhưng sẽ KHÔNG charge với FREE plan)
```

### 3.3. Add Payment Method (Optional)

RapidAPI có thể yêu cầu credit card (ngay cả FREE plan):

```
⚠️ ĐỪNG LO: Card chỉ để verify, FREE plan KHÔNG charge tiền!

1. Click "Add Payment Method"
2. Nhập thông tin card:
   - Card number
   - Expiry date (MM/YY)
   - CVV
   - Billing address
3. Click "Save"

✅ Card được verify, nhưng $0 charge với FREE plan
```

**Alternative**: Nếu không muốn add card ngay:
- Một số APIs cho phép skip
- Hoặc dùng virtual card (VCC) để test

### 3.4. Confirm Subscription

```
1. Review plan details
2. Check "I agree to terms and conditions"
3. Click "Subscribe"
✅ Subscription successful!
```

---

## 🔑 BƯỚC 4: Lấy API Key (1 phút)

### 4.1. Vào Endpoints Tab

Sau khi subscribe thành công:

```
1. Bạn sẽ redirect về API page
2. Nhìn lên trên, thấy tabs:
   - Overview
   - Endpoints ← Click vào tab này!
   - Pricing
   - Discussions
```

### 4.2. Tìm API Key

Trong tab Endpoints:

```
1. Scroll xuống phần "Code Snippets"
2. Bên phải có dropdown, chọn language (ví dụ: Node.js, Python, etc.)
3. Trong code example, tìm dòng:

   headers: {
     'X-RapidAPI-Key': 'a1b2c3d4e5f6g7h8...',  ← Đây là API key!
     'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com'
   }
```

### 4.3. Copy API Key

```
1. Highlight đoạn text sau 'X-RapidAPI-Key': '...'
2. Copy (Ctrl+C hoặc Cmd+C)

Ví dụ API key:
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0uvwxyz

✅ API Key copied!
```

**⚠️ LƯU Ý**: API key là một chuỗi dài gồm chữ và số, KHÔNG có khoảng trắng

---

## 💾 BƯỚC 5: Add API Key Vào Project (2 phút)

### 5.1. Mở Project

```bash
# Nếu đang dev, stop server trước (Ctrl+C)
cd /path/to/video-affiliate-app
```

### 5.2. Tạo/Edit file .env

**Nếu file .env CHƯA tồn tại**:

```bash
# Copy từ .env.example
cp .env.example .env
```

**Nếu file .env ĐÃ có**:

```bash
# Mở bằng editor yêu thích
code .env        # VS Code
nano .env        # Nano
vim .env         # Vim
notepad .env     # Windows Notepad
```

### 5.3. Thêm RAPIDAPI_KEY

Trong file `.env`, tìm dòng:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
```

**Replace** `your_rapidapi_key_here` bằng API key đã copy:

```env
RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0uvwxyz
```

**Ví dụ file .env hoàn chỉnh**:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI
GOOGLE_AI_API_KEY=AIzaSyD0SG-Qnscw5Y1XSQcqxmtyMTMD-pZQ0_w

# YouTube
YOUTUBE_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# TikTok (THIS IS THE NEW LINE!)
RAPIDAPI_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0uvwxyz

# Make.com Webhook
MAKECOM_WEBHOOK_URL=https://hook.us2.make.com/xxxxx
MAKE_WEBHOOK_SECRET=your-secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.4. Save File

```
Ctrl+S (Windows/Linux)
Cmd+S (Mac)

✅ File .env saved!
```

---

## 🚀 BƯỚC 6: Test API (2 phút)

### 6.1. Restart Server

```bash
# Start dev server
npm run dev
```

### 6.2. Test Trên UI

```
1. Mở browser: http://localhost:3000
2. Đăng nhập vào account
3. Navigate: /dashboard/create
4. Paste TikTok URL vào ô input:

   https://www.tiktok.com/@username/video/7123456789012345678

5. Click "Phân tích video"
```

### 6.3. Check Console Logs

Trong terminal (nơi chạy `npm run dev`), bạn sẽ thấy:

**✅ Nếu API key ĐÚNG**:
```
🎯 Fetching TikTok video via RapidAPI...
✅ TikTok video fetched successfully
```

**❌ Nếu API key SAI**:
```
❌ RapidAPI failed: Error 403 Forbidden
⚠️ Falling back to placeholder data
```

**⚠️ Nếu KHÔNG có API key**:
```
⚠️ RAPIDAPI_KEY not configured. TikTok videos will return placeholder data.
💡 To enable real TikTok data: Add RAPIDAPI_KEY to .env
```

### 6.4. Verify Response Data

**✅ Nếu thành công**, video info sẽ có:

```json
{
  "title": "[REAL TITLE FROM TIKTOK]",
  "description": "[REAL DESCRIPTION]",
  "channelName": "@realusername",
  "viewCount": 123456,  // ← Real number, not 0
  "thumbnail": "https://p16-sign.tiktokcdn.com/..."
}
```

**❌ Nếu thất bại**, sẽ thấy:

```json
{
  "title": "TikTok Video (API Key Required)",
  "viewCount": 0,  // ← Placeholder
  "channelName": "TikTok User"
}
```

---

## ✅ CHECKLIST - Xác Nhận Setup Thành Công

Kiểm tra các bước sau:

- [ ] **Step 1**: Đã đăng ký RapidAPI account
- [ ] **Step 2**: Đã tìm thấy "TikTok Video No Watermark2" API
- [ ] **Step 3**: Đã subscribe BASIC (FREE) plan
- [ ] **Step 4**: Đã copy API key từ Endpoints tab
- [ ] **Step 5**: Đã add `RAPIDAPI_KEY` vào file `.env`
- [ ] **Step 6**: Đã restart server (`npm run dev`)
- [ ] **Step 7**: Test với TikTok URL → Nhận REAL data (không phải placeholder)
- [ ] **Step 8**: Console log hiện `🎯 Fetching TikTok video via RapidAPI...`

**Tất cả đã check?** → Congratulations! TikTok API working! 🎉

---

## 🔧 TROUBLESHOOTING

### Issue 1: "API Key Invalid" Error

**Triệu chứng**:
```
❌ RapidAPI failed: Error 403 Forbidden
```

**Nguyên nhân & Giải pháp**:

**A. Sai API key**
```
✅ Fix:
1. Quay lại RapidAPI
2. Re-copy API key (chắc chắn copy FULL key)
3. Paste lại vào .env
4. Restart server
```

**B. Copy thiếu/thừa ký tự**
```
✅ Fix:
- Check API key KHÔNG có khoảng trắng ở đầu/cuối
- Không có dấu ngoặc kép '', ""
- Copy chính xác từ 'X-RapidAPI-Key': 'KEY_HERE'
```

**C. Chưa subscribe API**
```
✅ Fix:
1. Quay lại API page
2. Check xem có nút "Subscribe to Test" không
3. Nếu có → Click subscribe lại
4. Nếu không → Đã subscribed rồi, check key lại
```

---

### Issue 2: "RAPIDAPI_KEY not configured"

**Triệu chứng**:
```
⚠️ RAPIDAPI_KEY not configured
💡 To enable real TikTok data: Add RAPIDAPI_KEY to .env
```

**Nguyên nhân & Giải pháp**:

**A. File .env không tồn tại**
```
✅ Fix:
cd /path/to/video-affiliate-app
cp .env.example .env
# Sau đó edit .env và add RAPIDAPI_KEY
```

**B. Sai tên biến**
```
❌ Wrong:
RAPID_API_KEY=xxx     # Thiếu chữ API
RAPIDAPIKEY=xxx       # Thiếu dấu _
rapidapi_key=xxx      # Lowercase

✅ Correct:
RAPIDAPI_KEY=xxx      # Chính xác!
```

**C. File .env ở sai folder**
```
✅ Fix:
- File .env phải ở ROOT của project
- KHÔNG nằm trong /lib, /app, /components
- Cùng folder với package.json, next.config.js
```

**D. Chưa restart server**
```
✅ Fix:
1. Stop server: Ctrl+C
2. Start lại: npm run dev
3. .env chỉ load khi start, không tự động reload
```

---

### Issue 3: "Rate Limit Exceeded"

**Triệu chứng**:
```
❌ RapidAPI failed: Error 429 Too Many Requests
```

**Nguyên nhân**:
- FREE plan: 100 requests/month
- Đã dùng hết quota

**Giải pháp**:

**A. Check usage**
```
1. Login RapidAPI
2. Click avatar → "My Apps"
3. Click app đang dùng
4. Xem "Usage" section
5. Check số requests đã dùng
```

**B. Upgrade plan**
```
Nếu cần nhiều hơn 100 requests/month:
1. Quay lại API page
2. Click "Pricing"
3. Subscribe plan cao hơn:
   - PRO: $9.99/month = 10,000 requests
   - ULTRA: $49.99/month = 100,000 requests
```

**C. Wait cho tháng mới**
```
- FREE plan reset mỗi tháng
- Ví dụ: Subscribe ngày 15/1 → Reset 15/2
- Hoặc dùng placeholder data tạm thời
```

---

### Issue 4: "Payment Method Required"

**Triệu chứng**:
```
Khi subscribe, RapidAPI yêu cầu add credit card
```

**Giải pháp**:

**A. Add credit card (Recommended)**
```
⚠️ ĐỪNG LO: FREE plan KHÔNG charge tiền!

1. Click "Add Payment Method"
2. Nhập card info
3. Card chỉ để verify, $0 charge

✅ Card được save, nhưng FREE plan vẫn FREE
```

**B. Dùng Virtual Card**
```
Nếu không muốn dùng card thật:
1. Tạo VCC (Virtual Credit Card):
   - Vietcombank: VCC
   - TPBank: eCard
   - Momo: Virtual Card
2. Add VCC vào RapidAPI
3. $0 limit → Không thể charge
```

---

### Issue 5: Console Log Không Hiện

**Triệu chứng**:
```
Không thấy log "🎯 Fetching TikTok video..."
```

**Giải pháp**:

**A. Check terminal đang chạy server**
```
- Log hiện ở terminal chạy `npm run dev`
- KHÔNG hiện ở browser console
- Check đúng terminal window
```

**B. Check browser Network tab**
```
1. Mở DevTools (F12)
2. Tab "Network"
3. Filter: "analyze-video"
4. Xem request/response
```

---

## 📊 MONITORING USAGE

### Check Quota Remaining

```
1. Login RapidAPI: https://rapidapi.com/
2. Click avatar (góc phải trên)
3. Click "My Apps"
4. Click app name
5. Xem "API Analytics":
   - Requests used: 45/100
   - Quota remaining: 55
   - Resets on: Feb 15, 2025
```

### Usage Dashboard

```
RapidAPI Dashboard shows:
┌─────────────────────────────────────┐
│ Current Plan: BASIC (Free)          │
│ Requests this month: 45/100         │
│ Success rate: 100%                  │
│ Average response time: 1.2s         │
│ Resets: Feb 15, 2025                │
└─────────────────────────────────────┘
```

---

## 🔐 SECURITY BEST PRACTICES

### ✅ DO

```
✅ Store API key in .env file
✅ Add .env to .gitignore (đã có sẵn)
✅ KHÔNG commit .env to git
✅ Dùng .env.example cho template
✅ Add RAPIDAPI_KEY to Vercel env vars when deploy
```

### ❌ DON'T

```
❌ ĐỪNG hardcode API key trong source code
❌ ĐỪNG commit .env to GitHub
❌ ĐỪNG share API key publicly
❌ ĐỪNG expose API key ở client-side code
```

### Vercel Deployment

Khi deploy lên Vercel:

```
1. Go to Vercel Dashboard
2. Select project
3. Settings → Environment Variables
4. Add new variable:
   Name: RAPIDAPI_KEY
   Value: [paste your key]
   Environments: Production, Preview, Development
5. Click "Save"
6. Redeploy project

✅ API key secure on Vercel!
```

---

## 💰 UPGRADE PLAN (Khi Cần)

### Khi Nào Nên Upgrade?

```
FREE (100 req/month) → PRO ($9.99/month, 10,000 req)

Upgrade khi:
- ✅ Vượt quá 100 TikTok analyses/month
- ✅ Cần response time nhanh hơn
- ✅ Production app với nhiều users
- ✅ Không muốn lo hết quota
```

### Cách Upgrade

```
1. Login RapidAPI
2. Go to API page: "TikTok Video No Watermark2"
3. Click "Pricing" tab
4. Click "Subscribe" under PRO plan
5. Confirm payment method
6. Done! Quota tăng lên 10,000/month

⚠️ Lưu ý: API key KHÔNG thay đổi
→ Không cần update .env
→ Tự động dùng quota mới
```

---

## 🎯 TIPS & TRICKS

### Tip 1: Test API Trước Khi Dùng Production

```bash
# Test endpoint manually với curl:
curl --request GET \
  --url 'https://tiktok-video-no-watermark2.p.rapidapi.com/?url=https://www.tiktok.com/@user/video/123456' \
  --header 'X-RapidAPI-Host: tiktok-video-no-watermark2.p.rapidapi.com' \
  --header 'X-RapidAPI-Key: YOUR_API_KEY_HERE'

# Nếu work → Response có data
# Nếu fail → Check API key
```

### Tip 2: Cache TikTok Data

```
Save TikTok video info vào database sau lần fetch đầu
→ Avoid duplicate API calls for same video
→ Save quota
→ Faster response
```

### Tip 3: Monitor Monthly Usage

```
Set reminder mỗi tuần:
- Check RapidAPI dashboard
- Xem usage: X/100 requests
- Nếu gần hết → Upgrade hoặc limit usage
```

### Tip 4: Dùng Multiple API Keys (Advanced)

```
Nếu cần nhiều hơn 100 requests mà không muốn trả tiền:
1. Tạo nhiều RapidAPI accounts (different emails)
2. Mỗi account subscribe FREE plan
3. Rotate keys trong code
4. 3 accounts = 300 requests/month FREE

⚠️ Lưu ý: Cách này không recommended cho production
```

---

## 📞 SUPPORT

### RapidAPI Support

```
Email: support@rapidapi.com
Dashboard: https://rapidapi.com/support
Response time: 24-48 hours
```

### API-Specific Issues

```
API Page → "Discussions" tab
- Post question
- Community help
- API author response
```

### Project Issues

```
Check documentation:
- TIKTOK_INTEGRATION_ANALYSIS.md
- TIKTOK_SETUP_GUIDE.md
- README.md
```

---

## 🎊 DONE!

Nếu bạn đã hoàn thành tất cả bước trên:

- ✅ RapidAPI account created
- ✅ Subscribed to TikTok API (FREE plan)
- ✅ API key copied
- ✅ Added to .env file
- ✅ Server restarted
- ✅ Tested successfully

**Congratulations!** 🎉

TikTok video analysis is now working with REAL data!

Bạn có thể:
- ✅ Analyze TikTok videos
- ✅ Get real metadata (title, views, author)
- ✅ Create high-quality reviews
- ✅ Use AI with accurate data

**Happy analyzing!** 🚀

---

**Last Updated**: 2025-01-09
**Version**: 1.0
**Status**: Complete Guide ✅
