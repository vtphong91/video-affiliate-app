# Hướng Dẫn Fix Database Schema

## 🔍 Vấn Đề Hiện Tại

Từ hình ảnh SQL editor, lỗi là:
```
ERROR: 42703: column "target_typ" does not exist
```

Điều này có nghĩa là column thực tế trong database không phải là `target_typ`.

## 🛠️ Giải Pháp

### Bước 1: Kiểm Tra Schema Thực Tế

Chạy SQL này trong Supabase SQL Editor:

```sql
-- Kiểm tra tất cả columns của schedules table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'schedules' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Kiểm tra dữ liệu hiện tại
SELECT * FROM schedules LIMIT 1;
```

### Bước 2: Xác Định Column Name Đúng

Từ kết quả Bước 1, tìm column có tên tương tự như:
- `target_type`
- `target_typ`
- `target`
- `post_type`
- `type`

### Bước 3: Fix Schema (Chọn một trong các options)

#### Option A: Nếu column là `target_type` (đúng rồi)
```sql
-- Chỉ cần fix user_id
ALTER TABLE schedules ALTER COLUMN user_id TYPE TEXT;
```

#### Option B: Nếu column là `target_typ` (thiếu 'e')
```sql
-- Rename column và fix user_id
ALTER TABLE schedules RENAME COLUMN target_typ TO target_type;
ALTER TABLE schedules ALTER COLUMN user_id TYPE TEXT;
```

#### Option C: Nếu column có tên khác
```sql
-- Thay thế 'ACTUAL_COLUMN_NAME' bằng tên thực tế
ALTER TABLE schedules RENAME COLUMN ACTUAL_COLUMN_NAME TO target_type;
ALTER TABLE schedules ALTER COLUMN user_id TYPE TEXT;
```

### Bước 4: Test Schema Fix

```sql
-- Test insert
INSERT INTO schedules (
  user_id,
  review_id,
  scheduled_for,
  timezone,
  target_type,
  target_id,
  target_name,
  post_message,
  landing_page_url,
  status,
  retry_count,
  max_retries
) VALUES (
  'test-user',
  '45e448df-d4ef-4d5d-9303-33109f9d6c30',
  '2025-01-08T11:20:00.000Z',
  'Asia/Ho_Chi_Minh',
  'page',
  'test-target',
  'Test Target',
  'Test message',
  'https://test.com',
  'pending',
  0,
  3
);

-- Verify insert
SELECT * FROM schedules WHERE user_id = 'test-user';

-- Clean up
DELETE FROM schedules WHERE user_id = 'test-user';
```

### Bước 5: Sync Mock Data Sang Real Database

Sau khi fix schema, chạy API sync:

```bash
# Test sync
curl -X POST http://localhost:3000/api/sync-mock-to-real

# Hoặc trong browser console:
fetch('/api/sync-mock-to-real', { method: 'POST' })
  .then(response => response.json())
  .then(data => console.log(data));
```

## 🎯 Kết Quả Mong Đợi

Sau khi fix schema:
- ✅ Real database insert works
- ✅ Mock data được sync sang real database
- ✅ UI chuyển từ mock storage sang real database
- ✅ Data persistent across server restarts

## 🚨 Lưu Ý

- **Backup data** trước khi chạy ALTER TABLE
- **Test trên staging** trước khi chạy trên production
- **Mock storage vẫn hoạt động** trong khi fix database
- **UI không bị ảnh hưởng** trong quá trình fix

## 📞 Nếu Vẫn Lỗi

Nếu vẫn gặp lỗi sau khi fix schema:

1. **Check lại column names** với SQL ở Bước 1
2. **Verify data types** match với code
3. **Test insert** với SQL ở Bước 4
4. **Contact support** với error message chi tiết

---

**UI hiện tại hoạt động hoàn hảo với mock storage. Database schema fix chỉ cần thiết để persistent data.**
