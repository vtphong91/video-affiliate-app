# Fix Dashboard Authentication 401 Error

## 🐛 Vấn Đề

Dashboard stats API trả về 401 (Unauthorized) mặc dù user đã login.

**Nguyên nhân:**
- Dashboard page fetch không gửi cookies
- `getUserIdFromRequest()` không thể đọc auth cookies từ Supabase

## ✅ Fix Applied

### Fix 1: Add credentials to fetch (Simple)

**Commit:** `9b4374f`

```typescript
// app/dashboard/page.tsx
const response = await fetch('/api/dashboard/stats', {
  credentials: 'include',  // ✅ Send cookies with request
});
```

**Pros:**
- ✅ Đơn giản, ít code
- ✅ Tự động gửi cookies

**Cons:**
- ❌ Có thể không work với Vercel edge functions
- ❌ Phụ thuộc vào browser cookie settings

---

### Fix 2: Use Supabase Session Token (Recommended - Backup)

Nếu Fix 1 không work, dùng approach này:

```typescript
// app/dashboard/page.tsx
import { supabase } from '@/lib/db/supabase';

const fetchDashboardData = async () => {
  try {
    setLoading(true);

    // Get session from Supabase client
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    // Send Authorization header instead of relying on cookies
    const response = await fetch('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error || 'Không thể tải dữ liệu dashboard');
    }
  } catch (err) {
    setError('Lỗi kết nối đến server');
    console.error('Error fetching dashboard data:', err);
  } finally {
    setLoading(false);
  }
};
```

**Pros:**
- ✅ Luôn hoạt động, không phụ thuộc cookies
- ✅ Tương thích với edge functions
- ✅ Explicit authentication

**Cons:**
- ❌ Nhiều code hơn
- ❌ Cần import supabase

---

## 🧪 Testing

### Test Fix 1 (credentials: 'include'):

1. Deploy và clear browser cache (Ctrl+F5)
2. Login vào dashboard
3. Check browser DevTools:
   - Network tab → `/api/dashboard/stats`
   - Request headers should include cookies
4. Verify dashboard loads correctly

### Test Fix 2 (if needed):

1. Apply Fix 2 code
2. Commit and push
3. Deploy
4. Test again

---

## 📊 How getUserIdFromRequest Works

```typescript
// lib/auth/helpers/auth-helpers.ts

export async function getUserIdFromRequest(request: NextRequest) {
  // Method 1: Check x-user-id header
  const userIdFromHeader = request.headers.get('x-user-id');

  // Method 2: Check Supabase auth cookies (sb-*-auth-token)
  const authTokenCookie = request.cookies.getAll().find(cookie =>
    cookie.name.includes('auth-token') && cookie.name.startsWith('sb-')
  );

  // Method 3: Check Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data } = await supabaseAdmin.auth.getUser(token);
    return data.user?.id;
  }
}
```

**Fix 1 enables:** Method 2 (cookies)
**Fix 2 enables:** Method 3 (Bearer token)

---

## 🔍 Debugging

### Check if cookies are sent:

```javascript
// Browser Console
fetch('/api/dashboard/stats', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

### Check server logs (Vercel):

```
🔍 Dashboard stats request: {
  hasAuthHeader: true/false,
  cookiesCount: N,
  cookies: ['sb-xxx-auth-token', ...]
}
```

If `cookiesCount = 0` → Use Fix 2
If `hasAuthHeader = false` → Credentials not sent

---

## 📝 Related Files

- `app/dashboard/page.tsx` - Dashboard UI
- `app/api/dashboard/stats/route.ts` - Stats API
- `lib/auth/helpers/auth-helpers.ts` - Auth utilities

---

**Status:** Fix 1 deployed (commit `9b4374f`)
**Fallback:** Fix 2 ready if needed
