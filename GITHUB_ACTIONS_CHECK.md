# Hướng Dẫn Kiểm Tra GitHub Actions

## 📋 Các Bước Kiểm Tra

### Bước 1: Push Code Lên GitHub

```bash
git add .
git commit -m "fix: Update GitHub Actions to use correct cron endpoint"
git push
```

---

### Bước 2: Kiểm Tra GitHub Secrets

1. Vào repository trên GitHub: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. Click vào tab **Settings**

3. Ở sidebar bên trái, click **Secrets and variables** → **Actions**

4. Kiểm tra có 2 secrets sau:
   - ✅ `CRON_SECRET` - Giá trị bạn đã tạo (ví dụ: `dev-secret` hoặc secret key khác)
   - ✅ `VERCEL_APP_URL` - URL app Vercel của bạn (ví dụ: `video-affiliate-app.vercel.app`)

   **⚠️ QUAN TRỌNG:**
   - `VERCEL_APP_URL` KHÔNG bao gồm `https://` (chỉ cần domain)
   - `CRON_SECRET` phải giống với giá trị trên Vercel hoặc `.env.local`

5. Nếu chưa có, click **New repository secret** để thêm

---

### Bước 3: Kiểm Tra GitHub Actions Có Chạy Không

#### 3.1. Xem Danh Sách Workflows

1. Vào tab **Actions** trên GitHub repository

2. Tìm workflow tên: **"Process Schedules Cron"**

3. Kiểm tra:
   - ✅ Workflow có màu xanh (thành công) hay đỏ (thất bại)?
   - ✅ Có chạy mỗi 5 phút không?

#### 3.2. Test Thủ Công (Manual Trigger)

1. Vào tab **Actions**

2. Click vào workflow **"Process Schedules Cron"**

3. Click nút **"Run workflow"** (bên phải)

4. Chọn branch `master` (hoặc branch hiện tại của bạn)

5. Click **"Run workflow"** màu xanh

6. Đợi 10-20 giây, refresh trang

7. Click vào workflow run vừa tạo để xem logs

#### 3.3. Đọc Logs

Logs sẽ có dạng:

```
🔄 Triggering schedule processing...
📥 Response code: 200
📋 Response body: {"success":true,"message":"Processed 2 schedules",...}
✅ Cron job triggered successfully
```

**Nếu thành công:**
- Response code = 200
- Có message "Processed X schedules"

**Nếu thất bại:**
- Response code = 401: Sai `CRON_SECRET`
- Response code = 500: Lỗi server
- Response code = 404: Sai URL

---

### Bước 4: Kiểm Tra Vercel Logs

1. Vào Vercel Dashboard: `https://vercel.com/dashboard`

2. Chọn project của bạn

3. Vào tab **Logs** (hoặc **Deployments** → chọn deployment mới nhất → **Functions**)

4. Tìm logs từ function `/api/cron/check-schedules`

5. Kiểm tra:
   - ✅ Có logs "🕐 Cron job started" không?
   - ✅ Có logs "📋 Found X pending schedules" không?
   - ✅ Có logs "✅ Authorized cron request" không?

---

### Bước 5: Kiểm Tra Database

1. Vào Supabase Dashboard: `https://app.supabase.com/`

2. Chọn project của bạn

3. Vào **Table Editor** → Chọn table **`schedules`**

4. Kiểm tra:
   - ✅ Các schedule có `status = 'pending'` được đổi thành `posted`?
   - ✅ Có `posted_at` timestamp không?
   - ✅ Có schedule nào bị `status = 'failed'` không?

5. Vào table **`webhook_logs`**:
   - ✅ Có logs webhook requests không?
   - ✅ `response_status` có = 200 không?
   - ✅ Có `error_message` nào không?

---

## 🔧 Troubleshooting

### Vấn đề 1: GitHub Actions không chạy tự động mỗi 5 phút

**Nguyên nhân:**
- GitHub Actions có delay 5-15 phút cho cron schedule
- Hoặc repository không có activity gần đây

**Giải pháp:**
1. Đợi 10-15 phút sau khi push code
2. Hoặc trigger thủ công bằng **"Run workflow"**
3. Kiểm tra workflow có enabled không (vào Actions → click workflow → Enable nếu cần)

---

### Vấn đề 2: Response code = 401 (Unauthorized)

**Nguyên nhân:**
- `CRON_SECRET` trên GitHub không khớp với Vercel

**Giải pháp:**
1. Kiểm tra `CRON_SECRET` trên GitHub Secrets
2. Kiểm tra `CRON_SECRET` trên Vercel Environment Variables
3. Đảm bảo 2 giá trị giống hệt nhau (case-sensitive)
4. Nếu không có `CRON_SECRET` trên Vercel, code sẽ dùng `'dev-secret'` làm mặc định

---

### Vấn đề 3: Response code = 404 (Not Found)

**Nguyên nhân:**
- `VERCEL_APP_URL` sai hoặc thiếu

**Giải pháp:**
1. Kiểm tra `VERCEL_APP_URL` trên GitHub Secrets
2. URL phải có dạng: `your-app.vercel.app` (KHÔNG có `https://`)
3. Kiểm tra app đã deploy thành công trên Vercel chưa

---

### Vấn đề 4: Response code = 500 (Internal Server Error)

**Nguyên nhân:**
- Lỗi trong code hoặc thiếu environment variables trên Vercel

**Giải pháp:**
1. Xem Vercel logs để biết lỗi cụ thể
2. Kiểm tra các environment variables bắt buộc:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (QUAN TRỌNG!)
   - `MAKECOM_WEBHOOK_URL`
3. Redeploy project trên Vercel

---

### Vấn đề 5: Cron chạy nhưng không post lên Facebook

**Nguyên nhân:**
- `MAKECOM_WEBHOOK_URL` không đúng
- Make.com webhook không hoạt động
- Không có pending schedules

**Giải pháp:**
1. Test webhook thủ công:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  https://hook.us2.make.com/YOUR_WEBHOOK_ID
```

2. Kiểm tra Make.com scenario:
   - Có đang active không?
   - Có nhận được webhook requests không?
   - Có lỗi gì không?

3. Kiểm tra database:
   - Có schedule nào có `status = 'pending'` không?
   - `scheduled_for` có <= hiện tại không?

---

## 📊 Commands Để Debug

### Test Cron Endpoint Thủ Công

```bash
# Test với CRON_SECRET
curl -X GET \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check-schedules

# Test với dev-secret (nếu không có CRON_SECRET trên Vercel)
curl -X GET \
  -H "x-cron-secret: dev-secret" \
  https://your-app.vercel.app/api/cron/check-schedules
```

### Debug Schedules

```bash
# Xem chi tiết schedules và config
curl -X GET \
  -H "x-cron-secret: YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/debug-schedules
```

---

## ✅ Checklist Đầy Đủ

- [ ] Push code lên GitHub
- [ ] Kiểm tra GitHub Secrets có đủ 2 secrets: `CRON_SECRET` và `VERCEL_APP_URL`
- [ ] Test manual trigger workflow trên GitHub Actions
- [ ] Xem logs trên GitHub Actions - phải có response code 200
- [ ] Xem logs trên Vercel - phải có "🕐 Cron job started"
- [ ] Kiểm tra database `schedules` table - status thay đổi từ `pending` → `posted`
- [ ] Kiểm tra database `webhook_logs` table - có logs webhook requests
- [ ] Kiểm tra Make.com - có nhận được webhook không
- [ ] Kiểm tra Facebook - bài post có được đăng không
- [ ] Đợi 10-15 phút để GitHub Actions tự chạy theo schedule
- [ ] Kiểm tra lại logs sau 10-15 phút

---

## 📞 Quick Check Commands

```bash
# 1. Test endpoint có hoạt động không
curl -I https://your-app.vercel.app/api/cron/check-schedules

# 2. Test với secret (xem response đầy đủ)
curl -X GET \
  -H "x-cron-secret: dev-secret" \
  https://your-app.vercel.app/api/cron/check-schedules | jq .

# 3. Debug schedules
curl -X GET \
  -H "x-cron-secret: dev-secret" \
  https://your-app.vercel.app/api/cron/debug-schedules | jq .
```

---

## 🎯 Kết Quả Mong Đợi

Nếu mọi thứ hoạt động đúng, bạn sẽ thấy:

1. **GitHub Actions:**
   - Workflow chạy mỗi 5 phút tự động
   - Logs hiển thị "✅ Cron job triggered successfully"
   - Response code = 200

2. **Vercel Logs:**
   - Có logs từ `/api/cron/check-schedules`
   - "📋 Found X pending schedules"
   - "✅ Schedule X processed successfully"

3. **Database:**
   - `schedules` table: status = `posted`, có `posted_at` timestamp
   - `webhook_logs` table: có logs, `response_status` = 200

4. **Make.com:**
   - Scenario nhận được webhook requests
   - Có executions mới

5. **Facebook:**
   - Bài post được đăng tự động theo schedule

---

**Tạo ngày:** 2025-10-14
**Trạng thái:** READY TO TEST
