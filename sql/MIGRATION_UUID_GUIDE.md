# Migration Guide: Convert user_id from TEXT to UUID

## 📋 Overview

This migration converts `schedules.user_id` and `activity_logs.user_id` from TEXT to UUID type for consistency with `user_profiles.id` and `reviews.user_id`.

## ⚠️ IMPORTANT - Read Before Running

- **Backup your database** before starting
- Run scripts in order (Step 0 → Step 1 → Step 2)
- Keep the rollback script ready in case of issues
- Test in a staging environment first if possible

## 🎯 Benefits After Migration

✅ **Consistent data types** across all tables
✅ **No more type casting** in RLS policies
✅ **Better query performance** without type conversions
✅ **Proper foreign key constraints** with referential integrity
✅ **Cleaner, more maintainable** SQL code

## 📁 Migration Files

| File | Purpose | Required |
|------|---------|----------|
| `migrate-user-id-to-uuid-step0-verify.sql` | Pre-migration verification | ✅ Yes |
| `migrate-user-id-to-uuid-step1-migrate.sql` | Main migration script | ✅ Yes |
| `migrate-user-id-to-uuid-step2-update-policies.sql` | Update RLS policies | ✅ Yes |
| `migrate-user-id-to-uuid-rollback.sql` | Emergency rollback | ⚠️ If needed |

## 🚀 Migration Steps

### Step 0: Verification (REQUIRED)

**Purpose:** Check data integrity before migration

**File:** `migrate-user-id-to-uuid-step0-verify.sql`

**What it checks:**
- All user_id values are valid UUID format
- No orphaned records (user_id references non-existent users)
- Data quality report

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `step0-verify.sql`
3. Click **Run**
4. Review the output report

**Expected output:**
```
✅ All checks passed! Safe to proceed with migration.
```

**If you see warnings:**
- ⚠️ **Invalid UUIDs**: Fix these records first (update or delete)
- ⚠️ **Orphaned records**: Consider cleaning up before migration
- ❌ **Errors**: DO NOT proceed until fixed

---

### Step 1: Migration (CAREFUL!)

**Purpose:** Convert TEXT columns to UUID with backup

**File:** `migrate-user-id-to-uuid-step1-migrate.sql`

**What it does:**
1. ✅ Creates backup columns (`user_id_backup`)
2. ✅ Copies current data to backup
3. ✅ Drops old foreign key constraints
4. ✅ Creates new UUID columns
5. ✅ Migrates data from TEXT to UUID
6. ✅ Drops old TEXT columns
7. ✅ Renames new UUID columns to `user_id`
8. ✅ Recreates foreign key constraints
9. ✅ Adds indexes for performance

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `step1-migrate.sql`
3. **Double-check you're in the correct database**
4. Click **Run**
5. Monitor the progress messages

**Expected output:**
```
✅ MIGRATION COMPLETED SUCCESSFULLY!
📊 Changes made:
   ✓ schedules.user_id: TEXT → UUID
   ✓ activity_logs.user_id: TEXT → UUID
   ✓ Foreign key constraints added
   ✓ Indexes created for performance
   ✓ Backup columns preserved (user_id_backup)
```

**If migration fails:**
- Check error message
- Review backup columns are intact
- Use rollback script if needed

---

### Step 2: Update RLS Policies

**Purpose:** Simplify policies now that all columns are UUID

**File:** `migrate-user-id-to-uuid-step2-update-policies.sql`

**What it does:**
1. ✅ Drops old policies (with TEXT casting)
2. ✅ Creates new simplified policies (no casting needed)
3. ✅ Verifies all policies are correct
4. ✅ Tests query performance

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `step2-update-policies.sql`
3. Click **Run**
4. Verify policy count matches expected

**Expected output:**
```
✅ RLS POLICIES UPDATED SUCCESSFULLY!
📊 Policy Summary:
   Total RLS policies: 15

🎉 Benefits of UUID migration:
   ✓ No more type casting in policies
   ✓ Improved query performance
   ✓ Consistent data types across tables
   ✓ Proper foreign key constraints
```

---

### Rollback (Emergency Only!)

**Purpose:** Restore to pre-migration state if issues occur

**File:** `migrate-user-id-to-uuid-rollback.sql`

**When to use:**
- Migration completed but application breaks
- Data integrity issues discovered
- Need to revert for any reason

**What it does:**
1. ✅ Verifies backup columns exist
2. ✅ Drops foreign key constraints
3. ✅ Drops UUID columns
4. ✅ Restores TEXT columns from backup
5. ✅ Recreates V7 RLS policies (with TEXT casting)

**How to run:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `migrate-user-id-to-uuid-rollback.sql`
3. Click **Run**
4. Verify system is back to original state

**Expected output:**
```
✅ ROLLBACK COMPLETED SUCCESSFULLY!
⚠️  System is now back to pre-migration state
```

---

## 🧪 Post-Migration Testing

After completing all steps, test these scenarios:

### Test 1: User can access their own data
```sql
-- Login as a regular user and verify they can see their schedules
SELECT * FROM schedules LIMIT 5;
SELECT * FROM activity_logs LIMIT 5;
```

### Test 2: Soft delete still works
```sql
-- Set a test user to inactive
UPDATE user_profiles SET is_active = false WHERE email = 'test@example.com';

-- Try to login as that user → Should not be able to access data

-- Restore user
UPDATE user_profiles SET is_active = true WHERE email = 'test@example.com';

-- Login again → Should work normally
```

### Test 3: Admin can view all data
```sql
-- Login as admin and verify you can see all users' data
SELECT COUNT(*) FROM schedules;
SELECT COUNT(*) FROM activity_logs;
```

### Test 4: Foreign key constraints work
```sql
-- Try to insert a schedule with non-existent user_id
-- Should fail with foreign key constraint error
INSERT INTO schedules (user_id, review_id, status)
VALUES ('00000000-0000-0000-0000-000000000000', NULL, 'pending');
-- Expected: ERROR: violates foreign key constraint
```

---

## 🗑️ Cleanup (Optional)

After verifying everything works for at least 1 week, you can remove backup columns:

```sql
-- Remove backup columns to free up space
ALTER TABLE schedules DROP COLUMN user_id_backup;
ALTER TABLE activity_logs DROP COLUMN user_id_backup;

-- Verify cleanup
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('schedules', 'activity_logs')
AND column_name LIKE '%user_id%'
ORDER BY table_name, column_name;
```

---

## 📊 Before vs After Comparison

### Before Migration (V7)

```sql
-- schedules.user_id: TEXT
-- activity_logs.user_id: TEXT

-- RLS Policy (with type casting)
CREATE POLICY "Users can view own schedules" ON schedules
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.id::text = schedules.user_id  -- 👈 Type casting needed
            AND up.is_active = true
        )
    );
```

### After Migration (V8)

```sql
-- schedules.user_id: UUID ✅
-- activity_logs.user_id: UUID ✅

-- RLS Policy (no type casting)
CREATE POLICY "Users can view own schedules" ON schedules
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.id = schedules.user_id  -- 👈 No casting needed!
            AND up.is_active = true
        )
    );
```

---

## 🆘 Troubleshooting

### Issue: Step 0 reports invalid UUIDs

**Solution:**
```sql
-- Find invalid records
SELECT * FROM schedules
WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Fix by updating to correct UUID or delete
UPDATE schedules SET user_id = '<correct_uuid>' WHERE id = '<schedule_id>';
-- OR
DELETE FROM schedules WHERE id = '<schedule_id>';
```

### Issue: Step 0 reports orphaned records

**Solution:**
```sql
-- Find orphaned records
SELECT s.*
FROM schedules s
LEFT JOIN user_profiles up ON s.user_id = up.id::text
WHERE up.id IS NULL;

-- Delete orphaned records
DELETE FROM schedules
WHERE id IN (
    SELECT s.id
    FROM schedules s
    LEFT JOIN user_profiles up ON s.user_id = up.id::text
    WHERE up.id IS NULL
);
```

### Issue: Migration fails midway

**Solution:**
1. Check error message carefully
2. Review which step failed
3. If backup columns exist, use rollback script
4. Fix the underlying issue
5. Try migration again

### Issue: Application breaks after migration

**Solution:**
1. Check application logs for errors
2. Verify API routes are using correct types
3. Test database queries manually
4. If unfixable quickly, use rollback script
5. Fix issues and try again later

---

## 📝 Database Schema Changes Summary

### Tables Modified

#### schedules
- **Before:** `user_id TEXT`
- **After:** `user_id UUID NOT NULL`
- **New:** `user_id_backup TEXT` (temporary)
- **Constraint:** `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **Index:** `idx_schedules_user_id`

#### activity_logs
- **Before:** `user_id TEXT`
- **After:** `user_id UUID`
- **New:** `user_id_backup TEXT` (temporary)
- **Constraint:** `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL`
- **Index:** `idx_activity_logs_user_id`

### RLS Policies Updated

- `Users can view own schedules` - Simplified (no casting)
- `Users can manage own schedules` - Simplified (no casting)
- `Users can view own activity logs` - Simplified (no casting)
- `Users can create activity logs` - No change

---

## ✅ Success Criteria

Migration is successful when:

- [x] All steps complete without errors
- [x] All tables show UUID data type for user_id
- [x] Foreign key constraints are active
- [x] RLS policies have no type casting
- [x] Users can access their own data
- [x] Admins can access all data
- [x] Soft delete feature still works
- [x] No application errors in logs

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review Supabase logs for errors
3. Use rollback script if needed
4. Document the issue for future reference

---

**Last Updated:** 2025-10-16
**Version:** 1.0
**Status:** Ready for production use
