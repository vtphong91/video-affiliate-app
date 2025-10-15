# Schedule Cleanup Scripts

## Purpose
These scripts safely clean up old schedules that were created before the timezone fix (2025-10-15) and may be showing as overdue.

## ⚠️ IMPORTANT: RUN IN ORDER

**DO NOT skip steps!** Each step depends on the previous one.

---

## Step 1: Check Old Schedules (READ-ONLY)

**File:** `cleanup-old-schedules-step1-check.sql`

**Purpose:** Analyze which schedules will be affected

**Safety:** ✅ READ-ONLY - No data modification

**What it does:**
- Counts total pending schedules
- Identifies overdue schedules
- Shows schedules created before timezone fix
- Lists details of schedules that will be cleaned up

**Run this in:** Supabase SQL Editor

**Expected output:**
- Number of schedules that will be affected
- List of overdue schedules with details
- Status distribution across all schedules

**Action:** Review the output carefully before proceeding to Step 2

---

## Step 2: Backup Affected Schedules (SAFETY)

**File:** `cleanup-old-schedules-step2-backup.sql`

**Purpose:** Create backup before any modifications

**Safety:** ✅ Creates backup table - No data loss

**What it does:**
- Creates table `schedules_backup_20251015`
- Backs up all schedules that will be affected
- Adds metadata (backup timestamp, reason)

**Run this in:** Supabase SQL Editor

**Expected output:**
- Backup table created successfully
- Number of schedules backed up
- Can restore from this backup if needed

**Verify:** Count should match Step 1

**Restore command (if needed):**
```sql
UPDATE schedules s
SET
  status = b.status,
  scheduled_for = b.scheduled_for,
  error_message = NULL
FROM schedules_backup_20251015 b
WHERE s.id = b.id;
```

---

## Step 3: Fix Old Schedules (SAFE UPDATE)

**File:** `cleanup-old-schedules-step3-fix.sql`

**Purpose:** Mark old overdue schedules as failed

**Safety:** ⚠️ MODIFIES DATA - But uses transaction

**What it does:**
- Uses transaction (BEGIN ... COMMIT/ROLLBACK)
- Updates old overdue schedules to `status='failed'`
- Sets clear error message explaining why
- Shows which schedules were updated

**Run this in:** Supabase SQL Editor

**IMPORTANT:**
1. The script starts with `BEGIN;` (transaction)
2. Review the `RETURNING` output carefully
3. If looks good: Run `COMMIT;`
4. If something wrong: Run `ROLLBACK;`

**Expected changes:**
- Old pending schedules → failed
- Error message: "Cancelled - Created before timezone fix"
- No schedules created after 2025-10-15 affected

---

## Step 4: Verify Fix (POST-UPDATE CHECK)

**File:** `cleanup-old-schedules-step4-verify.sql`

**Purpose:** Confirm cleanup was successful

**Safety:** ✅ READ-ONLY - No data modification

**What it does:**
- Checks remaining pending schedules
- Counts cleaned up schedules
- Verifies no new schedules are overdue
- Shows overall health status

**Run this in:** Supabase SQL Editor

**Expected results:**
- ✅ No overdue schedules created after 2025-10-15
- ✅ Old schedules marked as failed
- ✅ Health status: 🟢 HEALTHY

**If health check fails:**
- Check GitHub Actions logs
- Verify Make.com webhook is working
- Run monitoring endpoint: `/api/cron/debug-schedules`

---

## Monitoring (Ongoing)

After cleanup, the app now includes automatic monitoring:

**API Endpoint:** `/api/cron/debug-schedules`
- Includes `scheduleHealth` section
- Shows overdue count and severity
- Provides recommendations

**Monitor utility:** `lib/utils/schedule-monitor.ts`
- `checkScheduleHealth()` - Check for overdue schedules
- `monitorScheduleHealth()` - Check and log health report

**Example usage:**
```typescript
import { monitorScheduleHealth } from '@/lib/utils/schedule-monitor';

// In API endpoint or cron job
const report = await monitorScheduleHealth(30); // 30 min threshold

if (!report.healthy) {
  console.warn('Overdue schedules detected:', report);
  // Send alert here
}
```

---

## Troubleshooting

### Q: Schedules still showing overdue after cleanup?

**Check:**
1. Are they created after 2025-10-15? (New schedules)
   - If yes: Check GitHub Actions cron is running
   - Verify Make.com webhook is working

2. Are they created before 2025-10-15? (Old schedules)
   - Re-run Step 1 to check
   - Make sure Step 3 was committed (not rolled back)

3. Check cron execution:
   - GitHub Actions: Check workflow runs
   - Vercel logs: Look for errors
   - Make.com: Verify scenario is active

### Q: Can I restore backed up schedules?

**Yes!** Use the restore command from Step 2:
```sql
UPDATE schedules s
SET
  status = b.status,
  scheduled_for = b.scheduled_for,
  error_message = NULL
FROM schedules_backup_20251015 b
WHERE s.id = b.id;
```

### Q: How to prevent this in the future?

**Monitoring is now built-in:**
- `/api/cron/debug-schedules` includes health check
- Shows overdue schedules with severity levels
- Provides actionable recommendations

**Recommended:**
- Check debug endpoint regularly
- Set up alerts for critical severity
- Monitor GitHub Actions workflow status

---

## Safety Checklist

Before running scripts:

- [ ] Read all 4 steps completely
- [ ] Understand what each script does
- [ ] Have database backup (Supabase does this automatically)
- [ ] Run Step 1 first (check only)
- [ ] Run Step 2 to create backup
- [ ] Review Step 3 output before COMMIT
- [ ] Run Step 4 to verify

After running scripts:

- [ ] Verify health status is 🟢 HEALTHY
- [ ] Check a few schedules manually
- [ ] Monitor for next 24 hours
- [ ] Document any issues found

---

## Support

If you encounter issues:

1. **Check logs:**
   - Vercel deployment logs
   - GitHub Actions workflow logs
   - Supabase logs

2. **Run diagnostic:**
   - `/api/cron/debug-schedules` endpoint
   - Shows current state and health

3. **Refer to docs:**
   - `CLAUDE.md` - Project documentation
   - `MODULE_ANALYSIS_REPORT.md` - System analysis

---

**Last Updated:** 2025-10-15
**Version:** 1.0
