# Content Cleaning Guide

## Vấn đề đã fix

Nội dung review hiển thị với emoji và markdown syntax như:
- `🔥 **HOOK**` thay vì `HOOK`
- `• Điểm nổi bật` thay vì `- Điểm nổi bật`
- `**bold text**` thay vì `bold text`

## Giải pháp đã triển khai

### 1. Content Cleaner Utility (✅ Đã hoàn thành)

**File**: `lib/utils/content-cleaner.ts`

Tạo các hàm để:
- Loại bỏ emojis: `removeEmojis()`
- Loại bỏ markdown bold: `removeMarkdownBold()`
- Loại bỏ markdown italic: `removeMarkdownItalic()`
- Loại bỏ markdown headers: `removeMarkdownHeaders()`
- Thay thế bullet points: `replaceBulletPoints()`
- Clean toàn bộ: `cleanContent()` và `cleanContentPreserveStructure()`

### 2. Auto-Clean khi tạo review (✅ Đã hoàn thành)

**File**: `app/api/reviews/create-with-template/route.ts`

Đã cập nhật để tự động clean nội dung sau khi AI tạo ra:

```typescript
// Generate content
const rawGeneratedContent = await generateReviewWithTemplate(...);

// Clean content automatically
const generatedContent = cleanContentPreserveStructure(rawGeneratedContent);
```

**Kết quả**: Mọi review mới được tạo sẽ tự động loại bỏ emoji và markdown.

### 3. Clean templates trong database (⚠️ Cần chạy thủ công)

**File**: `sql/migrations/clean-template-formatting.sql`

SQL script để clean tất cả system templates hiện có trong database.

## Hướng dẫn chạy SQL migration

### Cách 1: Supabase Dashboard (Khuyến nghị)

1. Mở Supabase Dashboard: https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (sidebar bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file `sql/migrations/clean-template-formatting.sql`
6. Paste vào editor
7. Click **Run** (hoặc Ctrl+Enter)

### Cách 2: Supabase CLI

```bash
# Nếu bạn có Supabase CLI installed
supabase db execute --file sql/migrations/clean-template-formatting.sql
```

### Kết quả mong đợi

Sau khi chạy script, bạn sẽ thấy bảng với các templates đã được cleaned:

| name                  | template_length | template_preview                                    |
|-----------------------|-----------------|-----------------------------------------------------|
| Short Form Review     | 1234            | HOOK - Câu mở đầu hấp dẫn TOP ĐIỂM NỔI BẬT: -... |
| Long Form Review      | 2345            | GIỚI THIỆU Chào mày bà mấy ông nghiện "sống ảo"... |
| Comparison Review     | 1890            | HOOK - Câu mở đầu so sánh BẢNG SO SÁNH: -...      |

**Điều cần kiểm tra**:
- ✅ Không còn emoji (🔥, 📱, ✨, ✅, ⚠️, v.v.)
- ✅ Không còn `**bold**` syntax
- ✅ Bullet `•` đã được thay bằng `-`
- ✅ Headings vẫn còn nhưng không có emoji phía trước

## Test kết quả

### Test 1: Tạo review mới

1. Vào http://localhost:3003/dashboard/create
2. Phân tích một video bất kỳ
3. Chọn Template mode
4. Chọn một trong 6 templates
5. Generate review
6. Kiểm tra nội dung trong editor

**Kết quả mong đợi**:
- Nội dung KHÔNG có emoji
- Nội dung KHÔNG có markdown syntax `**`
- Lists sử dụng dấu `-` thay vì `•`
- Headings là plain text UPPERCASE

### Test 2: Edit review cũ

1. Vào http://localhost:3003/dashboard/reviews
2. Chọn một review đã tạo trước khi fix
3. Click Edit
4. Nội dung cũ vẫn có thể có emoji/markdown (vì đã lưu từ trước)

**Cách fix review cũ**:
- Option 1: Tạo lại review mới
- Option 2: Thủ công xóa emoji và markdown trong editor
- Option 3: Chạy migration script để clean tất cả reviews cũ (nếu cần)

## SQL migration script để clean reviews cũ (Optional)

Nếu muốn clean tất cả reviews cũ đã tạo trước khi fix:

```sql
-- WARNING: This will modify existing reviews' custom_content
-- Backup database first!

-- Update all existing reviews to clean content
UPDATE reviews
SET custom_content =
  -- Remove emojis
  regexp_replace(
    -- Remove markdown bold
    regexp_replace(
      -- Replace bullets
      replace(custom_content, '•', '-'),
      E'\\*\\*([^*]+)\\*\\*',
      E'\\1',
      'g'
    ),
    E'[🔥📱✨✅⚠️💰🎯🛒💬👇📌😱😍🤩💯🔥⚡💪👍❤️🎉💝✨🌟💫⭐]',
    '',
    'g'
  )
WHERE custom_content IS NOT NULL
  AND custom_content != '';

-- Show updated count
SELECT
  COUNT(*) as updated_reviews,
  COUNT(CASE WHEN custom_content ~ E'[🔥📱✨]' THEN 1 END) as still_has_emojis
FROM reviews
WHERE custom_content IS NOT NULL;
```

**⚠️ LƯU Ý**: Chỉ chạy script này nếu bạn chắc chắn muốn thay đổi tất cả reviews cũ. Nên backup database trước.

## Commit changes

Sau khi test thành công locally:

```bash
# Stage changes
git add lib/utils/content-cleaner.ts
git add app/api/reviews/create-with-template/route.ts
git add sql/migrations/clean-template-formatting.sql
git add CONTENT_CLEANING_GUIDE.md

# Commit
git commit -m "fix: Remove emojis and markdown from AI-generated content

- Create content-cleaner utility with comprehensive emoji/markdown removal
- Auto-clean content in create-with-template API after AI generation
- Add SQL migration to clean existing prompt templates
- Add detailed guide for running migrations

Fixes issue where generated reviews showed raw markdown (**bold**, •, emojis)
Content now displays as clean plain text with proper formatting"

# Push
git push origin master
```

## Tóm tắt

1. ✅ **Code fix**: Đã hoàn thành - tự động clean nội dung mới
2. ⚠️ **Template migration**: Cần chạy SQL script trong Supabase Dashboard
3. ⚠️ **Reviews cũ**: (Optional) Chạy migration nếu muốn clean reviews đã tạo
4. 🧪 **Test**: Tạo review mới để verify fix hoạt động

## Support

Nếu gặp vấn đề:
1. Check console logs khi tạo review (xem "🧹 Cleaning generated content...")
2. Verify SQL script chạy thành công (check output trong Supabase)
3. Clear cache và hard refresh browser
4. Kiểm tra lại code đã build thành công: `npm run build`
