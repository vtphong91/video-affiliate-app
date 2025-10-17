# Hướng dẫn Quản lý Thành viên với Soft Delete

## Tổng quan

Hệ thống sử dụng **soft delete** thay vì xóa vĩnh viễn để đảm bảo an toàn dữ liệu và có thể khôi phục khi cần.

## Tính năng mới

### 1. Soft Delete (Vô hiệu hóa)
- **Endpoint**: `DELETE /api/admin/members/{id}`
- **Chức năng**: Đặt `is_active = false` thay vì xóa record
- **Hiệu ứng**:
  - ✅ User không thể đăng nhập
  - ✅ Dữ liệu vẫn được giữ lại (reviews, schedules, activity logs)
  - ✅ Có thể khôi phục sau này
  - ✅ RLS policies ngăn user truy cập resources

### 2. Restore (Khôi phục)
- **Endpoint**: `POST /api/admin/members/{id}/restore`
- **Chức năng**: Đặt `is_active = true`
- **Hiệu ứng**:
  - ✅ User có thể đăng nhập lại
  - ✅ Khôi phục toàn bộ quyền truy cập
  - ✅ Tất cả dữ liệu cũ vẫn còn nguyên

### 3. Validations
- **Ngăn tự xóa**: Admin không thể vô hiệu hóa chính mình
- **Kiểm tra trạng thái**: Không thể xóa user đã bị vô hiệu hóa
- **Activity logs**: Ghi lại mọi thao tác xóa/khôi phục

## Cách sử dụng UI

### Vô hiệu hóa thành viên

1. Đăng nhập với tài khoản admin
2. Vào **Admin Panel** → **Quản lý thành viên**
3. Tìm thành viên cần vô hiệu hóa
4. Click nút **Trash** (Thùng rác) màu đỏ
5. Xác nhận trong dialog:
   ```
   Bạn có chắc muốn vô hiệu hóa thành viên "Tên"?

   Thành viên sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.
   Bạn có thể khôi phục sau này.
   ```
6. Thành viên hiển thị badge **"Đã vô hiệu hóa"** màu đỏ

### Khôi phục thành viên

1. Vào **Admin Panel** → **Quản lý thành viên**
2. Tìm thành viên có badge **"Đã vô hiệu hóa"**
3. Click nút **"Khôi phục"** (với icon RotateCcw) màu xanh
4. Xác nhận trong dialog:
   ```
   Bạn có chắc muốn khôi phục thành viên "Tên"?

   Thành viên sẽ có thể đăng nhập lại sau khi khôi phục.
   ```
5. Thành viên quay lại trạng thái **"Hoạt động"**

### Lọc thành viên theo trạng thái

Sử dụng dropdown **"Tất cả trạng thái"**:
- **Tất cả trạng thái**: Hiển thị cả active và inactive
- **Hoạt động**: Chỉ user có thể đăng nhập
- **Không hoạt động**: Chỉ user đã bị vô hiệu hóa

## API Reference

### DELETE /api/admin/members/{id}

**Request:**
```bash
curl -X DELETE https://your-domain.com/api/admin/members/{id} \
  -H "Authorization: Bearer {access_token}"
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã vô hiệu hóa thành viên thành công. Thành viên không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": false,
    "updated_at": "2025-10-16T10:30:00Z"
  },
  "timestamp": "2025-10-16T10:30:00Z"
}
```

**Error cases:**
- `400`: Không thể tự xóa chính mình
- `400`: Thành viên đã bị vô hiệu hóa trước đó
- `404`: Không tìm thấy thành viên
- `401`: Chưa đăng nhập hoặc không có quyền admin

### POST /api/admin/members/{id}/restore

**Request:**
```bash
curl -X POST https://your-domain.com/api/admin/members/{id}/restore \
  -H "Authorization: Bearer {access_token}"
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã khôi phục thành viên thành công. Thành viên có thể đăng nhập lại.",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "is_active": true,
    "updated_at": "2025-10-16T10:35:00Z"
  },
  "timestamp": "2025-10-16T10:35:00Z"
}
```

**Error cases:**
- `400`: Thành viên này đang hoạt động
- `404`: Không tìm thấy thành viên
- `401`: Chưa đăng nhập hoặc không có quyền admin

## Database Schema

### user_profiles table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true,  -- ⭐ Soft delete flag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Activity Logs

Mỗi thao tác xóa/khôi phục được ghi log:

**Soft delete:**
```json
{
  "type": "user.soft_delete",
  "title": "Vô hiệu hóa thành viên",
  "description": "Đã vô hiệu hóa thành viên user@example.com (Tên)",
  "metadata": {
    "target_user_id": "uuid",
    "target_user_email": "user@example.com",
    "target_user_name": "Tên",
    "previous_role": "editor"
  }
}
```

**Restore:**
```json
{
  "type": "user.restore",
  "title": "Khôi phục thành viên",
  "description": "Đã khôi phục thành viên user@example.com (Tên)",
  "metadata": {
    "target_user_id": "uuid",
    "target_user_email": "user@example.com",
    "target_user_name": "Tên",
    "role": "editor"
  }
}
```

## Row Level Security (RLS)

Các RLS policies đảm bảo user bị vô hiệu hóa không thể truy cập:

### user_profiles
```sql
-- User chỉ xem được profile của mình NẾU is_active = true
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id AND is_active = true);
```

### reviews, schedules, activity_logs
```sql
-- User chỉ truy cập resources của mình NẾU is_active = true
CREATE POLICY "Users can manage own reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.id = reviews.user_id
            AND up.is_active = true
        )
    );
```

## Migration Steps

### Bước 1: Apply RLS policies mới

```bash
# Chạy migration SQL
psql -h your-supabase-host -U postgres -d postgres -f sql/add-rls-policy-for-inactive-users.sql
```

### Bước 2: Test soft delete

```bash
# 1. Vô hiệu hóa user test
curl -X DELETE https://your-domain.com/api/admin/members/{test_user_id} \
  -H "Authorization: Bearer {admin_token}"

# 2. Thử đăng nhập với user bị vô hiệu hóa → Phải thất bại
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# 3. Khôi phục user
curl -X POST https://your-domain.com/api/admin/members/{test_user_id}/restore \
  -H "Authorization: Bearer {admin_token}"

# 4. Thử đăng nhập lại → Phải thành công
```

### Bước 3: Verify trong database

```sql
-- Kiểm tra user bị vô hiệu hóa
SELECT id, email, full_name, role, is_active
FROM user_profiles
WHERE is_active = false;

-- Kiểm tra activity logs
SELECT type, title, description, created_at
FROM activity_logs
WHERE type IN ('user.soft_delete', 'user.restore')
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### User vẫn đăng nhập được sau khi soft delete

**Nguyên nhân**: RLS policies chưa được apply hoặc chưa đúng

**Giải pháp**:
1. Chạy lại migration: `sql/add-rls-policy-for-inactive-users.sql`
2. Kiểm tra policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```
3. Clear session cache trong Supabase

### Không thể khôi phục user

**Nguyên nhân**: User không tồn tại hoặc đã active

**Giải pháp**:
1. Kiểm tra user trong database:
   ```sql
   SELECT * FROM user_profiles WHERE id = '{user_id}';
   ```
2. Check response error message từ API

### Admin tự xóa chính mình

**Nguyên nhân**: Validation không hoạt động

**Giải pháp**: Check code tại [app/api/admin/members/[id]/route.ts:183-193](app/api/admin/members/[id]/route.ts#L183-L193)

## Best Practices

1. **Backup trước khi xóa nhiều user**: Xuất danh sách user ra CSV
2. **Review activity logs thường xuyên**: Theo dõi ai xóa/khôi phục user
3. **Cleanup định kỳ**: Xóa vĩnh viễn user inactive > 90 ngày (nếu cần)
4. **Test trên staging trước**: Đừng test trực tiếp trên production

## Files Changed

- `app/api/admin/members/[id]/route.ts` - Soft delete logic
- `app/api/admin/members/[id]/restore/route.ts` - Restore endpoint (NEW)
- `app/admin/members/page.tsx` - UI with restore button
- `sql/add-rls-policy-for-inactive-users.sql` - RLS policies (NEW)

## Support

Nếu gặp vấn đề, kiểm tra:
1. Console logs trong browser (F12)
2. Vercel deployment logs
3. Supabase logs (Database → Logs)
4. Activity logs table
