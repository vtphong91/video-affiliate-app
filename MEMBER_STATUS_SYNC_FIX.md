# Member Status Synchronization Fix

**Date**: 2025-01-09
**Issue**: User account shows "pending" status in "Duyệt đăng ký" module despite being active and able to access dashboard/reviews
**Severity**: High - Blocks editor users from accessing schedules module

---

## 🔍 Root Cause Analysis

### Problem Description

User với role `editor` đã có thể truy cập dashboard và module reviews, nhưng:
1. Trong module "Duyệt đăng ký" (`/admin/members-new`), user vẫn hiển thị status = `'pending'`
2. Khi truy cập module "Tạo lịch đăng bài" (`/dashboard/schedules`), bị lỗi 403: **"User account is not active"**

### Root Cause

**Vấn đề đồng bộ giữa 2 fields trong `user_profiles` table:**

```typescript
// user_profiles table có 2 trạng thái:
is_active: boolean     // true = có thể truy cập hệ thống
status: string         // 'pending' | 'approved' | 'active' | 'rejected' | 'inactive'
```

**API schedules kiểm tra CẢ 2 điều kiện** (`app/api/schedules/route.ts:92-101`):

```typescript
if (!userProfile.is_active || userProfile.status !== 'active') {
  return NextResponse.json({ error: 'User account is not active' }, { status: 403 });
}
```

**Conflict xảy ra do 2 modules không đồng bộ:**

1. **Module "Duyệt đăng ký"** (`/admin/members-new`):
   - Khi approve user → Call `/api/admin/users/[id]/approve`
   - API này call database RPC function `approve_user()`
   - Function set: `is_active = true` AND `status = 'active'` ✅

2. **Module "Danh sách thành viên"** (`/admin/members`):
   - Khi edit member → Call `PUT /api/admin/members/[id]`
   - API chỉ update: `is_active = true`
   - **BUG**: Không update `status` → Status vẫn giữ `'pending'` ❌

**Kết quả**:
- `is_active = true` (user có thể login)
- `status = 'pending'` (user vẫn bị coi là chưa active)
- API schedules reject vì `status !== 'active'`

---

## ✅ Solutions Implemented

### 1. Fix API PUT `/api/admin/members/[id]` - Đồng bộ `is_active` và `status`

**File**: `app/api/admin/members/[id]/route.ts`

**Changes** (Lines 84-98):

```typescript
const updateData: Partial<EnhancedUserProfile> & { status?: string } = {
  updated_at: new Date().toISOString()
};

if (full_name !== undefined) updateData.full_name = full_name;
if (role !== undefined) updateData.role = role;
if (permissions !== undefined) updateData.permissions = permissions;
if (is_active !== undefined) {
  updateData.is_active = is_active;
  // ✅ FIX: Sync status with is_active to prevent inconsistency
  // When activating user, set status to 'active'
  // When deactivating user, set status to 'inactive'
  updateData.status = is_active ? 'active' : 'inactive';
  console.log(`🔄 Syncing status with is_active: ${updateData.status}`);
}
```

**Logic**:
- Khi admin set `is_active = true` → Tự động set `status = 'active'`
- Khi admin set `is_active = false` → Tự động set `status = 'inactive'`
- Đảm bảo 2 fields luôn đồng bộ

### 2. Thêm Edit Functionality vào Module "Duyệt đăng ký"

**File**: `app/admin/members-new/page.tsx`

**Added Features**:

1. **State management** (Lines 105-108):
   ```typescript
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [selectedMember, setSelectedMember] = useState<Member | null>(null);
   const [isUpdating, setIsUpdating] = useState(false);
   ```

2. **Edit functions** (Lines 331-377):
   ```typescript
   const openEditDialog = (member: Member) => {
     setSelectedMember(member);
     setEditDialogOpen(true);
   };

   const updateMember = async () => {
     // Call PUT /api/admin/members/[id]
     // Update: full_name, role, is_active
   };
   ```

3. **Edit button handler** (Line 583):
   ```typescript
   <Button onClick={() => openEditDialog(member)}>
     <Edit className="h-4 w-4" />
   </Button>
   ```

4. **Edit Dialog UI** (Lines 785-904):
   - Form để edit: full_name, role, is_active (status)
   - Hiển thị permissions info theo role
   - Validation và error handling

**Benefits**:
- Admin có thể edit member trực tiếp từ tab "Thành viên"
- Không cần chuyển sang module "Danh sách thành viên"
- Tất cả thao tác edit đều sync `is_active` với `status`

### 3. Thêm Menu "Duyệt đăng ký" vào Sidebar Admin

**File**: `app/admin/layout.tsx`

**Changes**:

1. **Import icon** (Line 22):
   ```typescript
   import { UserCheck } from 'lucide-react';
   ```

2. **Add menu item** (Lines 62-67):
   ```typescript
   {
     title: 'Duyệt đăng ký',
     href: '/admin/members-new',
     icon: UserCheck,
     permission: 'read:users',
   },
   ```

3. **Update page title** (Lines 301, 311):
   ```typescript
   pathname.includes('/members-new') ? '✅ Duyệt đăng ký' : ...
   pathname.includes('/members-new') ? 'Duyệt và quản lý đăng ký thành viên mới' : ...
   ```

**Benefits**:
- Menu "Duyệt đăng ký" hiển thị trong sidebar admin panel
- Dễ dàng access từ admin panel
- Consistent navigation experience

---

## 📋 Testing Checklist

### Test Case 1: Edit Member in "Danh sách thành viên"

1. Login với admin account
2. Navigate: `/admin/members`
3. Click "Chỉnh sửa" trên 1 member có status = 'pending'
4. Set "Trạng thái" = "Hoạt động" (is_active = true)
5. Click "Cập nhật"

**Expected Results**:
- ✅ Member `is_active` updated to `true`
- ✅ Member `status` auto-updated to `'active'`
- ✅ Console log: `🔄 Syncing status with is_active: active`
- ✅ Member hiển thị badge "Hoạt động" trong "Duyệt đăng ký"

### Test Case 2: Edit Member in "Duyệt đăng ký"

1. Login với admin account
2. Navigate: `/admin/members-new`
3. Click tab "Thành viên"
4. Click button "Edit" (icon bút chì)
5. Edit dialog mở ra
6. Change role hoặc status
7. Click "Cập nhật"

**Expected Results**:
- ✅ Edit dialog opens with pre-filled data
- ✅ Changes saved successfully
- ✅ `is_active` và `status` được đồng bộ
- ✅ Table refresh với data mới

### Test Case 3: Editor Access Schedules Module

1. Login với editor account (đã được admin activate)
2. Navigate: `/dashboard/schedules`

**Expected Results**:
- ✅ Page loads successfully (không bị 403)
- ✅ Editor có thể view schedules
- ✅ Editor có thể create new schedule
- ✅ Editor có thể edit/delete schedules

### Test Case 4: Menu Navigation

1. Login với admin account
2. Check sidebar menu

**Expected Results**:
- ✅ Menu "Duyệt đăng ký" xuất hiện trong sidebar
- ✅ Icon UserCheck hiển thị đúng
- ✅ Click menu navigate đến `/admin/members-new`
- ✅ Active state highlight khi ở trang này

---

## 🔧 Database Migration (If Needed)

Nếu có users hiện tại bị stuck với `is_active = true` nhưng `status = 'pending'`, chạy SQL này:

```sql
-- Fix existing users with inconsistent status
UPDATE user_profiles
SET status = 'active'
WHERE is_active = true AND status = 'pending';

-- Verify fix
SELECT id, email, role, is_active, status
FROM user_profiles
WHERE is_active = true;
```

**Script đã tạo sẵn**: `sql/fix-editor-user-active.sql`

---

## 📊 Files Modified

| File | Type | Changes |
|------|------|---------|
| `app/api/admin/members/[id]/route.ts` | API | Added status sync logic when updating is_active |
| `app/admin/members-new/page.tsx` | UI | Added edit dialog and functionality |
| `app/admin/layout.tsx` | Layout | Added "Duyệt đăng ký" menu item |
| `sql/fix-editor-user-active.sql` | Migration | SQL script to fix existing data |

---

## 🎯 Impact Analysis

### Before Fix

- ❌ Editor users có `is_active = true` nhưng `status = 'pending'`
- ❌ Bị block access `/dashboard/schedules` với 403 error
- ❌ Module "Duyệt đăng ký" thiếu edit functionality
- ❌ Không có menu shortcut đến module "Duyệt đăng ký"
- ❌ Admin phải manually check và fix database

### After Fix

- ✅ Tự động sync `status` với `is_active` khi update
- ✅ Editor users có thể access schedules module
- ✅ Admin có thể edit members trực tiếp trong "Duyệt đăng ký"
- ✅ Menu "Duyệt đăng ký" accessible từ sidebar
- ✅ Consistent user experience across modules

---

## 🚀 Deployment Steps

1. **Merge PR với các changes trên**
2. **Deploy to Vercel** (auto-deploy from master branch)
3. **Run migration SQL** (nếu cần fix existing data):
   ```bash
   # In Supabase SQL Editor
   # Run: sql/fix-editor-user-active.sql
   ```
4. **Test với editor account**:
   - Login → Access schedules → Create schedule → Verify success
5. **Monitor logs** for `🔄 Syncing status` messages

---

## 📝 Notes

- **Backward Compatibility**: Fix không break existing functionality
- **Data Consistency**: Tất cả user updates giờ sẽ sync is_active với status
- **UI/UX**: Consistent edit experience across admin modules
- **Performance**: Không có impact đến performance (chỉ 1 field update thêm)

---

## 🔗 Related Issues

- Initial issue: "User account is not active" khi editor truy cập schedules
- Related: RBAC permission fix (đã fix trước đó)
- Related: CSS syntax error (build cache - đã fix)

---

## ✨ Next Steps

1. ✅ Test thoroughly trên staging/production
2. ✅ Monitor error logs for any 403 errors từ editor users
3. ⚠️ Consider unifying status field - Có thể merge `is_active` và `status` thành 1 field duy nhất trong tương lai
4. ⚠️ Document user lifecycle: pending → approved/active → inactive

---

**Fix completed by**: Claude
**Reviewed by**: Pending user verification
**Status**: Ready for testing
