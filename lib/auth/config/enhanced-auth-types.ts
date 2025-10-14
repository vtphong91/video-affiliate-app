// Enhanced Auth Types for Member Management System
// lib/auth/config/enhanced-auth-types.ts

export type UserRole = 'admin' | 'editor' | 'viewer';
export type Permission = 
  // System permissions
  | 'admin:all'
  // User management
  | 'read:users' | 'write:users' | 'delete:users'
  // Review management
  | 'read:reviews' | 'write:reviews' | 'delete:reviews'
  // Schedule management
  | 'read:schedules' | 'write:schedules' | 'delete:schedules'
  // Category management
  | 'read:categories' | 'write:categories' | 'delete:categories'
  // Analytics
  | 'read:analytics' | 'write:analytics'
  // Settings
  | 'read:settings' | 'write:settings'
  // Audit logs
  | 'read:audit_logs';

export interface EnhancedUserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  permissions: Permission[];
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionEntity {
  id: string;
  name: string;
  display_name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'admin:all',
    'read:users', 'write:users', 'delete:users',
    'read:reviews', 'write:reviews', 'delete:reviews',
    'read:schedules', 'write:schedules', 'delete:schedules',
    'read:categories', 'write:categories', 'delete:categories',
    'read:analytics', 'write:analytics',
    'read:settings', 'write:settings',
    'read:audit_logs'
  ],
  editor: [
    'read:reviews', 'write:reviews', 'delete:reviews',
    'read:schedules', 'write:schedules', 'delete:schedules',
    'read:categories', 'write:categories', 'delete:categories',
    'read:analytics'
  ],
  viewer: [
    'read:reviews',
    'read:schedules',
    'read:analytics'
  ]
};

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'admin:all': 'Toàn quyền truy cập hệ thống',
  'read:users': 'Xem danh sách thành viên',
  'write:users': 'Thêm, sửa thành viên',
  'delete:users': 'Xóa thành viên khỏi hệ thống',
  'read:reviews': 'Xem danh sách reviews',
  'write:reviews': 'Tạo, sửa reviews',
  'delete:reviews': 'Xóa reviews',
  'read:schedules': 'Xem lịch đăng bài',
  'write:schedules': 'Tạo, sửa lịch đăng bài',
  'delete:schedules': 'Xóa lịch đăng bài',
  'read:categories': 'Xem danh sách danh mục',
  'write:categories': 'Tạo, sửa danh mục',
  'delete:categories': 'Xóa danh mục',
  'read:analytics': 'Xem báo cáo và thống kê',
  'write:analytics': 'Tạo, sửa báo cáo',
  'read:settings': 'Xem cài đặt hệ thống',
  'write:settings': 'Thay đổi cài đặt hệ thống',
  'read:audit_logs': 'Xem nhật ký hoạt động'
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  editor: 'Biên tập viên',
  viewer: 'Người xem'
};

// Role colors for UI
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  editor: 'bg-blue-100 text-blue-800 border-blue-200',
  viewer: 'bg-green-100 text-green-800 border-green-200'
};
