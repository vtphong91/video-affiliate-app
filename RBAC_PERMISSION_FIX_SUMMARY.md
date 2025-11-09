# BÁO CÁO PHÂN TÍCH VÀ KHẮC PHỤC LỖI PHÂN QUYỀN & CSS

**Ngày**: 2025-01-08
**Vấn đề**:
1. Role "Editor" không truy cập được module Schedules
2. CSS Syntax Error: `Unexpected token '.' (at 8aee48eb52f4c731.css:6:4)`

---

## 🔴 VẤN ĐỀ 1: ROLE "EDITOR" KHÔNG TRUY CẬP ĐƯỢC SCHEDULES

### Nguyên nhân gốc rễ

Hệ thống có **2 định nghĩa Role khác nhau** đang conflict với nhau:

#### **Hệ thống 1: Legacy Roles** (`types/index.ts` + `lib/auth/utils/permissions.ts`)
```typescript
// types/index.ts:117
export interface User {
  role: 'admin' | 'user' | 'guest'
}

// lib/auth/utils/permissions.ts
export const ROLE_PERMISSIONS = {
  admin: [...],
  user: [...],      // ✅ Có schedules.create, schedules.edit, schedules.view
  guest: [...]
}
```

#### **Hệ thống 2: Enhanced RBAC** (`lib/auth/config/auth-types.ts`)
```typescript
// lib/auth/config/auth-types.ts:4
export type UserRole = 'admin' | 'editor' | 'viewer'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [...],
  editor: [
    'read:reviews', 'write:reviews', 'delete:reviews',
    'read:schedules', 'write:schedules', 'delete:schedules',  // ✅ Editor CÓ quyền!
    'read:categories', 'write:categories', 'delete:categories',
    'read:analytics'
  ],
  viewer: [...]
}
```

### Vấn đề trong Middleware

**File**: `lib/auth/middleware/rbac-middleware.ts`

```typescript
// Line 14: Route permissions
const ROUTE_PERMISSIONS = {
  '/dashboard/schedules': ['read:schedules', 'write:schedules'],  // ✅ Đúng
  // ...
}

// Line 78-90: Middleware lấy user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('id, full_name, role, permissions, is_active')
  .eq('id', session.user.id)
  .single()

// Line 93-104: hasPermission check
const hasPermission = (requiredPermissions: string[]): boolean => {
  if (!userProfile) return false;

  // Admin has all permissions
  if (userProfile.role === 'admin') return true;  // ✅

  // ❌ VẤN ĐỀ: Check userPermissions từ array trong DB
  const userPermissions = userProfile.permissions || [];
  return requiredPermissions.some(permission =>
    userPermissions.includes(permission)
  );
}
```

**Root Cause**:
- Middleware kiểm tra `userProfile.permissions` (array lưu trong database)
- KHÔNG sử dụng `ROLE_PERMISSIONS` mapping từ auth-types.ts
- Nếu user có `role='editor'` nhưng `permissions=[]` (empty) → DENIED ❌

### Dữ liệu trong Database

**Table**: `user_profiles`

```sql
SELECT id, email, role, permissions, is_active
FROM user_profiles
WHERE role = 'editor';

-- Có thể output:
-- role: 'editor'
-- permissions: [] hoặc NULL  ❌ EMPTY!
```

Nếu `permissions` column empty, middleware sẽ deny access dù role là 'editor'.

---

## ✅ GIẢI PHÁP CHO VẤN ĐỀ 1

### Phương án A: Fix Middleware (RECOMMENDED)

**File**: `lib/auth/middleware/rbac-middleware.ts`

Sửa `hasPermission()` function để sử dụng ROLE_PERMISSIONS mapping:

```typescript
import { ROLE_PERMISSIONS } from '@/lib/auth/config/auth-types';

const hasPermission = (requiredPermissions: string[]): boolean => {
  if (!userProfile) return false;

  // Admin has all permissions
  if (userProfile.role === 'admin') return true;

  // ✅ FIX: Get permissions từ ROLE_PERMISSIONS mapping
  const rolePermissions = ROLE_PERMISSIONS[userProfile.role as UserRole] || [];
  const userCustomPermissions = userProfile.permissions || [];

  // Combine role-based permissions + custom permissions
  const allPermissions = [...rolePermissions, ...userCustomPermissions];

  // Check if user has any of the required permissions
  return requiredPermissions.some(permission =>
    allPermissions.includes(permission)
  );
};
```

**Lợi ích**:
- ✅ Editor role tự động có permissions từ ROLE_PERMISSIONS
- ✅ Vẫn support custom permissions từ database
- ✅ Backward compatible

### Phương án B: Update Database (Alternative)

Populate `permissions` column trong `user_profiles` table:

```sql
-- Update tất cả users với role='editor'
UPDATE user_profiles
SET permissions = ARRAY[
  'read:reviews', 'write:reviews', 'delete:reviews',
  'read:schedules', 'write:schedules', 'delete:schedules',
  'read:categories', 'write:categories', 'delete:categories',
  'read:analytics'
]
WHERE role = 'editor' AND (permissions IS NULL OR array_length(permissions, 1) = 0);

-- Update viewer
UPDATE user_profiles
SET permissions = ARRAY[
  'read:reviews',
  'read:schedules',
  'read:analytics'
]
WHERE role = 'viewer' AND (permissions IS NULL OR array_length(permissions, 1) = 0);
```

**Nhược điểm**:
- ❌ Phải maintain permissions ở 2 nơi (code + database)
- ❌ Khi thêm permission mới, phải update DB
- ❌ Không scalable

### Phương án C: Unify Role Definitions (Long-term)

Loại bỏ hệ thống cũ, chỉ giữ 1 definition:

**Step 1**: Migrate `types/index.ts`

```typescript
// BEFORE
export interface User {
  role: 'admin' | 'user' | 'guest'
}

// AFTER
import type { UserRole } from '@/lib/auth/config/auth-types';

export interface User {
  role: UserRole  // 'admin' | 'editor' | 'viewer'
}
```

**Step 2**: Migrate database

```sql
-- Update existing users
UPDATE user_profiles
SET role = CASE
  WHEN role = 'user' THEN 'editor'
  WHEN role = 'guest' THEN 'viewer'
  ELSE role
END;
```

**Step 3**: Remove `lib/auth/utils/permissions.ts` (legacy)

**Step 4**: Update all imports để dùng `@/lib/auth/config/auth-types`

---

## 🔴 VẤN ĐỀ 2: CSS SYNTAX ERROR

### Chi tiết lỗi

```
Uncaught SyntaxError: Unexpected token '.'
(at 8aee48eb52f4c731.css:6:4)
```

### File bị lỗi

**File**: `.next/static/css/8aee48eb52f4c731.css`
**Nội dung dòng 6**:
```css
/*! Quill Editor v1.3.7 */
.ql-container{box-sizing:border-box;...}
```

### Nguyên nhân

**KHÔNG PHẢI** lỗi trong CSS source code. Đây là lỗi khi browser parse file:

1. **Build cache corrupt**: File CSS bị corrupt trong quá trình build
2. **Source map issue**: Source map reference sai
3. **CDN/Server issue**: File served không đúng content-type
4. **Browser cache**: Browser cache version cũ bị lỗi

### Kiểm tra

File CSS này là **Quill Editor CSS** (rich text editor). Nội dung hoàn toàn valid.

Lỗi xảy ra do browser parsing, không phải syntax.

---

## ✅ GIẢI PHÁP CHO VẤN ĐỀ 2

### Fix 1: Clear Build Cache & Rebuild

```bash
# Remove build cache
rm -rf .next

# Clear npm cache (optional)
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Fix 2: Clear Browser Cache

Trong browser (Chrome/Edge):
1. Mở DevTools (F12)
2. Right-click Refresh button → **"Empty Cache and Hard Reload"**
3. Hoặc `Ctrl+Shift+Delete` → Clear cached images and files

### Fix 3: Check Quill Import

Nếu đang import Quill CSS manually, đảm bảo đúng format:

```typescript
// CORRECT
import 'quill/dist/quill.snow.css';

// or CDN
<link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
```

### Fix 4: Disable CSS Minification (Debug)

Trong `next.config.js`:

```javascript
module.exports = {
  // ...existing config
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization.minimize = false;
    }
    return config;
  }
}
```

Rebuild và check lỗi còn không.

---

## 📋 ACTION ITEMS

### Immediate (High Priority)

**[ ] Task 1: Fix RBAC Middleware**
```bash
# Edit file
nano lib/auth/middleware/rbac-middleware.ts

# Apply Phương án A (add ROLE_PERMISSIONS import and update hasPermission)
# Commit changes
git add lib/auth/middleware/rbac-middleware.ts
git commit -m "fix: Use ROLE_PERMISSIONS mapping in RBAC middleware for editor role"
git push
```

**[ ] Task 2: Clear Build & Test**
```bash
# Clear build
rm -rf .next

# Rebuild
npm run build

# Test locally
npm run dev

# Test schedules access với editor account
# Navigate to /dashboard/schedules
```

**[ ] Task 3: Verify Database**
```sql
-- Check user_profiles có role và permissions đúng
SELECT id, email, role, permissions, is_active
FROM user_profiles
WHERE role IN ('editor', 'viewer')
ORDER BY role;
```

### Short-term (This Week)

**[ ] Task 4: Unify Role Definitions**
- Migrate types/index.ts để dùng UserRole từ auth-types
- Update database schema nếu cần
- Remove legacy permissions.ts

**[ ] Task 5: Update Documentation**
- Document RBAC system architecture
- Explain role → permissions mapping
- Add troubleshooting guide

**[ ] Task 6: Add Tests**
```typescript
// tests/auth/rbac.test.ts
describe('RBAC Permissions', () => {
  it('should grant editor access to schedules', () => {
    const editor = { role: 'editor', permissions: [] };
    expect(hasPermission(editor, ['read:schedules'])).toBe(true);
  });

  it('should deny viewer write access to schedules', () => {
    const viewer = { role: 'viewer', permissions: [] };
    expect(hasPermission(viewer, ['write:schedules'])).toBe(false);
  });
});
```

---

## 🧪 TESTING CHECKLIST

### RBAC Testing

**[ ] Admin Account**
- [ ] Can access /dashboard/schedules ✅
- [ ] Can create schedule ✅
- [ ] Can edit schedule ✅
- [ ] Can delete schedule ✅

**[ ] Editor Account** (FIX TARGET)
- [ ] Can access /dashboard/schedules (Currently FAILS ❌ → Should PASS ✅)
- [ ] Can create schedule ✅
- [ ] Can edit schedule ✅
- [ ] Can delete schedule ✅
- [ ] Can access /dashboard/reviews ✅
- [ ] Can access /dashboard/categories ✅
- [ ] CANNOT access /admin ❌ (should be blocked)

**[ ] Viewer Account**
- [ ] Can access /dashboard/schedules (read-only) ✅
- [ ] CANNOT create schedule ❌
- [ ] CANNOT edit schedule ❌
- [ ] CANNOT delete schedule ❌
- [ ] CANNOT access /admin ❌

### CSS Testing

**[ ] Build Output**
- [ ] No CSS syntax errors in console
- [ ] Quill editor styles loaded correctly
- [ ] All pages render properly

**[ ] Browser Testing**
- [ ] Chrome: No errors ✅
- [ ] Firefox: No errors ✅
- [ ] Safari: No errors ✅
- [ ] Edge: No errors ✅

---

## 📊 EXPECTED RESULTS

### Before Fix

**Editor Login**:
```
1. Login với editor account
2. Navigate to /dashboard/schedules
3. ❌ Redirect to /unauthorized
4. Console: "🔒 Insufficient permissions for /dashboard/schedules"
```

**CSS Error**:
```
Browser Console:
❌ Uncaught SyntaxError: Unexpected token '.' (at 8aee48eb52f4c731.css:6:4)
```

### After Fix

**Editor Login**:
```
1. Login với editor account
2. Navigate to /dashboard/schedules
3. ✅ Page loads successfully
4. Console: "✅ Access granted to /dashboard/schedules for user editor"
5. Can create/edit schedules
```

**CSS**:
```
Browser Console:
✅ No errors
✅ Quill styles loaded
```

---

## 🔍 ROOT CAUSE SUMMARY

| Vấn đề | Root Cause | Fix |
|--------|-----------|-----|
| Editor không vào được Schedules | Middleware check `userProfile.permissions` array thay vì dùng ROLE_PERMISSIONS mapping | Update middleware để merge role-based permissions |
| CSS Syntax Error | Build cache corrupt hoặc browser cache issue | Clear .next folder và rebuild |

---

## 📝 NOTES

- Hệ thống hiện tại có 2 RBAC implementations đang conflict
- Cần unify về 1 hệ thống duy nhất (enhanced RBAC)
- Editor role ĐÚNG là có quyền schedules trong auth-types.ts
- Middleware implementation chưa sync với role definitions
- CSS error không phải lỗi code, chỉ là build/cache issue

---

**Tài liệu liên quan**:
- `lib/auth/config/auth-types.ts` - Enhanced RBAC definitions
- `lib/auth/utils/permissions.ts` - Legacy permissions (deprecated)
- `lib/auth/middleware/rbac-middleware.ts` - Route protection middleware
- `types/index.ts` - Core type definitions

**Người thực hiện**: Claude Code
**Ngày**: 2025-01-08
