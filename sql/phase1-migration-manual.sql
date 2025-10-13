-- Simple migration script for Phase 1
-- Run this in Supabase SQL Editor

-- 1. Update user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert default roles
INSERT INTO roles (name, display_name, description, permissions, is_system_role) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản trị hệ thống', '[
    "admin:all",
    "read:users", "write:users", "delete:users",
    "read:reviews", "write:reviews", "delete:reviews",
    "read:schedules", "write:schedules", "delete:schedules",
    "read:categories", "write:categories", "delete:categories",
    "read:analytics", "write:analytics",
    "read:settings", "write:settings"
]', true),
('editor', 'Biên tập viên', 'Quản lý nội dung và lịch đăng bài', '[
    "read:reviews", "write:reviews", "delete:reviews",
    "read:schedules", "write:schedules", "delete:schedules",
    "read:categories", "write:categories", "delete:categories",
    "read:analytics"
]', true),
('viewer', 'Người xem', 'Chỉ xem nội dung', '[
    "read:reviews",
    "read:schedules",
    "read:analytics"
]', true)
ON CONFLICT (name) DO NOTHING;

-- 5. Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
('admin:all', 'Toàn quyền', 'Toàn quyền truy cập hệ thống', 'system', 'admin'),
('read:users', 'Xem thành viên', 'Xem danh sách thành viên', 'users', 'read'),
('write:users', 'Quản lý thành viên', 'Thêm, sửa thành viên', 'users', 'write'),
('delete:users', 'Xóa thành viên', 'Xóa thành viên khỏi hệ thống', 'users', 'delete'),
('read:reviews', 'Xem reviews', 'Xem danh sách reviews', 'reviews', 'read'),
('write:reviews', 'Quản lý reviews', 'Tạo, sửa reviews', 'reviews', 'write'),
('delete:reviews', 'Xóa reviews', 'Xóa reviews', 'reviews', 'delete'),
('read:schedules', 'Xem lịch đăng bài', 'Xem lịch đăng bài', 'schedules', 'read'),
('write:schedules', 'Quản lý lịch đăng bài', 'Tạo, sửa lịch đăng bài', 'schedules', 'write'),
('delete:schedules', 'Xóa lịch đăng bài', 'Xóa lịch đăng bài', 'schedules', 'delete'),
('read:categories', 'Xem danh mục', 'Xem danh sách danh mục', 'categories', 'read'),
('write:categories', 'Quản lý danh mục', 'Tạo, sửa danh mục', 'categories', 'write'),
('delete:categories', 'Xóa danh mục', 'Xóa danh mục', 'categories', 'delete'),
('read:analytics', 'Xem thống kê', 'Xem báo cáo và thống kê', 'analytics', 'read'),
('write:analytics', 'Quản lý thống kê', 'Tạo, sửa báo cáo', 'analytics', 'write'),
('read:settings', 'Xem cài đặt', 'Xem cài đặt hệ thống', 'settings', 'read'),
('write:settings', 'Quản lý cài đặt', 'Thay đổi cài đặt hệ thống', 'settings', 'write')
ON CONFLICT (name) DO NOTHING;

-- 6. Update existing user to admin role (replace with your actual user ID)
-- First, let's check what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- Then update the first user to admin (you'll need to replace the ID)
-- UPDATE user_profiles 
-- SET role = 'admin', permissions = '["admin:all"]'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);

-- 8. Test the migration
SELECT 'Migration completed successfully!' as status;

-- Check the results
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'permissions' as table_name, COUNT(*) as count FROM permissions;
