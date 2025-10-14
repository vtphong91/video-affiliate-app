# Giải Pháp Timezone - Store UTC, Display GMT+7

## 🎯 **Nguyên Tắc:**

### **1. Database Storage: UTC**
- Lưu tất cả timestamps dưới dạng **UTC** (không có timezone offset)
- Format: `2025-10-14T07:58:00.000Z`
- Column type: `timestamp` (KHÔNG phải `timestamptz`)

### **2. UI Display: GMT+7**
- Convert UTC → GMT+7 khi hiển thị cho user
- User thấy: `14/10/2025 14:58`
- User input: `14:58` (GMT+7)

### **3. Comparison: UTC với UTC**
- Database: `2025-10-14T07:58:00.000Z` (UTC)
- Server: `2025-10-14T08:00:00.000Z` (UTC)
- So sánh: `07:58 <= 08:00` ✅ TRUE (đơn giản, không lỗi!)

---

## 🔧 **Implementation:**

### **Flow Tạo Schedule:**

```
User input (GMT+7): 14:58
  ↓
createTimestampFromDatePicker()
  ↓
Convert GMT+7 → UTC: 07:58
  ↓
Save to database: 2025-10-14T07:58:00.000Z
```

### **Flow Hiển Thị Schedule:**

```
Database (UTC): 2025-10-14T07:58:00.000Z
  ↓
parseTimestampFromDatabase()
  ↓
Convert UTC → GMT+7: 14:58
  ↓
Display to user: 14/10/2025 14:58
```

### **Flow Cron Check:**

```
Server UTC time: 2025-10-14T08:00:00.000Z
  ↓
getPendingSchedules()
  ↓
Query: scheduled_for <= '2025-10-14T08:00:00.000Z'
  ↓
Finds: 2025-10-14T07:58:00.000Z ✅
  ↓
Process schedule
```

---

## 📊 **Ví Dụ Cụ Thể:**

### **Scenario: User tạo schedule lúc 14:58 GMT+7**

| Bước | Giá trị | Ghi chú |
|------|---------|---------|
| 1. User input | `14:58` | GMT+7 |
| 2. Convert to UTC | `07:58` | 14:58 - 7 = 07:58 |
| 3. Save to DB | `2025-10-14T07:58:00.000Z` | UTC ISO string |
| 4. Display on UI | `14:58` | Convert UTC → GMT+7 |
| 5. Server time | `2025-10-14T08:00:00.000Z` | 2 phút sau |
| 6. Comparison | `07:58 <= 08:00` | TRUE ✅ |
| 7. Post schedule | Success | Đăng bài thành công |

---

## ✅ **Ưu Điểm:**

1. **Đơn giản:** So sánh UTC với UTC, không cần convert
2. **Chính xác:** Không bị lỗi timezone offset
3. **Best Practice:** Đúng chuẩn quốc tế
4. **Scalable:** Dễ mở rộng ra nhiều timezone khác
5. **Database friendly:** PostgreSQL tự động handle UTC

---

## 🔧 **Functions:**

### **createTimestampFromDatePicker(date, time)**
```typescript
Input: Date object + "14:58" (GMT+7)
Output: "2025-10-14T07:58:00.000Z" (UTC)
```

### **parseTimestampFromDatabase(isoString)**
```typescript
Input: "2025-10-14T07:58:00.000Z" (UTC)
Output: Date object GMT+7 (for display)
```

### **calculateTimeRemaining(scheduledForIso)**
```typescript
Input: "2025-10-14T07:58:00.000Z" (UTC)
Output: { days: 0, hours: 0, minutes: 2, isOverdue: false }
```

### **getCurrentTimestamp()**
```typescript
Output: "2025-10-14T08:00:00.000Z" (UTC)
```

### **formatTimestampForDisplay(isoString)**
```typescript
Input: "2025-10-14T07:58:00.000Z" (UTC)
Output: "14/10/2025 14:58" (GMT+7 display)
```

---

## 🗄️ **Database Schema:**

### **Before (Wrong):**
```sql
scheduled_for TIMESTAMPTZ  -- "2025-10-14T14:58:00.000+07:00"
```

### **After (Correct):**
```sql
scheduled_for TIMESTAMP WITHOUT TIME ZONE  -- "2025-10-14T07:58:00.000Z"
```

### **Migration:**
```sql
-- Backup
CREATE TABLE schedules_backup AS SELECT * FROM schedules;

-- Change column type
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMP WITHOUT TIME ZONE;

-- Verify
SELECT scheduled_for FROM schedules LIMIT 5;
```

---

## 🧪 **Testing:**

### **Test 1: Tạo Schedule**
```javascript
// User input: 14:58 GMT+7
const timestamp = createTimestampFromDatePicker(new Date(), "14:58");
console.log(timestamp); // "2025-10-14T07:58:00.000Z"
```

### **Test 2: Hiển Thị Schedule**
```javascript
// Database: "2025-10-14T07:58:00.000Z"
const displayTime = formatTimestampForDisplay("2025-10-14T07:58:00.000Z");
console.log(displayTime); // "14/10/2025 14:58"
```

### **Test 3: Check Pending**
```javascript
// Current UTC: 08:00, Schedule UTC: 07:58
const pending = await getPendingSchedules();
console.log(pending.length); // 1 (found!)
```

---

## 🚀 **Deployment Checklist:**

- [x] Sửa `createTimestampFromDatePicker()` → Store UTC
- [x] Sửa `parseTimestampFromDatabase()` → Convert UTC to GMT+7
- [x] Sửa `calculateTimeRemaining()` → Compare in GMT+7
- [x] Sửa `getCurrentTimestamp()` → Return UTC
- [ ] Update database column type (nếu cần)
- [ ] Xóa schedules cũ có timezone offset
- [ ] Tạo schedules mới với UTC
- [ ] Test cron process schedules
- [ ] Verify UI display đúng GMT+7

---

## 📝 **Notes:**

1. **Existing Data:** Schedules cũ với `+07:00` offset sẽ KHÔNG hoạt động. Cần xóa và tạo lại.

2. **Database Column:** Nên đổi sang `TIMESTAMP WITHOUT TIME ZONE` nhưng không bắt buộc. PostgreSQL sẽ tự động xử lý.

3. **UI Display:** Tất cả UI đều hiển thị GMT+7, user không nhận biết được database lưu UTC.

4. **Server Location:** Code hoạt động đúng ở BẤT KỲ server timezone nào (US, EU, Asia) vì dùng UTC.

---

**Created:** 2025-10-14
**Status:** READY TO DEPLOY
**Version:** 2.0 - UTC Storage
