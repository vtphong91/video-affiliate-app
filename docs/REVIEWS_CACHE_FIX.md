# Reviews Cache Fix - Review mới không hiển thị

## Ngày: 2025-12-29

## Vấn đề

User tạo review mới nhưng không hiển thị trong trang Reviews (`/dashboard/reviews`).

**Triệu chứng:**
- Database đã lưu review mới (confirmed trong Supabase)
- Trang Reviews vẫn hiển thị count cũ (62 reviews)
- Review mới KHÔNG xuất hiện trong danh sách
- Dropdown "Tạo Lịch Mới" cũng không có review mới

## Nguyên nhân gốc rễ

**CACHE không được invalidate sau khi tạo review mới**

### Chi tiết kỹ thuật

**File**: `app/dashboard/reviews/page.tsx`

Trang Reviews sử dụng `cachedFetch` với TTL 60 giây:

```typescript
const data = await cachedFetch(
  `/api/reviews?page=${page}&limit=${itemsPerPage}`,
  {
    headers,
    ttl: 60000, // 60 seconds cache ← VẤN ĐỀ
    force, // Force refresh if specified
  }
);
```

**File**: `app/dashboard/create/page.tsx`

Function `handleSaveReview` tạo review mới nhưng KHÔNG invalidate cache:

```typescript
// ❌ TRƯỚC ĐÂY - Không invalidate cache
const data = await response.json();
setSavedReview({ id: data.review.id, slug: data.review.slug });

toast({
  title: 'Lưu thành công!',
  description: 'Review đã được lưu vào database',
});

setStep('preview');
// ← THIẾU invalidateCache() ở đây!
```

### Hậu quả

1. **User tạo review mới** → API `/api/create-review` lưu vào database ✅
2. **User vào trang Reviews** → `cachedFetch` trả về data CŨ từ cache (60s) ❌
3. **User phải đợi 60 giây** hoặc hard refresh (Ctrl+Shift+R) ❌
4. **Dropdown "Tạo Lịch Mới"** cũng bị ảnh hưởng (không có review mới) ❌

## Giải pháp

### Fix 1: Import invalidateCache

**File**: `app/dashboard/create/page.tsx`

```typescript
// ✅ THÊM import
import { invalidateCache } from '@/lib/utils/request-cache';
```

### Fix 2: Invalidate cache sau khi tạo review

**File**: `app/dashboard/create/page.tsx` (Line 243-246)

```typescript
const data = await response.json();
setSavedReview({ id: data.review.id, slug: data.review.slug });

// ✅ Invalidate ALL reviews-related caches
console.log('🗑️ Invalidating reviews cache after creating new review');
invalidateCache(/\/api\/reviews/); // Trang Reviews
invalidateCache(/\/api\/reviews-fast/); // Dropdown tạo lịch

toast({
  title: 'Lưu thành công!',
  description: 'Review đã được lưu vào database',
});

setStep('preview');
```

## So sánh Before/After

### ❌ BEFORE - Cache không được invalidate

```typescript
const handleSaveReview = async () => {
  // ... create review logic

  const data = await response.json();
  setSavedReview({ id: data.review.id, slug: data.review.slug });

  toast({ title: 'Lưu thành công!' });
  setStep('preview');
  // ← Review mới LƯU vào DB nhưng cache KHÔNG được clear
};
```

**Timeline**:
1. T+0s: User tạo review → Lưu vào DB ✅
2. T+1s: User vào `/dashboard/reviews` → Thấy cache CŨ (60s) ❌
3. T+60s: Cache expired → User F5 → Thấy review mới ✅

### ✅ AFTER - Cache được invalidate ngay lập tức

```typescript
const handleSaveReview = async () => {
  // ... create review logic

  const data = await response.json();
  setSavedReview({ id: data.review.id, slug: data.review.slug });

  // ✅ Invalidate cache NGAY SAU KHI TẠO
  invalidateCache(/\/api\/reviews/);
  invalidateCache(/\/api\/reviews-fast/);

  toast({ title: 'Lưu thành công!' });
  setStep('preview');
};
```

**Timeline**:
1. T+0s: User tạo review → Lưu vào DB ✅ → Invalidate cache ✅
2. T+1s: User vào `/dashboard/reviews` → Fetch MỚI từ API ✅ → Thấy review mới ngay lập tức ✅

## Testing

### Test Case 1: Tạo review mới và check trang Reviews

**Steps**:
1. Vào `/dashboard/create`
2. Tạo review mới và click "Lưu & Tiếp Tục"
3. Click "Xem Tất Cả Reviews"

**Expected (sau fix)**:
- ✅ Review mới xuất hiện NGAY LẬP TỨC trong danh sách
- ✅ Count tăng lên (ví dụ: 62 → 63)
- ✅ Review mới ở đầu danh sách (sorted by created_at DESC)

**Actual (trước fix)**:
- ❌ Review mới KHÔNG hiển thị
- ❌ Count vẫn cũ (62)
- ❌ Phải đợi 60 giây hoặc hard refresh

### Test Case 2: Tạo review mới và check dropdown tạo lịch

**Steps**:
1. Vào `/dashboard/create`
2. Tạo review mới
3. Vào `/dashboard/schedules`
4. Click "Tạo Lịch Mới"
5. Check dropdown "Chọn Review"

**Expected (sau fix)**:
- ✅ Review mới xuất hiện trong dropdown
- ✅ Count đúng (ví dụ: "Có 11 reviews")

**Actual (trước fix)**:
- ❌ Review mới KHÔNG có trong dropdown
- ❌ Count vẫn cũ (10 reviews)

### Test Case 3: Check console logs

**Console output sau khi tạo review**:

```
🔍 CreateScheduleDialog: Fetching reviews... (forceRefresh: false)
🔑 Auth headers: { userId: ..., email: ..., role: ... }
🚀 Fast reviews API called
👤 User ID for reviews-fast: f788ee95-...
✅ Fast reviews fetched for user f788ee95-...: 63 in 145ms

🗑️ Invalidating reviews cache after creating new review
✅ Cache invalidated for pattern: /\/api\/reviews/
✅ Cache invalidated for pattern: /\/api\/reviews-fast/
```

## Files Modified

1. **[app/dashboard/create/page.tsx](../app/dashboard/create/page.tsx)**
   - Line 23: Added `import { invalidateCache } from '@/lib/utils/request-cache'`
   - Line 243-246: Added cache invalidation after creating review

## Related Files (No Changes Needed)

1. **[app/dashboard/reviews/page.tsx](../app/dashboard/reviews/page.tsx)**
   - Already uses `cachedFetch` correctly
   - Already has `invalidateCache` after DELETE
   - TTL 60s is reasonable for normal usage

2. **[lib/utils/request-cache.ts](../lib/utils/request-cache.ts)**
   - Provides `cachedFetch` and `invalidateCache` utilities
   - Uses regex pattern matching for cache invalidation

## Cache Strategy Overview

### Current Caching Pattern

```typescript
// GET requests - Cached for 60s
const data = await cachedFetch('/api/reviews', {
  headers,
  ttl: 60000, // 60 seconds
  force: false, // Use cache if available
});

// Mutations (POST/PUT/DELETE) - Invalidate cache
const response = await fetch('/api/reviews', { method: 'POST', ... });
invalidateCache(/\/api\/reviews/); // Clear all /api/reviews* caches
```

### Cache Invalidation Points

| Action | API Call | Cache Invalidation | Location |
|--------|----------|-------------------|----------|
| **Create Review** | `POST /api/create-review` | `/api/reviews*` + `/api/reviews-fast*` | `app/dashboard/create/page.tsx:245-246` |
| **Delete Review** | `DELETE /api/reviews/:id` | `/api/reviews*` | `app/dashboard/reviews/page.tsx:112` |
| **Update Review** | `PUT /api/reviews/:id` | ❌ TODO | Need to add in edit page |

### ⚠️ TODO: Add cache invalidation to Edit Review page

**File**: `app/dashboard/reviews/[id]/edit/page.tsx` (needs to be checked)

```typescript
// TODO: Add after successful update
const response = await fetch(`/api/reviews/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updatedReview),
});

if (response.ok) {
  // ✅ TODO: Add this
  invalidateCache(/\/api\/reviews/);
  invalidateCache(/\/api\/reviews-fast/);
}
```

## Best Practices

### Pattern for Mutations with Cache

```typescript
// ✅ CORRECT - Invalidate cache after mutation
const handleMutation = async () => {
  try {
    // 1. Perform mutation
    const response = await fetch('/api/endpoint', {
      method: 'POST/PUT/DELETE',
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('...');

    // 2. Invalidate related caches IMMEDIATELY
    invalidateCache(/\/api\/endpoint/);
    invalidateCache(/\/api\/related-endpoint/);

    // 3. Show success message
    toast({ title: 'Success!' });

    // 4. Navigate or update UI
    router.push('/list');
  } catch (error) {
    toast({ title: 'Error', variant: 'destructive' });
  }
};
```

### When to invalidate cache?

✅ **DO invalidate**:
- After CREATE (POST)
- After UPDATE (PUT/PATCH)
- After DELETE

❌ **DON'T invalidate**:
- During READ (GET) - unless using `force: true`
- On component mount
- On every render

## Performance Impact

### Before Fix
- **Initial load**: Fast (uses cache) ✅
- **After mutation**: Slow (shows stale data for 60s) ❌
- **User experience**: Confusing (changes not visible) ❌

### After Fix
- **Initial load**: Fast (uses cache) ✅
- **After mutation**: Fast (cache invalidated → fresh data) ✅
- **User experience**: Smooth (changes visible immediately) ✅

### Cache Hit Rate (estimated)

**Before**: ~90% (too high, shows stale data)
**After**: ~70-80% (optimal, fresh data when needed)

## Status

✅ **FIX COMPLETED**

**Changes applied**:
- ✅ Added `invalidateCache` import to create page
- ✅ Added cache invalidation after creating review
- ✅ Invalidates both `/api/reviews` and `/api/reviews-fast`

**Next steps for user**:
1. Tạo review mới
2. Click "Xem Tất Cả Reviews"
3. Review mới sẽ hiển thị NGAY LẬP TỨC
4. Dropdown "Tạo Lịch Mới" cũng có review mới

**TODO**:
- [ ] Add cache invalidation to Edit Review page
- [ ] Add cache invalidation to other mutation operations
