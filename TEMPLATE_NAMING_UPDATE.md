# Template Naming Update

## Vấn Đề

Hai templates có tên gây nhầm lẫn:
- ❌ "Facebook Product Review Optimized"
- ❌ "Tutorial/How-to với Product Placement"

Cả hai đều liên quan đến sản phẩm nhưng có **mục đích và cấu trúc hoàn toàn khác nhau**.

## Giải Pháp

### Tên Mới (Đã Update)

| Category | Tên Cũ | Tên Mới | Emoji |
|----------|---------|---------|-------|
| product-review | Facebook Product Review Optimized | **📦 Review Sản Phẩm** | 📦 |
| tutorial | Tutorial/How-to với Product Placement | **📚 Tutorial + Giới Thiệu Sản Phẩm** | 📚 |
| comparison | So Sánh Sản Phẩm (Comparison) | **⚖️ So Sánh Sản Phẩm** | ⚖️ |
| unboxing | Unboxing - Mở Hộp Trải Nghiệm | **📦 Unboxing - Mở Hộp Trải Nghiệm** | 📦 |
| cooking-tutorial | Hướng Dẫn Nấu Ăn (Cooking Tutorial) | **🍳 Hướng Dẫn Nấu Ăn** | 🍳 |
| tech-tutorial | Hướng Dẫn Công Nghệ (Tech Tutorial) | **💻 Hướng Dẫn Công Nghệ** | 💻 |
| beauty-tutorial | Hướng Dẫn Làm Đẹp (Beauty Tutorial) | **💄 Hướng Dẫn Làm Đẹp** | 💄 |

## Lợi Ích

### 1. Phân Biệt Rõ Ràng ✅

**📦 Review Sản Phẩm**
- Focus: Đánh giá chi tiết sản phẩm
- Structure: Pros/Cons/Summary
- Use case: Video unboxing, review trực tiếp
- Example: "Review AirPods Pro", "Đánh giá iPhone 15"

**📚 Tutorial + Giới Thiệu Sản Phẩm**
- Focus: Hướng dẫn làm gì đó + lồng ghép sản phẩm
- Structure: Steps/Materials/Tips
- Use case: Tutorial cooking, makeup, DIY
- Example: "Cách làm bánh (dùng lò nướng X)", "Tutorial makeup (dùng son Y)"

### 2. Visual Recognition 👁️

Emoji giúp nhận diện nhanh trong dropdown:
- 📦 = Review sản phẩm
- 📚 = Tutorial/Hướng dẫn
- ⚖️ = So sánh
- 🍳 = Nấu ăn
- 💻 = Công nghệ
- 💄 = Làm đẹp

### 3. User Experience 🎯

**Trước (Confusing):**
```
Template *
┌─────────────────────────────────────────┐
│ Facebook Product Review Optimized      │ ← Dài, khó hiểu
│ product-review                          │
└─────────────────────────────────────────┘
```

**Sau (Clear):**
```
Template *
┌─────────────────────────────────────────┐
│ 📦 Review Sản Phẩm                      │ ← Ngắn gọn, rõ ràng
│ product-review                          │
└─────────────────────────────────────────┘
```

## Cách Chạy Update

### Bước 1: Backup (Optional)
```sql
-- Backup current template names
CREATE TABLE templates_backup_names AS
SELECT id, name, category FROM templates WHERE is_system = true;
```

### Bước 2: Run Update
```bash
# Chạy trong Supabase SQL Editor
psql $NEXT_PUBLIC_SUPABASE_URL -f sql/update-template-names.sql
```

Hoặc copy nội dung file `sql/update-template-names.sql` vào Supabase SQL Editor và Execute.

### Bước 3: Verify
```sql
SELECT
  id,
  name,
  category,
  platform,
  is_system,
  is_active
FROM templates
WHERE is_system = true
ORDER BY category;
```

Expected output:
```
beauty-tutorial    | 💄 Hướng Dẫn Làm Đẹp
comparison         | ⚖️ So Sánh Sản Phẩm
cooking-tutorial   | 🍳 Hướng Dẫn Nấu Ăn
product-review     | 📦 Review Sản Phẩm
tech-tutorial      | 💻 Hướng Dẫn Công Nghệ
tutorial           | 📚 Tutorial + Giới Thiệu Sản Phẩm
unboxing           | 📦 Unboxing - Mở Hộp Trải Nghiệm
```

## Impact Analysis

### Frontend Changes
✅ **Không cần thay đổi code** - UI tự động hiển thị tên mới từ database

### Files Affected
- ✅ Database: `templates` table (name column only)
- ✅ UI: Template dropdown tự động update
- ❌ Code: Không có hardcoded template names

### Rollback Plan
```sql
-- Nếu cần rollback
UPDATE templates SET name = 'Facebook Product Review Optimized'
WHERE category = 'product-review' AND is_system = true;

UPDATE templates SET name = 'Tutorial/How-to với Product Placement'
WHERE category = 'tutorial' AND is_system = true;
```

## Template Comparison Table

| Feature | 📦 Review Sản Phẩm | 📚 Tutorial + Giới Thiệu SP |
|---------|-------------------|---------------------------|
| **Primary Goal** | Đánh giá sản phẩm | Hướng dẫn + giới thiệu SP |
| **Output Format** | Review structure | Tutorial structure → Review |
| **Pros/Cons** | ✅ Chi tiết | ❌ Không phù hợp |
| **Steps** | ❌ Không có | ✅ Có từng bước |
| **Materials** | ❌ Không có | ✅ Danh sách vật liệu |
| **Transform** | Direct use | Transform required |
| **Best For** | Unboxing, Review video | Cooking, Makeup, DIY video |

## UI Preview

### Dropdown Display
```
Template *
┌─────────────────────────────────────────┐
│ 📦 Review Sản Phẩm             ▼       │
└─────────────────────────────────────────┘
  ↓ (khi click)
┌─────────────────────────────────────────┐
│ 📦 Review Sản Phẩm                      │ ← Rõ ràng
│ product-review                          │
├─────────────────────────────────────────┤
│ 📚 Tutorial + Giới Thiệu Sản Phẩm      │ ← Phân biệt dễ
│ tutorial                                │
├─────────────────────────────────────────┤
│ ⚖️ So Sánh Sản Phẩm                    │
│ comparison                              │
├─────────────────────────────────────────┤
│ 📦 Unboxing - Mở Hộp Trải Nghiệm       │
│ unboxing                                │
├─────────────────────────────────────────┤
│ 🍳 Hướng Dẫn Nấu Ăn                     │
│ cooking-tutorial                        │
├─────────────────────────────────────────┤
│ 💻 Hướng Dẫn Công Nghệ                  │
│ tech-tutorial                           │
├─────────────────────────────────────────┤
│ 💄 Hướng Dẫn Làm Đẹp                    │
│ beauty-tutorial                         │
└─────────────────────────────────────────┘
```

## Testing Checklist

Sau khi chạy update, test các scenarios sau:

- [ ] Load trang "Tạo Review Từ Template"
- [ ] Verify template dropdown hiển thị tên mới với emoji
- [ ] Chọn "📦 Review Sản Phẩm" → Generate content
- [ ] Chọn "📚 Tutorial + Giới Thiệu Sản Phẩm" → Generate content
- [ ] Verify cả 2 templates đều generate content thành công
- [ ] Check logs để verify template type detection
- [ ] Verify saved reviews có đúng structure

## Summary

✅ **Updated 7 system templates** với tên rõ ràng hơn
✅ **Added emojis** để visual recognition
✅ **Zero code changes** required - chỉ update database
✅ **Backward compatible** - không ảnh hưởng existing data
✅ **Better UX** - user dễ phân biệt template types

**File to run**: `sql/update-template-names.sql`
