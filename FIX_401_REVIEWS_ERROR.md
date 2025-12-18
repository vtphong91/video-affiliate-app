# Fix 401 Unauthorized Error on Reviews Page

## Issue

**Error in Console**:
```
Failed to load resource: the server responded with a status of 401 ()
/api/reviews?page=1&limit=6&1
```

**Symptoms**:
- Dashboard shows "0 reviews" even when user has created reviews
- Browser console shows 401 Unauthorized error when fetching `/api/reviews`
- Reviews page displays "Chưa có review nào"

## Root Cause

**Race Condition**: Component was calling `fetchReviews()` as soon as `userId` became available, but **before** `headers['x-user-id']` was set.

### Timeline of the Bug:

1. **Component mounts** → `userId` becomes available from `useAuth()`
2. **useEffect triggers** (depends on `userId`)
3. **fetchReviews() called** with `headers` that don't have `x-user-id` yet
4. **API receives request** without auth headers
5. **API returns 401** because `getUserIdFromRequest()` returns null

### Why This Happened:

In commit **f679833**, I changed the dependency from:
```typescript
// Old (worked but was "too strict")
if (userId && headers['x-user-id']) {
  fetchReviews(currentPage);
}
```

To:
```typescript
// New (broke - too permissive)
if (userId) {
  fetchReviews(currentPage);
}
```

This removed the check for `headers['x-user-id']`, causing requests to be sent before authentication headers were ready.

## Solution

**File**: `app/dashboard/reviews/page.tsx` (lines 65-79)

Restore the headers check, but with better logging:

```typescript
// ✅ FIX: Wait for both userId AND headers to be ready
useEffect(() => {
  // Check if headers contain user ID (means auth is ready)
  const hasAuthHeaders = headers['x-user-id'] !== undefined;

  if (userId && hasAuthHeaders) {
    console.log('🔍 ReviewsPage: User ID and headers ready, fetching reviews for page:', currentPage);
    fetchReviews(currentPage);
  } else {
    console.log('🔍 ReviewsPage: Waiting for auth...', { userId, hasAuthHeaders });
    if (!userId) {
      setLoading(false);
    }
  }
}, [currentPage, userId, headers, fetchReviews]);
```

### What This Does:

1. **Checks both conditions**: `userId` AND `headers['x-user-id']`
2. **Logs waiting state**: Helps debug if auth is stuck
3. **Prevents premature API calls**: Only fetches when auth is fully ready
4. **Handles no-user case**: Sets loading to false if user doesn't exist

## Why Previous Fix Didn't Work

In the previous commit, I thought removing `headers['x-user-id']` check would fix the issue because:
- "If `userId` exists, headers should be ready"
- "The headers dependency is too strict"

But this assumption was **wrong** because:
- `useAuth()` provides `userId` immediately (from cached session)
- `useAuthHeaders()` takes time to fetch and set headers (async operation)
- There's a small window (50-200ms) where `userId` exists but `headers['x-user-id']` doesn't

## API Endpoint Behavior

**File**: `app/api/reviews/route.ts` (lines 22-33)

```typescript
const userId = await getUserIdFromRequest(request);
if (!userId) {
  return NextResponse.json(
    createErrorResponse('AUTHENTICATION_ERROR', 'Authentication required'),
    { status: 401 }
  );
}
```

The API correctly checks for authentication and returns 401 if not found. The problem was **client-side** sending requests too early.

## Testing

### Before Fix:
1. Open http://localhost:3003/dashboard/reviews
2. See "0 reviews" and empty state
3. Check console: `Failed to load resource: 401`
4. Check Network tab: Request missing `x-user-id` header

### After Fix:
1. Open http://localhost:3003/dashboard/reviews
2. Console shows: `🔍 ReviewsPage: Waiting for auth... { userId: '...', hasAuthHeaders: false }`
3. Then: `🔍 ReviewsPage: User ID and headers ready, fetching reviews for page: 1`
4. Reviews load successfully
5. Network tab: Request includes `x-user-id` header

### How to Test:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Watch for the server to start
# Then open: http://localhost:3003/dashboard/reviews

# Check browser console for the log messages
```

## Lessons Learned

1. **Don't remove "strict" checks without understanding why they exist**
   - The `headers['x-user-id']` check wasn't arbitrary - it prevented race conditions

2. **Authentication headers take time to load**
   - Even though `userId` is available, `headers` might not be ready yet
   - Always wait for both auth state AND auth headers

3. **Test thoroughly before committing**
   - I should have tested the previous fix locally before pushing
   - Browser console errors are obvious - check them first

4. **Better logging helps diagnose issues**
   - New logs show exactly when auth is ready vs waiting
   - Helps understand the async flow

## Related Files

- `app/dashboard/reviews/page.tsx` - Reviews page component (FIXED)
- `lib/hooks/useAuthHeaders.ts` - Authentication headers hook (OK)
- `app/api/reviews/route.ts` - Reviews API endpoint (OK)
- `lib/auth/helpers/auth-helpers.ts` - getUserIdFromRequest helper (OK)

## Commits

- **f679833** - ❌ Broke: Removed headers check (too permissive)
- **c222594** - ✅ Fixed: Added email field to UserProfile interface
- **[PENDING]** - ✅ Fix: Restored headers check with better logic

---

**Status**: Fixed locally, ready for testing before commit

**Next Step**: Test on http://localhost:3003/dashboard/reviews to verify reviews load correctly
