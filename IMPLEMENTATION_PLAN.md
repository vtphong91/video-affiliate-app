# Hướng dẫn kiểm tra vấn đề Reviews không load

## Bước 1: Chạy SQL Queries trên Supabase

File: `check-user-role.sql`

### Cách sử dụng:
1. Mở Supabase Dashboard: https://supabase.com/dashboard
2. Chọn project của bạn
3. Click "SQL Editor" ở sidebar bên trái
4. Mở file `check-user-role.sql` 
5. Copy từng query (từ `SELECT` đến dấu `;`)
6. Paste vào SQL Editor và click "Run"

### Queries quan trọng nhất (CHẠY TRƯỚC):

**QUERY 1** - Verify user_id:
```sql
SELECT id as user_id, email, role
FROM user_profiles
WHERE email = 'lammmodotcom@gmail.com';
```
→ **user_id phải bắt đầu bằng `f788ee95-...`**

**QUERY 2** - Count total reviews:
```sql
SELECT COUNT(*) as total_reviews
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
```
→ **Phải > 62 nếu đã tạo review mới**

**QUERY 3** - List 10 reviews mới nhất:
```sql
SELECT id, video_title, status, created_at
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY created_at DESC
LIMIT 10;
```
→ **Review đầu tiên phải là review vừa tạo**

**QUERY 4** - Tìm review cụ thể:
```sql
SELECT id, video_title, status, created_at
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND video_title LIKE '%Máy xay thịt Philips HR1503%'
ORDER BY created_at DESC;
```
→ **Phải có ít nhất 1 row**

**QUERY 7** - Check 2 user IDs:
```sql
SELECT user_id, COUNT(*) as review_count
FROM reviews
WHERE user_id IN (
  'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1',
  '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
)
GROUP BY user_id;
```
→ **Chỉ có 1 row (user_id với 'f')**
→ **Nếu có 2 rows = BUG: Có 2 users khác nhau**

**QUERY 11** - Simulate API response:
```sql
SELECT id, slug, video_title, status, created_at
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
ORDER BY created_at DESC
LIMIT 6 OFFSET 0;
```
→ **Đây chính xác là data mà trang Reviews hiển thị**

## Bước 2: Phản hồi kết quả

Sau khi chạy xong, cho tôi biết:

### Format báo cáo:

```
QUERY 1 - user_id:
- Kết quả: <user_id từ database>
- Email: <email>
- Role: <role>

QUERY 2 - Total reviews:
- Count: <số lượng>

QUERY 3 - Review mới nhất:
- Title: <video_title>
- Status: <status>
- Created: <created_at>

QUERY 4 - Tìm "Máy xay thịt":
- Có tìm thấy: Có/Không
- Số lượng rows: <count>

QUERY 7 - Check 2 user IDs:
- Có bao nhiêu user_id: <1 hay 2>
- user_id nào: <list>

QUERY 11 - Top 6 reviews (API simulation):
1. <video_title 1> - <status>
2. <video_title 2> - <status>
3. <video_title 3> - <status>
4. <video_title 4> - <status>
5. <video_title 5> - <status>
6. <video_title 6> - <status>
```

## Bước 3: Phân tích kết quả

### Scenario A: Review KHÔNG có trong database
**Triệu chứng:**
- QUERY 2: total = 62 (không tăng)
- QUERY 4: 0 rows (không tìm thấy)

**Nguyên nhân:** Review chưa được lưu vào database

**Giải pháp:** Tạo lại review và check dev server logs:
```
💾 Saving review to database
✅ Review saved successfully
```

### Scenario B: Review CÓ trong database nhưng WRONG user_id
**Triệu chứng:**
- QUERY 7: Có 2 rows (2 user_ids khác nhau)
- Review có user_id bắt đầu bằng '1' thay vì 'f'

**Nguyên nhân:** Session bị sai khi tạo review

**Giải pháp:** Chạy QUERY 13 để update user_id:
```sql
UPDATE reviews
SET user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
WHERE user_id = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND video_title LIKE '%Máy xay thịt Philips HR1503%';
```

### Scenario C: Review CÓ với user_id ĐÚNG nhưng status = 'draft'
**Triệu chứng:**
- QUERY 3: Review có status = 'draft'
- QUERY 5: draft count > 0

**Nguyên nhân:** Review được tạo với status draft

**Giải pháp:** Update status thành 'published':
```sql
UPDATE reviews
SET status = 'published'
WHERE video_title LIKE '%Máy xay thịt Philips HR1503%'
  AND user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND status = 'draft';
```

### Scenario D: Review CÓ, user_id ĐÚNG, status ĐÚNG nhưng vẫn không hiển thị
**Triệu chứng:**
- QUERY 11: Review KHÔNG có trong top 6
- QUERY 3: Review có nhưng created_at CŨ (> 1 giờ trước)

**Nguyên nhân:** Review không phải mới nhất, nằm ở page sau

**Giải pháp:** 
1. Check pagination - click page 2, 3, ...
2. Hoặc re-create review mới

## Bước 4: Alternatives - Check từ Browser

Nếu không muốn dùng SQL, có thể check từ browser:

### Option 1: Browser Console
```javascript
// F12 → Console tab
fetch('/api/reviews?page=1&limit=10')
  .then(r => r.json())
  .then(data => {
    console.log('Total:', data.data.total);
    console.log('Reviews:', data.data.reviews.map(r => r.video_title));
  });
```

### Option 2: Network tab
1. F12 → Network tab
2. Reload trang /dashboard/reviews
3. Tìm request: `reviews?page=1&limit=6`
4. Click vào request
5. Check tab "Response" → xem data trả về

### Option 3: React DevTools
1. Install React DevTools extension
2. F12 → Components tab
3. Find `ReviewsPage` component
4. Check state: `reviews`, `totalItems`

## Tổng kết

File SQL đã tạo: `check-user-role.sql`

Chạy queries từ 1 → 12 theo thứ tự, rồi báo lại kết quả.

Tôi sẽ phân tích và đưa ra giải pháp cụ thể dựa trên kết quả.
