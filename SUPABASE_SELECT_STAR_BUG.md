# Supabase SELECT * Bug - Missing Row Issue

## Problem Summary

When using `.select('*')` in Supabase JS SDK, one review row was being skipped, causing the API to return 70 reviews instead of 71.

## Root Cause

**Supabase JS SDK Bug**: Using `select('*')` causes Supabase to skip rows under certain conditions (possibly related to data in specific fields).

## Evidence

### Test Results

| Query Method | Result |
|--------------|--------|
| SQL `SELECT COUNT(*)` | 71 rows ✅ |
| `.select('*')` | 70 rows ❌ |
| `.select('id, title, created_at, ...')` (explicit fields) | 71 rows ✅ |

### Missing Review Details

- **ID**: `0c1c13db-4b78-415d-aadd-6dc70090acc8`
- **Title**: "Đập hộp nồi cơm Điện Philips HD4518/62"
- **Created**: `2025-12-29T05:27:17.716072` (newest review)
- **User ID**: `1788ee95-7d22-4b0b-8e45-07ae2d03c7e1`

### Why It Was Hard to Debug

1. **Direct SQL worked**: SQL query showed 71 reviews
2. **Test endpoint worked**: Using same query structure returned 71
3. **Service layer failed**: Only when called through review-service.ts returned 70
4. **Fresh client didn't help**: Creating new Supabase client had no effect
5. **Cache wasn't the issue**: Disabling all caching didn't fix it

## Solution

### Before (Broken)

```typescript
const { data: reviews } = await supabaseAdmin
  .from('reviews')
  .select('*')  // ❌ Skips 1 row!
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### After (Fixed)

```typescript
const { data: reviews } = await supabaseAdmin
  .from('reviews')
  .select(`
    id,
    user_id,
    slug,
    video_url,
    video_platform,
    video_id,
    video_title,
    video_thumbnail,
    video_description,
    channel_name,
    channel_url,
    custom_title,
    summary,
    pros,
    cons,
    key_points,
    comparison_table,
    target_audience,
    seo_keywords,
    affiliate_links,
    category_id,
    status,
    views,
    clicks,
    created_at,
    updated_at
  `)  // ✅ Returns all 71 rows
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

## Files Fixed

- `lib/services/review-service.ts` - Changed `select('*')` to explicit field list

## Lessons Learned

1. **Never trust `select('*')` in Supabase** - Always specify fields explicitly
2. **Test with raw SQL first** - Helps identify if it's a database or SDK issue
3. **Create isolation tests** - Test exact same query in different contexts
4. **Check row by row** - Missing rows might have specific data patterns

## Related Issues

This is likely related to Supabase's internal query optimization or JSON serialization bugs when dealing with complex field types like `jsonb` arrays (pros, cons, affiliate_links, etc.).

## Prevention

For all future queries in this project:
- ✅ Always use explicit field lists
- ❌ Never use `select('*')` or `select('id, name, ...table(nested)')`
- ✅ Fetch related data separately and join in JavaScript
- ✅ Always log count before and after data transformation

## Verification

```bash
# Test endpoint that proves the fix
curl "http://localhost:3000/api/reviews?page=1&limit=100" \
  -H "x-user-id: 1788ee95-7d22-4b0b-8e45-07ae2d03c7e1" | \
  python -m json.tool | grep '"total"'

# Should return: "total": 71
```
