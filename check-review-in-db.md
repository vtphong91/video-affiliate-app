# Debug: Kiểm tra review mới trong database

## Bước 1: Check trong Supabase Dashboard

1. Vào Supabase Dashboard → Table Editor → `reviews`
2. Sort by `created_at` DESC (mới nhất ở trên)
3. Tìm review "Máy xay thịt Philips HR1503/00"

**Check các field sau:**
- `id`: UUID của review
- `user_id`: Phải là `f788ee95-7d22-4b0b-8e45-07ae2d03c7e1`
- `video_title`: "Máy xay thịt Philips HR1503/00"  
- `status`: "published" hay "draft"?
- `created_at`: Thời gian tạo (phải là mới nhất)

## Bước 2: Chạy query SQL trực tiếp

Trong Supabase SQL Editor, chạy query này:

```sql
-- Check review mới nhất của user
SELECT 
  id,
  video_title,
  status,
  created_at,
  user_id
FROM reviews
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
  AND video_title LIKE '%Máy xay thịt Philips%'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result**: Phải thấy review "Máy xay thịt Philips HR1503/00"

## Bước 3: Count total reviews

```sql
-- Total reviews của user
SELECT COUNT(*) as total
FROM reviews  
WHERE user_id = 'f788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
```

**Expected**: Nếu có 63 reviews thì COUNT phải = 63

## Bước 4: Check session hiện tại

Mở Browser Console (F12) và chạy:

```javascript
// Check current user ID
fetch('/api/reviews?page=1&limit=1', {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('=== API RESPONSE ===');
  console.log('Total reviews:', data.data?.total);
  console.log('Latest review:', data.data?.reviews[0]?.video_title);
  console.log('Latest created_at:', data.data?.reviews[0]?.created_at);
});

// Check Supabase session
import('@/lib/auth/supabase-browser').then(({ supabaseBrowser }) => {
  supabaseBrowser.auth.getSession().then(({ data }) => {
    console.log('=== SESSION INFO ===');
    console.log('User ID:', data.session?.user?.id);
    console.log('Email:', data.session?.user?.email);
  });
});
```

**Expected**:
- User ID phải là `f788ee95-...` (bắt đầu với 'f')
- Total phải là 63 (nếu review mới đã được tạo)
- Latest review phải là review vừa tạo

## Bước 5: Check dev server logs

Trong terminal dev server, tìm logs gần đây nhất:

```bash
# Look for these patterns:
✅ Reviews fetched: X reviews
👤 Authenticated user ID for reviews: <user-id>
```

**Verify**: User ID trong logs phải là `f788ee95-...`

---

## Các khả năng vấn đề:

### Khả năng 1: Review chưa được tạo thành công
- Check logs khi tạo review: `💾 Saving review to database`
- Check response: `✅ Review saved successfully`
- Nếu không có logs này → Review KHÔNG được lưu vào DB

### Khả năng 2: Review bị tạo với status = "draft"
- Trong create page, check xem `reviewStatus` state = "published" hay "draft"
- Nếu = "draft" và API `/api/reviews` KHÔNG fetch draft → Không hiển thị

### Khả năng 3: Review bị tạo với WRONG user_id
- Nếu lúc tạo review, session có user_id khác
- Review được lưu với user_id khác → Query không thấy

### Khả năng 4: Pagination issue
- User có > 6 reviews → Review mới ở page khác
- Check total count: Nếu = 63 nhưng chỉ show 62 → Có 1 review bị mất

---

Hãy chạy các bước check trên và cho tôi biết kết quả!
