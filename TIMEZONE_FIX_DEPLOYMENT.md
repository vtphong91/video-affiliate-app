# 🕐 Timezone Fix Deployment Guide

## 📋 Problem Summary

**Issue:** Schedules không trigger đúng thời gian do timezone handling không nhất quán.

**Root Causes:**
1. Database column `scheduled_for` có thể là TEXT hoặc TIMESTAMP (không rõ timezone)
2. `createTimestampFromDatePicker()` trả về format không có timezone info
3. `getPendingSchedules()` có logic parsing phức tạp và sai
4. So sánh thời gian không nhất quán giữa UTC và GMT+7

## ✅ Solution Implemented

### **Chuẩn hóa Timezone Handling:**
- **Storage:** Luôn lưu UTC ISO string (`2025-10-15T07:30:00.000Z`) vào database
- **Database Column:** `scheduled_for` và `posted_at` là `TIMESTAMPTZ` (timestamp with timezone)
- **Display:** Convert UTC → GMT+7 khi hiển thị cho user
- **Comparison:** So sánh trực tiếp UTC timestamps trong SQL query

### **Files Changed:**

1. **[lib/utils/timezone-utils.ts](lib/utils/timezone-utils.ts)**
   - Fixed `createTimestampFromDatePicker()` to return UTC ISO string
   - Properly converts GMT+7 user input → UTC for storage

2. **[lib/db/supabase.ts](lib/db/supabase.ts)**
   - Simplified `getPendingSchedules()` to use direct SQL comparison
   - Query: `WHERE status = 'pending' AND scheduled_for <= NOW()`
   - PostgreSQL handles timezone comparison automatically

3. **[sql/migrate-scheduled-for-to-timestamptz.sql](sql/migrate-scheduled-for-to-timestamptz.sql)**
   - Migration script để convert column type to TIMESTAMPTZ
   - Backup existing data before migration

## 🚀 Deployment Steps

### **Step 1: Run Database Migration**

1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste content from `sql/migrate-scheduled-for-to-timestamptz.sql`
4. Run the entire script

**Expected Output:**
```
✅ Backup created: schedules_backup_20251015
✅ Column types converted to TIMESTAMPTZ
✅ Verification queries show correct data
```

### **Step 2: Deploy Code Changes**

#### Option A: Vercel (Recommended)
```bash
# 1. Commit changes
git add .
git commit -m "fix: Fix timezone handling for schedule triggering

- Store UTC ISO strings in database (TIMESTAMPTZ)
- Simplify getPendingSchedules() query
- Use PostgreSQL native timezone comparison
- Display in GMT+7 for users

Fixes #ISSUE_NUMBER"

# 2. Push to GitHub (auto-deploy to Vercel)
git push origin main
```

#### Option B: Manual Deploy
```bash
# 1. Build locally
npm run build

# 2. Deploy via Vercel CLI
vercel --prod
```

### **Step 3: Verify Deployment**

1. **Test Schedule Creation**
   ```bash
   # Create a schedule for 5 minutes from now in GMT+7
   # UI should show: 07:47 (GMT+7)
   # DB should store: 2025-10-15T00:47:00.000Z (UTC)
   ```

2. **Test Pending Schedules Query**
   ```bash
   curl -X GET \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/debug-schedules
   ```

   **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Debug information retrieved",
     "currentTime": {
       "serverUTC": "2025-10-15T00:42:20.194Z",
       "gmt7": "2025-10-15 07:42:20"
     },
     "pendingSchedules": [...],
     "dueSchedules": [...]
   }
   ```

3. **Test Cron Trigger**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/manual-cron
   ```

   **Expected Response:**
   ```json
   {
     "message": "Schedules processed successfully",
     "processed": 1,
     "success": 1,
     "failed": 0
   }
   ```

### **Step 4: Monitor Logs**

#### Vercel Logs
```bash
vercel logs --follow
```

Look for:
- `🔍 Current UTC time: ...`
- `📋 Found X pending schedules that are due`
- `✓ Schedule XXXXXXXX: scheduled_for=...`

#### Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Filter by table: `schedules`
3. Check `scheduled_for` values are in ISO format

## 🧪 Testing Checklist

- [ ] Database migration completed successfully
- [ ] Code deployed to production
- [ ] Create test schedule for 2 minutes from now
- [ ] Wait 2 minutes and check if cron processes it
- [ ] Verify schedule status changed from `pending` → `posted`
- [ ] Check webhook was sent to Make.com
- [ ] Verify UI displays time in GMT+7
- [ ] Check logs for no timezone-related errors

## 🔍 Debugging

### If schedules still not triggering:

1. **Check Database Column Type**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'schedules'
     AND column_name = 'scheduled_for';
   ```
   Should return: `timestamptz`

2. **Check Stored Values**
   ```sql
   SELECT
     id,
     scheduled_for,
     scheduled_for AT TIME ZONE 'UTC' AS scheduled_utc,
     scheduled_for AT TIME ZONE 'Asia/Ho_Chi_Minh' AS scheduled_gmt7,
     status
   FROM schedules
   WHERE status = 'pending'
   ORDER BY scheduled_for ASC
   LIMIT 5;
   ```

3. **Test Query Manually**
   ```sql
   SELECT *
   FROM schedules
   WHERE status = 'pending'
     AND scheduled_for <= NOW()
   ORDER BY scheduled_for ASC;
   ```

4. **Check Cron Job is Running**
   - Verify GitHub Actions workflow is active
   - Check last run time in Actions tab
   - Ensure `CRON_SECRET` and `VERCEL_APP_URL` secrets are set

### If UI displays wrong time:

1. **Check Browser Timezone**
   ```javascript
   console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
   // Should be: Asia/Ho_Chi_Minh or system timezone
   ```

2. **Check formatTimestampForDisplay()**
   ```javascript
   import { formatTimestampForDisplay } from '@/lib/utils/timezone-utils';
   console.log(formatTimestampForDisplay('2025-10-15T07:30:00.000Z'));
   // Should show: 15/10/2025 14:30 (GMT+7)
   ```

## 📊 Expected Behavior After Fix

### Schedule Creation Flow:
```
User Input (GMT+7): 15/10/2025 14:30
                    ↓
createTimestampFromDatePicker()
                    ↓
UTC Conversion: 2025-10-15T07:30:00.000Z
                    ↓
Database Storage (TIMESTAMPTZ): 2025-10-15 07:30:00+00
```

### Schedule Retrieval Flow:
```
Database Query: SELECT * WHERE scheduled_for <= NOW()
                    ↓
PostgreSQL compares: 2025-10-15 07:30:00+00 <= 2025-10-15 07:42:20+00
                    ↓
If TRUE → Include in pending schedules
                    ↓
Display to User: formatTimestampForDisplay() → 15/10/2025 14:30
```

## 🎯 Success Metrics

- ✅ Schedules trigger within 5 minutes of scheduled time
- ✅ No timezone-related errors in logs
- ✅ UI consistently displays GMT+7 time
- ✅ Database stores UTC timestamps
- ✅ Cron job processes schedules correctly

## 📝 Rollback Plan

If issues occur:

1. **Rollback Database**
   ```sql
   DROP TABLE IF EXISTS schedules;
   CREATE TABLE schedules AS SELECT * FROM schedules_backup_20251015;
   ```

2. **Rollback Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Restore Previous Behavior**
   - Previous version may have issues but at least it's known state
   - Investigate root cause before re-deploying fix

## 🔗 Related Files

- [lib/utils/timezone-utils.ts](lib/utils/timezone-utils.ts) - Timezone conversion utilities
- [lib/db/supabase.ts](lib/db/supabase.ts) - Database queries
- [lib/services/cron-service.ts](lib/services/cron-service.ts) - Cron job processing
- [sql/migrate-scheduled-for-to-timestamptz.sql](sql/migrate-scheduled-for-to-timestamptz.sql) - Database migration
- [test-timezone-fix.js](test-timezone-fix.js) - Test script

## ❓ Support

If you encounter issues:
1. Check logs in Vercel and Supabase
2. Run debug endpoint: `/api/cron/debug-schedules`
3. Review this deployment guide
4. Check GitHub Issues for similar problems

---

**Last Updated:** 2025-10-15
**Version:** 1.0.0
