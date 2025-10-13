-- Enhanced User Management System Schema
-- Extends existing user_profiles table

-- 1. Update user_profiles table to support new roles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 2. Create roles table for role definitions
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

-- 3. Create permissions table for granular permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- 'users', 'reviews', 'schedules', etc.
    action VARCHAR(50) NOT NULL,   -- 'read', 'write', 'delete', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_roles junction table (for future multi-role support)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- 5. Create user_permissions junction table (for custom permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, permission_id)
);

-- 6. Create audit_logs table for tracking user actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert default roles
INSERT INTO roles (name, display_name, description, permissions, is_system_role) VALUES
('admin', 'Quản trị viên', 'Toàn quyền quản trị hệ thống', '[
    "admin:all",
    "read:users", "write:users", "delete:users",
    "read:reviews", "write:reviews", "delete:reviews",
    "read:schedules", "write:schedules", "delete:schedules",
    "read:categories", "write:categories", "delete:categories",
    "read:analytics", "write:analytics",
    "read:settings", "write:settings",
    "read:audit_logs"
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

-- 8. Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- System permissions
('admin:all', 'Toàn quyền', 'Toàn quyền truy cập hệ thống', 'system', 'admin'),

-- User management permissions
('read:users', 'Xem thành viên', 'Xem danh sách thành viên', 'users', 'read'),
('write:users', 'Quản lý thành viên', 'Thêm, sửa thành viên', 'users', 'write'),
('delete:users', 'Xóa thành viên', 'Xóa thành viên khỏi hệ thống', 'users', 'delete'),

-- Review permissions
('read:reviews', 'Xem reviews', 'Xem danh sách reviews', 'reviews', 'read'),
('write:reviews', 'Quản lý reviews', 'Tạo, sửa reviews', 'reviews', 'write'),
('delete:reviews', 'Xóa reviews', 'Xóa reviews', 'reviews', 'delete'),

-- Schedule permissions
('read:schedules', 'Xem lịch đăng bài', 'Xem lịch đăng bài', 'schedules', 'read'),
('write:schedules', 'Quản lý lịch đăng bài', 'Tạo, sửa lịch đăng bài', 'schedules', 'write'),
('delete:schedules', 'Xóa lịch đăng bài', 'Xóa lịch đăng bài', 'schedules', 'delete'),

-- Category permissions
('read:categories', 'Xem danh mục', 'Xem danh sách danh mục', 'categories', 'read'),
('write:categories', 'Quản lý danh mục', 'Tạo, sửa danh mục', 'categories', 'write'),
('delete:categories', 'Xóa danh mục', 'Xóa danh mục', 'categories', 'delete'),

-- Analytics permissions
('read:analytics', 'Xem thống kê', 'Xem báo cáo và thống kê', 'analytics', 'read'),
('write:analytics', 'Quản lý thống kê', 'Tạo, sửa báo cáo', 'analytics', 'write'),

-- Settings permissions
('read:settings', 'Xem cài đặt', 'Xem cài đặt hệ thống', 'settings', 'read'),
('write:settings', 'Quản lý cài đặt', 'Thay đổi cài đặt hệ thống', 'settings', 'write'),

-- Audit logs permissions
('read:audit_logs', 'Xem nhật ký', 'Xem nhật ký hoạt động', 'audit_logs', 'read')
ON CONFLICT (name) DO NOTHING;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 10. Create RLS policies for security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Admins can update profiles
CREATE POLICY "Admins can update profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Only admins can view roles
CREATE POLICY "Only admins can view roles" ON roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Only admins can manage user roles
CREATE POLICY "Only admins can manage user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Only admins can manage user permissions
CREATE POLICY "Only admins can manage user permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );
