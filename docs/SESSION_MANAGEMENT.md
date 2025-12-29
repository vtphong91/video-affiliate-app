# Session Management - Quản lý phiên đăng nhập

## Tổng quan

Hệ thống đã được cấu hình để duy trì session đăng nhập trong **7 ngày** thay vì timeout sau vài giờ. Điều này giúp người dùng không bị gián đoạn khi làm việc với ứng dụng.

## Cấu hình Session

### 1. Browser Client Configuration
**File:** `lib/auth/supabase-browser.ts`

```typescript
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,        // Lưu session vào localStorage
      autoRefreshToken: true,      // Tự động refresh token
      detectSessionInUrl: true,    // Phát hiện session từ URL callback
      storage: window.localStorage // Sử dụng localStorage
    },
    cookieOptions: {
      name: 'sb-auth-token',
      lifetime: 7 * 24 * 60 * 60,  // 7 ngày (604800 giây)
      domain: window.location.hostname,
      path: '/',
      sameSite: 'lax'
    }
  }
);
```

### 2. Server Client Configuration
**File:** `lib/db/supabase.ts`

```typescript
// Client cho user
supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Admin client (không cần session)
supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
```

### 3. Auto Token Refresh
**File:** `lib/auth/SupabaseAuthProvider.tsx`

Tự động refresh token **mỗi 6 giờ** để đảm bảo session luôn valid:

```typescript
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.refreshSession();
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  return () => clearInterval(refreshInterval);
}, []);
```

## Timeline Session Lifecycle

```
Đăng nhập
    ↓
Session tạo (JWT token)
    ↓
Lưu vào localStorage + cookies (lifetime: 7 ngày)
    ↓
Auto-refresh mỗi 6h
    ↓ ↓ ↓
6h   12h  18h  24h ... 7 ngày
    ↓
Nếu không refresh trong 7 ngày → Session hết hạn
```

## Session Storage

### LocalStorage Keys
```
sb-<project-ref>-auth-token
sb-<project-ref>-auth-token-code-verifier
```

### Cookie
```
Name: sb-auth-token
Lifetime: 604800 seconds (7 days)
Path: /
SameSite: lax
```

## Xử lý Session Timeout

### 1. Trong API Routes
```typescript
const { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
  // Thử refresh
  const { data: { session: refreshed } } = await supabase.auth.refreshSession();
  session = refreshed;
}

if (!session?.access_token) {
  throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
}
```

### 2. Trong Components
File `app/dashboard/create/page.tsx` đã implement auto-refresh:

```typescript
// Try to get session, refresh if needed
let { data: { session } } = await supabase.auth.getSession();

if (!session?.access_token) {
  console.log('Session not found, attempting refresh...');
  const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
  session = refreshedSession;
}
```

## Lợi ích

### ✅ Trước đây (Timeout sau vài giờ)
- ❌ User bị logout khi đang làm việc
- ❌ Phải login lại nhiều lần trong ngày
- ❌ Mất data nếu chưa save kịp
- ❌ UX không tốt

### ✅ Bây giờ (Session 7 ngày)
- ✅ Làm việc liên tục không bị gián đoạn
- ✅ Chỉ cần login 1 lần/tuần
- ✅ Auto-refresh token trong background
- ✅ Dữ liệu được bảo vệ tốt hơn

## Security Considerations

### 1. Token Rotation
- Access token được refresh mỗi 6h
- Refresh token chỉ dùng 1 lần (rotation)
- Old tokens bị invalidate sau khi refresh

### 2. Storage Security
- LocalStorage: Chỉ accessible từ same-origin
- Cookies: SameSite=lax (chống CSRF)
- HTTPS only trong production

### 3. Session Invalidation
User có thể logout manual bất cứ lúc nào:
```typescript
await supabase.auth.signOut();
```

## Monitoring & Debugging

### Console Logs
```
🔄 Auto-refreshing session token...
✅ Session refreshed successfully
❌ Failed to refresh session: [error]
```

### Check Session Status
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session expires at:', new Date(session.expires_at * 1000));
console.log('Time remaining:', session.expires_at - Date.now() / 1000, 'seconds');
```

## Testing

### Test Session Persistence
1. Đăng nhập vào app
2. Đóng browser
3. Mở lại sau vài giờ
4. ✅ Vẫn đăng nhập (không cần login lại)

### Test Auto-Refresh
1. Đăng nhập
2. Để app chạy > 6h
3. Check console logs → Thấy "Auto-refreshing session token"
4. ✅ Session vẫn valid

### Test Manual Refresh
```typescript
const { data, error } = await supabase.auth.refreshSession();
if (error) {
  console.error('Refresh failed:', error);
} else {
  console.log('New session:', data.session);
}
```

## Troubleshooting

### Vấn đề: Session vẫn timeout nhanh

**Nguyên nhân có thể:**
1. Supabase project settings chưa cấu hình JWT expiry
2. Browser xóa localStorage/cookies
3. Incognito mode (không lưu session)

**Giải pháp:**
1. Check Supabase Dashboard → Authentication → Settings → JWT Expiry (đặt 604800 seconds)
2. Kiểm tra browser settings cho phép cookies
3. Không dùng incognito mode cho production work

### Vấn đề: Token refresh fail

**Nguyên nhân:**
- Network error
- Supabase service down
- Refresh token hết hạn (> 7 ngày không dùng)

**Giải pháp:**
- Check network connection
- Retry refresh
- Yêu cầu user login lại

## Best Practices

### ✅ DO
- Sử dụng `autoRefreshToken: true`
- Implement fallback refresh trong API calls
- Log session events cho debugging
- Test session persistence trên multiple devices

### ❌ DON'T
- Tắt `persistSession` (sẽ mất session khi refresh page)
- Hard-code session lifetime quá dài (> 30 ngày = security risk)
- Ignore refresh errors (luôn handle gracefully)
- Store sensitive data in session metadata

## Migration Notes

Nếu upgrade từ version cũ:

1. **Clear existing sessions:** Users sẽ cần login lại 1 lần
2. **Update environment:** Không cần thêm env vars
3. **Database:** Không cần migration
4. **Breaking changes:** Không có

## References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Next.js SSR with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
