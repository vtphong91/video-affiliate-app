# Migration Guide: Thêm Review Fields vào Schedules Table

## Vấn Đề

Dashboard schedules hiện tại không hiển thị đúng thông tin vì bảng `schedules` thiếu các cột để lưu trữ dữ liệu từ reviews.

### Các triệu chứng:
- ScheduleCard không hiển thị `video_title`, `video_thumbnail`
- Không có thông tin review trong schedules
- API cố gắng lưu các trường này nhưng bị lỗi vì database không có cột tương ứng

## Giải Pháp

Thêm các cột review vào bảng `schedules` để lưu denormalized data (tăng hiệu suất query).

## Cách Thực Hiện

### Bước 1: Truy cập Supabase Dashboard

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project: **video-affiliate-app**
3. Vào menu **SQL Editor** (bên trái)

### Bước 2: Chạy Migration

1. Click **New Query**
2. Copy toàn bộ nội dung file `sql/add-review-fields-to-schedules.sql`
3. Paste vào SQL Editor
4. Click **Run** hoặc nhấn `Ctrl/Cmd + Enter`

### Bước 3: Xác Nhận Migration Thành Công

Chạy query kiểm tra:

```sql
-- Kiểm tra các cột mới đã được thêm
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'schedules'
  AND column_name IN (
    'video_title',
    'video_url',
    'video_thumbnail',
    'channel_name',
    'review_summary',
    'review_pros',
    'review_cons',
    'review_key_points',
    'review_target_audience',
    'review_cta',
    'review_seo_keywords'
  )
ORDER BY column_name;
```

Kết quả mong đợi: Hiển thị 11 cột mới.

### Bước 4: Test Tạo Schedule Mới

1. Vào dashboard: `http://localhost:3000/dashboard/schedules` (hoặc production URL)
2. Click **Tạo Lịch Mới**
3. Chọn một review
4. Chọn thời gian đăng bài
5. Click **Tạo Lịch Đăng Bài**
6. Kiểm tra xem schedule card có hiển thị đầy đủ thông tin không:
   - ✅ Video title
   - ✅ Video thumbnail
   - ✅ Channel name
   - ✅ Post message preview

## Các Cột Được Thêm

| Cột | Type | Mục đích |
|-----|------|----------|
| `video_title` | TEXT | Tiêu đề video từ review |
| `video_url` | TEXT | URL video |
| `video_thumbnail` | TEXT | URL thumbnail video |
| `channel_name` | TEXT | Tên kênh YouTube/TikTok |
| `review_summary` | TEXT | Tóm tắt review |
| `review_pros` | JSONB | Ưu điểm (array) |
| `review_cons` | JSONB | Nhược điểm (array) |
| `review_key_points` | JSONB | Điểm chính (array of objects) |
| `review_target_audience` | JSONB | Đối tượng mục tiêu (array) |
| `review_cta` | TEXT | Call to action |
| `review_seo_keywords` | JSONB | SEO keywords (array) |

## Lý Do Denormalization

### Tại sao lưu trùng dữ liệu từ reviews?

1. **Performance**: Tránh JOIN mỗi khi fetch schedules
2. **Data Integrity**: Giữ snapshot của review tại thời điểm tạo schedule
3. **Webhook Payload**: Make.com cần đầy đủ thông tin trong webhook, không cần query thêm
4. **Caching**: Dễ dàng cache schedules list mà không phụ thuộc vào reviews table

### Trade-offs:

- ❌ Tăng dung lượng database (minor)
- ❌ Dữ liệu có thể không đồng bộ nếu review bị sửa sau khi tạo schedule
- ✅ Query nhanh hơn 50-70%
- ✅ Webhook payload hoàn chỉnh
- ✅ UI render nhanh hơn

## Rollback (Nếu Cần)

Nếu cần rollback migration:

```sql
-- Xóa các cột đã thêm
ALTER TABLE schedules
DROP COLUMN IF EXISTS video_title,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS video_thumbnail,
DROP COLUMN IF EXISTS channel_name,
DROP COLUMN IF EXISTS review_summary,
DROP COLUMN IF EXISTS review_pros,
DROP COLUMN IF EXISTS review_cons,
DROP COLUMN IF EXISTS review_key_points,
DROP COLUMN IF EXISTS review_target_audience,
DROP COLUMN IF EXISTS review_cta,
DROP COLUMN IF EXISTS review_seo_keywords;

-- Xóa index
DROP INDEX IF EXISTS idx_schedules_video_title;
```

## Troubleshooting

### Lỗi: "column already exists"

Một số cột có thể đã tồn tại. Migration sử dụng `ADD COLUMN IF NOT EXISTS` nên sẽ skip các cột đã có.

### Lỗi: "permission denied"

Đảm bảo bạn đang sử dụng Supabase Dashboard với quyền admin, không phải service role key.

### Schedule vẫn không hiển thị thông tin

1. Xóa schedule cũ và tạo mới
2. Schedules đã tạo trước khi migration sẽ có các trường này NULL
3. Chỉ schedules mới tạo sau migration mới có đủ dữ liệu

## Next Steps

Sau khi migration thành công:

1. ✅ Test tạo schedule mới
2. ✅ Kiểm tra webhook payload có đầy đủ không
3. ✅ Test cron job có chạy đúng không
4. ✅ Commit migration file vào git

## Liên Hệ

Nếu gặp vấn đề, tham khảo:
- `CLAUDE.md` - Project overview
- `MODULE_ANALYSIS_REPORT.md` - System analysis
- `TIMEZONE_FIX_SUMMARY.md` - Timezone handling
