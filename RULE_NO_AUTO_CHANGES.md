# RULE: KHÔNG TỰ ĐỘNG ĐIỀU CHỈNH AUTO CRON VÀ FACEBOOK POST MODULES

## 📋 RULE ĐÃ ĐƯỢC XÁC NHẬN

**Ngày:** 2025-10-14  
**Trạng thái:** Auto Cron và Facebook Post modules đã hoạt động tốt  
**Rule:** KHÔNG TỰ ĐỘNG ĐIỀU CHỈNH CODE ở 2 module này nữa

## 🚫 CÁC MODULE KHÔNG ĐƯỢC TỰ ĐỘNG THAY ĐỔI

### 1. **Auto Cron Module**
- **File:** `lib/services/cron-service.ts`
- **API:** `app/api/cron/process-schedules/route.ts`
- **Status:** ✅ Hoạt động tốt
- **Webhook payload:** ✅ Đã chuẩn hóa với Facebook Post

### 2. **Facebook Post Module**
- **File:** `app/api/post-facebook/route.ts`
- **Component:** `components/FacebookPoster.tsx`
- **Status:** ✅ Hoạt động tốt
- **Webhook payload:** ✅ Đã chuẩn hóa với Auto Cron

## ✅ CÁC MODULE ĐÃ ĐƯỢC CHUẨN HÓA

### **Webhook Payload Consistency:**
- **Consistency Score:** 100%
- **Total Fields:** 24 fields
- **Status:** EXCELLENT
- **Both modules:** Sử dụng cùng cấu trúc webhook payload

### **Affiliate Links Handling:**
- **Database:** Lưu dưới dạng `jsonb` array
- **Webhook:** Format thành text với `formatAffiliateLinksForWebhook`
- **Status:** ✅ Hoạt động đúng

### **Post Message Format:**
- **Format:** Chuẩn hóa với `formatFacebookPost`
- **Copyright:** Đúng format yêu cầu
- **Status:** ✅ Hoạt động đúng

## 🔧 CHỈ ĐƯỢC THAY ĐỔI KHI

1. **User yêu cầu cụ thể** về bug hoặc tính năng mới
2. **Có lỗi nghiêm trọng** ảnh hưởng đến hoạt động
3. **User xác nhận** cần điều chỉnh

## 📝 GHI CHÚ

- **Auto Cron:** Chạy mỗi 30 giây, xử lý schedules đúng
- **Facebook Post:** Manual posting hoạt động tốt
- **Webhook:** Make.com nhận payload nhất quán
- **Database:** affiliate_links được lưu đúng format

## ⚠️ LƯU Ý

**KHÔNG ĐƯỢC:**
- Tự động refactor code
- Tự động optimize performance
- Tự động thêm tính năng mới
- Tự động sửa "code smell"

**CHỈ ĐƯỢC:**
- Fix bug khi user báo cáo
- Thêm tính năng khi user yêu cầu
- Điều chỉnh khi user xác nhận
