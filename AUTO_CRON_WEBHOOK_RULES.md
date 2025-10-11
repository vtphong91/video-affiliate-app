# AUTO CRON WEBHOOK MODULE - DEVELOPMENT RULES

## ⚠️ QUAN TRỌNG: Module Auto Cron Webhook

### **Rule chính:**
- **Module Auto Cron Webhook rất quan trọng** cho chức năng tự động đăng bài
- **HẠN CHẾ đụng đến code** của module này trừ khi phát triển tiếp
- **HỎI LẠI khi muốn dev** vào module này

### **TIMEZONE RULE - QUAN TRỌNG:**
- **Database `scheduled_for`:** Lưu GMT+7 format `YYYY-MM-DDTHH:mm:ss.sss+07:00`
- **DateTimePicker:** User chọn GMT+7, lưu trực tiếp không convert
- **createTimestampFromDatePicker:** Tạo GMT+7 string thủ công, KHÔNG dùng `toISOString()`
- **UI Display:** Parse GMT+7 trực tiếp từ database, không cần conversion
- **calculateTimeRemaining:** So sánh GMT+7 với GMT+7 hiện tại
- **KHÔNG để Supabase** tự động convert timezone

### **Files thuộc Auto Cron Webhook Module:**
```
lib/services/cron-service.ts          # Core cron logic
app/api/cron/process-schedules/route.ts  # API endpoint cho cron
app/api/cron/check-schedules/route.ts    # API endpoint kiểm tra schedules
app/api/cron/debug-schedules/route.ts    # API endpoint debug schedules
lib/services/webhook-log-service.ts   # Webhook logging
app/api/post-facebook/route.ts        # Facebook posting API
lib/apis/facebook.ts                  # Facebook API integration
lib/utils/timezone-utils.ts           # Timezone handling functions
auto-cron.js                          # Auto cron script (chạy mỗi 30s)
app/dashboard/schedules/page.tsx      # Frontend với auto-refresh (5 phút)
```

### **Chức năng chính:**
1. **Tự động kiểm tra schedules** theo thời gian
2. **Tự động đăng bài lên Facebook** khi đến giờ
3. **Gửi webhook đến Make.com** để xử lý
4. **Logging và error handling** cho webhook
5. **Retry mechanism** khi đăng bài thất bại
6. **Frontend auto-refresh** để hiển thị trạng thái real-time

### **FRONTEND AUTO-REFRESH RULES:**
- **Auto-refresh interval:** 5 phút (300,000ms) - KHÔNG được thay đổi
- **Manual refresh:** Button "Làm mới" để refresh ngay lập tức
- **Loading states:** 
  - Auto-refresh: Không hiển thị loading spinner
  - Manual refresh: Hiển thị loading spinner + disable button
- **Visual indicators:** "Đang cập nhật..." khi auto-refresh
- **Data only:** Chỉ refresh data, KHÔNG reload toàn bộ trang

### **Khi nào được phép sửa:**
- ✅ **Bug fixes** không ảnh hưởng đến core logic
- ✅ **UI/UX improvements** cho schedules display
- ✅ **Timezone fixes** cho hiển thị thời gian
- ✅ **Error handling** improvements
- ✅ **Frontend auto-refresh** improvements (nhưng KHÔNG thay đổi interval)
- ❌ **Thay đổi core logic** của cron service
- ❌ **Thay đổi webhook payload** structure
- ❌ **Thay đổi API endpoints** của cron
- ❌ **Thay đổi auto-refresh interval** (phải giữ 5 phút)
- ❌ **Thay đổi timezone logic** (GMT+7 direct storage)

### **Trước khi sửa Auto Cron Webhook:**
1. **Hỏi user** xem có cần thiết không
2. **Giải thích** tác động của thay đổi
3. **Backup** code hiện tại
4. **Test kỹ** sau khi sửa

### **Status hiện tại:**
- ✅ **Timezone handling:** Đã sửa để lưu GMT+7 trực tiếp với format `+07:00`
- ✅ **Overdue calculation:** Đã sửa để tính đúng thời gian quá hạn
- ✅ **Schedule display:** Hiển thị đúng thời gian GMT+7
- ✅ **Cron service:** Hoạt động bình thường
- ✅ **Auto cron script:** Chạy mỗi 30 giây trên port 3000
- ✅ **Frontend auto-refresh:** Cập nhật mỗi 5 phút
- ✅ **UI improvements:** Màu sắc và trạng thái chuyên nghiệp

### **Lưu ý:**
- Database `scheduled_for` column lưu GMT+7 với timezone offset `+07:00`
- Không cần convert thêm timezone trong frontend
- `calculateTimeRemaining` đã được sửa để so sánh đúng
- `formatDateTime` đã được sửa để hiển thị đúng
- `createTimestampFromDatePicker` tạo GMT+7 string thủ công
- `getCurrentTimestamp` tạo GMT+7 timestamp để so sánh với database
- Auto cron chạy trên port 3000 (không phải 3001)
- Frontend auto-refresh mỗi 5 phút (không phải 5 giây)

---
**Tạo ngày:** 2025-10-11  
**Cập nhật:** 2025-10-11 (Final - Auto-refresh 5 phút)  
**Trạng thái:** ACTIVE - PROTECTED
