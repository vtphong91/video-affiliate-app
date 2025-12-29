# URGENT: User Session Mismatch - Wrong User ID

## Vấn đề phát hiện

**CRITICAL**: API đang fetch data cho WRONG USER!

### Evidence

**1. Screenshot Supabase** (từ user):
- Review "Máy xay thịt Philips HR1503/00" 
- `user_id` = `f788ee95-7d22-4b0b-8e45-07ae2d03c7e1` (starts with `f`)
- `video_url` = `https://youtube.com/watch?v=rCy_SsfR...`

**2. Server Logs**:
```
✅ Got user ID from header: 1788ee95-7d22-4b0b-8e45-07ae2d03c7e1
                            ^ starts with '1' not 'f'
```

**3. API Response**:
```
✅ Fast reviews fetched for user 1788ee95-7d22-4b0b-8e45-07ae2d03c7e1: 63 in 15ms
                                  ^ WRONG USER ID
```

### Root Cause

User đang đăng nhập với session có **user_id sai**:
- Thực tế user ID: `f788ee95-...` 
- Session user ID:  `1788ee95-...` (chỉ khác 1 ký tự đầu tiên)

Có 2 khả năng:
1. User bị logout và login vào account khác (có user_id `1788...`)
2. Supabase session bị corrupted (rất hiếm gặp)

### Impact

- User `f788...` tạo review → Lưu vào database với `user_id = f788...` ✅
- Nhưng khi fetch reviews → API dùng `user_id = 1788...` ❌
- User `1788...` có 63 reviews → User `f788...` thấy reviews của user `1788...`
- User `f788...` KHÔNG thấy reviews của CHÍNH MÌNH!

## Giải pháp

### Bước 1: User cần logout và login lại

```bash
1. Click vào tên user "Võ Thanh Phong" ở góc phải trên
2. Click "Đăng Xuất" / "Logout"
3. Clear browser cache: Ctrl+Shift+Delete
   - Select: "Cookies and other site data"
   - Select: "Cached images and files"
   - Click "Clear data"
4. Đóng toàn bộ browser tabs
5. Mở browser mới
6. Login lại với tài khoản: lammmodotcom@gmail.com
```

### Bước 2: Verify correct user ID

Sau khi login lại, mở browser Console (F12) và run:

```javascript
// Check current session user ID
fetch('/api/reviews?page=1&limit=1')
  .then(r => r.json())
  .then(data => {
    console.log('User ID from API:', data);
  });

// Check Supabase session
const { createClient } = window.supabase || {};
if (createClient) {
  const supabase = createClient(...);
  supabase.auth.getSession().then(({ data }) => {
    console.log('Session user ID:', data.session?.user?.id);
  });
}
```

**Expected**: User ID phải là `f788ee95-7d22-4b0b-8e45-07ae2d03c7e1`

### Bước 3: Kiểm tra Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Tìm user với email `lammmodotcom@gmail.com`
3. Verify user ID = `f788ee95-...`
4. Check "Last Sign In" - phải là thời điểm mới nhất

## Alternative: Force Session Refresh

Nếu logout/login không giải quyết được, user có thể force refresh session:

```javascript
// Run in browser console
const { supabase } = await import('/lib/auth/supabase-browser');
const { data, error } = await supabase.auth.refreshSession();
console.log('Refreshed session:', data.session?.user?.id);
```

## Prevention

Để tránh vấn đề này trong tương lai:

### 1. Add user ID validation

**File**: `lib/hooks/useAuthHeaders.ts`

```typescript
if (session?.user) {
  const userId = session.user.id;
  
  // ✅ VALIDATION: User ID must match expected format
  if (!userId || userId.length !== 36) {
    console.error('❌ Invalid user ID format:', userId);
    // Force logout if session is corrupted
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
    return;
  }
  
  authHeaders['x-user-id'] = userId;
  console.log('✅ Valid user ID:', userId);
}
```

### 2. Add session verification endpoint

**File**: `app/api/auth/verify-session/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  
  // Verify user exists in database
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    return NextResponse.json({ 
      valid: false, 
      error: 'User not found in database' 
    }, { status: 404 });
  }
  
  return NextResponse.json({ 
    valid: true, 
    userId: data.id,
    email: data.email 
  });
}
```

### 3. Add periodic session check

**File**: `app/dashboard/layout.tsx` or root layout

```typescript
useEffect(() => {
  const checkSession = async () => {
    const response = await fetch('/api/auth/verify-session');
    const data = await response.json();
    
    if (!data.valid) {
      console.error('❌ Invalid session, forcing logout');
      await supabase.auth.signOut();
      router.push('/auth/login');
    }
  };
  
  // Check on mount
  checkSession();
  
  // Check every 5 minutes
  const interval = setInterval(checkSession, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

## Status

🔴 **URGENT - Requires immediate action from user**

**User must**:
1. Logout completely
2. Clear browser cache
3. Login again
4. Verify user ID matches `f788ee95-...`

**After fix**:
- Reviews của user `f788...` sẽ hiển thị đúng
- Dropdown "Tạo Lịch Mới" sẽ có đúng reviews
- Count sẽ đúng (reviews của user `f788...`)
