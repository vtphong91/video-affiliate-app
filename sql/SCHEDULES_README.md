# Schedules Migration Package

## 📦 Package Contents

Files cho việc fix dashboard schedules (2025-11-08):

```
sql/
├── add-review-fields-to-schedules.sql     # Migration script
├── verify-schedules-migration.sql         # Verification script
├── rollback-schedules-migration.sql       # Rollback script
├── MIGRATION_GUIDE_SCHEDULES.md          # Detailed guide
└── SCHEDULES_README.md                    # This file
```

## 🎯 Purpose

Fix dashboard schedules không hiển thị đúng thông tin về video và review.

## ⚡ Quick Start

### Step 1: Chạy Migration

```bash
# 1. Mở Supabase Dashboard
https://app.supabase.com → video-affiliate-app → SQL Editor

# 2. New Query → Copy nội dung từ:
sql/add-review-fields-to-schedules.sql

# 3. Run (Ctrl/Cmd + Enter)
```

### Step 2: Verify

```bash
# Chạy verification script:
sql/verify-schedules-migration.sql

# Expected: All checks ✅
```

### Step 3: Test

```bash
# 1. Vào dashboard
/dashboard/schedules

# 2. Tạo schedule mới

# 3. Verify hiển thị:
✅ Video title
✅ Video thumbnail
✅ Channel name
✅ Post message
```

## 📚 Documentation

- **Chi tiết:** [MIGRATION_GUIDE_SCHEDULES.md](./MIGRATION_GUIDE_SCHEDULES.md)
- **Tổng kết:** [../SCHEDULES_MIGRATION_SUMMARY.md](../SCHEDULES_MIGRATION_SUMMARY.md)

## 🔄 Rollback

Nếu cần rollback:

```bash
sql/rollback-schedules-migration.sql
```

⚠️ **Warning:** Rollback sẽ xóa dữ liệu trong các cột review.

## 📊 What Gets Added

11 cột mới:

- `video_title` (TEXT)
- `video_url` (TEXT)
- `video_thumbnail` (TEXT)
- `channel_name` (TEXT)
- `review_summary` (TEXT)
- `review_pros` (JSONB)
- `review_cons` (JSONB)
- `review_key_points` (JSONB)
- `review_target_audience` (JSONB)
- `review_cta` (TEXT)
- `review_seo_keywords` (JSONB)

Plus: Index `idx_schedules_video_title`

## ✅ Success Criteria

Migration thành công khi:

- [ ] Tất cả 11 cột được thêm
- [ ] Index được tạo
- [ ] Verification script pass
- [ ] Schedule mới hiển thị đầy đủ info
- [ ] Không có errors trong logs

## 🆘 Need Help?

Check:
1. `MIGRATION_GUIDE_SCHEDULES.md` - Step-by-step guide
2. `../SCHEDULES_MIGRATION_SUMMARY.md` - Full analysis
3. `../CLAUDE.md` - Project overview

---

**Created:** 2025-11-08
**Status:** Ready for execution
