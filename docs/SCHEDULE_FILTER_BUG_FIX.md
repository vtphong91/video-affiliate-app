# Schedule Filter Bug Fix - User ID Missing

## Ngày: 2025-12-29

## Vấn đề

Khi user tạo lịch đăng bài, các reviews đã được lên lịch vẫn xuất hiện trong dropdown "Chọn Review" khi tạo lịch mới.

### Nguyên nhân gốc rễ

**LỖI LOGIC NGHIÊM TRỌNG**: Cả 2 API không filter theo `user_id`:

1. **`/api/reviews-fast`**: Lấy TẤT CẢ reviews của TẤT CẢ users trong hệ thống
2. **`/api/schedules/used-review-ids`**: Lấy TẤT CẢ schedules của TẤT CẢ users

### Hậu quả

- User A thấy reviews của User B trong dropdown
- User A tạo lịch cho review của User B → Review của User B vẫn hiển thị trong dropdown của User B
- Dữ liệu bị lẫn lộn giữa các users

### Ví dụ cụ thể từ screenshot

User "Võ Thanh Phong" thấy 6 reviews trong dropdown, trong đó có 2 bài Philips đã được lên lịch:
- "58. Máy xay thịt Philips HR1503/00"
- "Đập hộp máy hút bụi đứng Philips XC3131/01"

Các bài này ĐÃ CÓ trong bảng schedules (status = "pending") nhưng vẫn hiển thị vì API không filter theo user_id.

## Giải pháp

### 1. Fix `/api/reviews-fast/route.ts`

**Thay đổi:**
```typescript
// ❌ BEFORE - Không có user filter
export async function GET() {
  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, video_title, ...')
    .order('created_at', { ascending: false });
}

// ✅ AFTER - Filter theo user_id
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
  }

  const { data: reviews } = await supabaseAdmin
    .from('reviews')
    .select('id, video_title, ...')
    .eq('user_id', userId) // ⚠️ CRITICAL FIX
    .order('created_at', { ascending: false });
}
```

### 2. Fix `/api/schedules/used-review-ids/route.ts`

**Thay đổi:**
```typescript
// ❌ BEFORE - Không có user filter
export async function GET(request: NextRequest) {
  const { data: schedules } = await supabaseAdmin
    .from('schedules')
    .select('review_id, video_title, status, created_at')
    .not('review_id', 'is', null)
    .order('created_at', { ascending: false });
}

// ✅ AFTER - Filter theo user_id
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required'
    }, { status: 401 });
  }

  const { data: schedules } = await supabaseAdmin
    .from('schedules')
    .select('review_id, video_title, status, created_at, user_id')
    .eq('user_id', userId) // ⚠️ CRITICAL FIX
    .not('review_id', 'is', null)
    .order('created_at', { ascending: false });
}
```

## So sánh với code chuẩn

API `/api/reviews/route.ts` (đã hoạt động đúng) có user filter:

```typescript
// Line 23-32: Get user ID and validate
const userId = await getUserIdFromRequest(request);

if (!userId) {
  return NextResponse.json(
    createErrorResponse('AUTHENTICATION_ERROR', 'Authentication required'),
    { status: 401 }
  );
}

// Line 56: Filter by user_id
const reviews = await db.getReviews({ userId, status, limit, offset });
```

## Testing

### Cách test

1. **Refresh trang lịch đăng bài** (F5)
2. **Click "Tạo Lịch Mới"**
3. **Kiểm tra dropdown "Chọn Review"**:
   - Chỉ hiển thị reviews CỦA USER HIỆN TẠI
   - KHÔNG hiển thị reviews của users khác
   - KHÔNG hiển thị reviews đã có lịch (của user hiện tại)

### Console logs để verify

```
// API /api/reviews-fast
👤 User ID for reviews-fast: <user-uuid>
✅ Fast reviews fetched for user <user-uuid>: 4 in 123ms

// API /api/schedules/used-review-ids
👤 User ID for used-review-ids: <user-uuid>
✅ Found 2 total schedules for user <user-uuid>
✅ Found 2 unique reviews with schedules: ["review-uuid-1", "review-uuid-2"]
```

### Expected result

Với user "Võ Thanh Phong":
- **Trước fix**: 6 reviews (bao gồm cả reviews của users khác)
- **Sau fix**: 4 reviews (chỉ reviews CỦA USER NÀY và chưa có lịch)

## Lưu ý quan trọng

### Security Issue

Lỗi này là **LỖ HỔNG BẢO MẬT** vì:
- User có thể thấy data của user khác
- User có thể tạo lịch cho reviews của người khác
- Không có isolation giữa các users

### Best Practice

**QUY TẮC**: Tất cả API endpoints phải:
1. **Authentication**: Validate user session
2. **Authorization**: Check user permissions
3. **Data Isolation**: Filter by `user_id` để đảm bảo user CHỈ thấy data của mình

### Pattern to follow

```typescript
// ✅ CHUẨN - Luôn follow pattern này
export async function GET(request: NextRequest) {
  // Step 1: Get user ID
  const userId = await getUserIdFromRequest(request);

  // Step 2: Validate authentication
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Step 3: Query with user_id filter
  const { data } = await supabaseAdmin
    .from('table_name')
    .select('*')
    .eq('user_id', userId); // ⚠️ CRITICAL
}
```

## Files Modified

1. [app/api/reviews-fast/route.ts](../app/api/reviews-fast/route.ts)
   - Added `getUserIdFromRequest()` authentication
   - Added `.eq('user_id', userId)` filter

2. [app/api/schedules/used-review-ids/route.ts](../app/api/schedules/used-review-ids/route.ts)
   - Added `getUserIdFromRequest()` authentication
   - Added `.eq('user_id', userId)` filter

## Related Issues

- Initial bug report: "2 reviews đã lên lịch vẫn hiển thị trong dropdown"
- Root cause: Missing user_id filter in fast APIs
- Impact: Security + Data isolation breach

## Status

✅ **FIXED** - Both APIs now filter by user_id correctly
