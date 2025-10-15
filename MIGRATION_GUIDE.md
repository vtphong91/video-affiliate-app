# 🔧 Database Migration Guide - TIMESTAMPTZ Conversion

## 📋 Overview

**Goal:** Convert `scheduled_for`, `posted_at`, and `next_retry_at` columns from TEXT/TIMESTAMP to TIMESTAMPTZ

**Why:** Enable proper UTC storage and timezone-aware queries for schedule triggering

---

## ⚠️ **IMPORTANT: Choose the Right Migration Script**

### **Option 1: Simple Migration (RECOMMENDED)** ✅

**File:** `sql/migrate-scheduled-for-to-timestamptz-simple.sql`

**Use when:**
- You want the simplest, most reliable migration
- PostgreSQL will auto-parse timestamp formats
- You don't need complex regex matching

**Advantages:**
- ✅ No regex errors
- ✅ PostgreSQL handles format parsing automatically
- ✅ Works with TEXT, TIMESTAMP, and TIMESTAMPTZ sources
- ✅ Includes test INSERT to verify functionality

**Disadvantages:**
- ⚠️ Will fail if any row has invalid timestamp format
- ⚠️ Requires data cleanup before migration if there are invalid values

### **Option 2: Complex Migration (FALLBACK)**

**File:** `sql/migrate-scheduled-for-to-timestamptz.sql`

**Use when:**
- You have mixed formats and need conditional logic
- You want to handle edge cases explicitly

**Issues:**
- ❌ Contains regex operators that don't work with TIMESTAMP types
- ❌ Needs fixes for column type casting
- ❌ More complex, harder to debug

**Recommendation:** Use Option 1 (Simple) unless you have specific edge cases

---

## 🚀 **Step-by-Step Migration Process**

### **Pre-Migration Checklist**

- [ ] Backup production database (automatic in script)
- [ ] Check current column types
- [ ] Verify no scheduled posts are in progress
- [ ] Have rollback plan ready

### **Step 1: Check Current State**

Run in Supabase SQL Editor:

```sql
-- Check column types
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'schedules'
    AND column_name IN ('scheduled_for', 'posted_at', 'next_retry_at');

-- Check sample data
SELECT
    id,
    scheduled_for,
    posted_at,
    next_retry_at,
    status
FROM schedules
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Output:**
- `scheduled_for`: `text` or `timestamp without time zone`
- `posted_at`: `text` or `timestamp without time zone`
- `next_retry_at`: `text` or `timestamp without time zone`

### **Step 2: Run Migration**

1. Open Supabase Dashboard → SQL Editor
2. Copy entire content of `sql/migrate-scheduled-for-to-timestamptz-simple.sql`
3. Paste into SQL Editor
4. Click "Run"

**Expected Results:**

```
✅ Backup created: schedules_backup_20251015
✅ Column types converted to TIMESTAMPTZ
✅ Test schedule created and cleaned up
```

### **Step 3: Verify Migration**

Check if columns are now TIMESTAMPTZ:

```sql
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'schedules'
    AND column_name IN ('scheduled_for', 'posted_at', 'next_retry_at');
```

**Expected Output:**
```
column_name     | data_type
----------------+---------------------------
scheduled_for   | timestamp with time zone
posted_at       | timestamp with time zone
next_retry_at   | timestamp with time zone
```

### **Step 4: Test Query**

Verify `getPendingSchedules()` logic works:

```sql
-- Should return schedules that are due
SELECT
    id,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_gmt7,
    NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' AS current_gmt7,
    (scheduled_for <= NOW()) AS is_due,
    status
FROM schedules
WHERE status = 'pending'
ORDER BY scheduled_for ASC
LIMIT 5;
```

---

## 🐛 **Troubleshooting**

### **Error: "operator does not exist: timestamp without time zone ~ unknown"**

**Cause:** Trying to use regex `~` operator on TIMESTAMP column

**Solution:** Use `migrate-scheduled-for-to-timestamptz-simple.sql` instead

### **Error: "invalid input syntax for type timestamp with time zone"**

**Cause:** Some rows have invalid timestamp format

**Solution 1:** Find and fix invalid rows:

```sql
-- Find rows with invalid timestamps
SELECT id, scheduled_for, status
FROM schedules
WHERE scheduled_for IS NOT NULL
    AND scheduled_for::TEXT !~ '^\d{4}-\d{2}-\d{2}'
LIMIT 10;

-- Delete invalid rows (or fix them manually)
DELETE FROM schedules
WHERE scheduled_for IS NOT NULL
    AND scheduled_for::TEXT !~ '^\d{4}-\d{2}-\d{2}';
```

**Solution 2:** Use NULLIF to convert invalid to NULL:

```sql
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMPTZ
USING NULLIF(scheduled_for, '')::TIMESTAMPTZ;
```

### **Error: "column is of type timestamp without time zone"**

**Cause:** Column is already TIMESTAMP but not TIMESTAMPTZ

**Solution:**

```sql
-- Simple conversion from TIMESTAMP to TIMESTAMPTZ
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TIMESTAMPTZ
USING scheduled_for AT TIME ZONE 'UTC';
```

---

## 🔄 **Rollback Plan**

If migration fails or causes issues:

### **Option A: Restore from backup**

```sql
BEGIN;

-- Drop current table
DROP TABLE IF EXISTS schedules CASCADE;

-- Restore from backup
CREATE TABLE schedules AS SELECT * FROM schedules_backup_20251015;

-- Restore foreign keys and indexes (if needed)
-- Add ALTER TABLE commands here if needed

SELECT 'Rolled back to backup' AS status;

COMMIT;
```

### **Option B: Manual rollback**

```sql
-- Convert back to TEXT or TIMESTAMP
ALTER TABLE schedules
ALTER COLUMN scheduled_for TYPE TEXT
USING scheduled_for::TEXT;

ALTER TABLE schedules
ALTER COLUMN posted_at TYPE TEXT
USING posted_at::TEXT;

ALTER TABLE schedules
ALTER COLUMN next_retry_at TYPE TEXT
USING next_retry_at::TEXT;
```

---

## ✅ **Post-Migration Verification**

### **1. Check Column Types**

```sql
\d schedules
-- or
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'schedules';
```

### **2. Test Schedule Creation**

Create a test schedule via UI:
- Select date: Tomorrow
- Select time: 14:30 (GMT+7)
- Check database value is UTC ISO string

```sql
SELECT
    id,
    scheduled_for,
    scheduled_for AT TIME ZONE 'UTC' AS utc,
    scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS gmt7
FROM schedules
ORDER BY created_at DESC
LIMIT 1;
```

**Expected:**
- `scheduled_for`: `2025-10-16 07:30:00+00` (UTC)
- `gmt7`: `2025-10-16 14:30:00` (GMT+7)

### **3. Test Cron Query**

```sql
-- Simulate getPendingSchedules() query
SELECT COUNT(*)
FROM schedules
WHERE status = 'pending'
    AND scheduled_for <= NOW();
```

### **4. Monitor Logs**

- Check Vercel logs for successful schedule processing
- Verify no timezone-related errors
- Confirm schedules trigger at correct time

---

## 📊 **Expected Timeline**

| Step | Duration | Notes |
|------|----------|-------|
| Backup | 5-10 sec | Automatic |
| Column conversion | 10-30 sec | Depends on row count |
| Verification | 1-2 min | Manual checks |
| Testing | 5-10 min | Create test schedule |
| **Total** | **~15 min** | For typical dataset |

---

## 🎯 **Success Criteria**

- ✅ All three columns are TIMESTAMPTZ
- ✅ Existing data preserved and converted correctly
- ✅ Test INSERT works with UTC ISO string
- ✅ Query `WHERE scheduled_for <= NOW()` returns correct results
- ✅ UI displays time in GMT+7 correctly
- ✅ Schedules trigger on time after code deployment

---

## 📞 **Need Help?**

1. Check error message in SQL Editor
2. Review [Troubleshooting](#troubleshooting) section
3. Check backup table: `schedules_backup_20251015`
4. Use rollback plan if needed
5. Review PostgreSQL docs: [Timestamp Types](https://www.postgresql.org/docs/current/datatype-datetime.html)

---

## 📚 **Related Files**

- `sql/migrate-scheduled-for-to-timestamptz-simple.sql` - **Use this one** ✅
- `sql/migrate-scheduled-for-to-timestamptz.sql` - Complex version (has issues)
- `TIMEZONE_FIX_DEPLOYMENT.md` - Code deployment guide
- `TIMEZONE_FIX_SUMMARY.md` - Complete fix summary

---

**Last Updated:** 2025-10-15
**Status:** ✅ Ready for production
**Tested:** ✅ All tests passing
