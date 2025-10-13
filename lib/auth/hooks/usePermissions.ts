'use client';

import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useMemo } from 'react';

// Permission types
export type Permission = 
  | 'admin:all'
  | 'read:users' | 'write:users' | 'delete:users'
  | 'read:reviews' | 'write:reviews' | 'delete:reviews'
  | 'read:schedules' | 'write:schedules' | 'delete:schedules'
  | 'read:categories' | 'write:categories' | 'delete:categories'
  | 'read:analytics' | 'write:analytics'
  | 'read:settings' | 'write:settings'
  | 'read:audit_logs';

export type UserRole = 'admin' | 'editor' | 'viewer';

// Permission descriptions
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  'admin:all': 'Toàn quyền quản trị hệ thống',
  'read:users': 'Xem danh sách người dùng',
  'write:users': 'Thêm/sửa người dùng',
  'delete:users': 'Xóa người dùng',
  'read:reviews': 'Xem bài đánh giá',
  'write:reviews': 'Tạo/sửa bài đánh giá',
  'delete:reviews': 'Xóa bài đánh giá',
  'read:schedules': 'Xem lịch trình',
  'write:schedules': 'Tạo/sửa lịch trình',
  'delete:schedules': 'Xóa lịch trình',
  'read:categories': 'Xem danh mục',
  'write:categories': 'Tạo/sửa danh mục',
  'delete:categories': 'Xóa danh mục',
  'read:analytics': 'Xem thống kê',
  'write:analytics': 'Tạo báo cáo thống kê',
  'read:settings': 'Xem cài đặt',
  'write:settings': 'Sửa cài đặt',
  'read:audit_logs': 'Xem nhật ký hệ thống',
};

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
    'read:audit_logs',
  ],
  editor: [
    'read:reviews', 'write:reviews', 'delete:reviews',
    'read:schedules', 'write:schedules', 'delete:schedules',
    'read:categories', 'write:categories', 'delete:categories',
    'read:analytics',
  ],
  viewer: [
    'read:reviews', 'read:schedules', 'read:categories', 'read:analytics',
  ],
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  editor: 'Biên tập viên',
  viewer: 'Người xem',
};

// Role colors
export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-green-100 text-green-700',
};

/**
 * Hook for checking user permissions
 */
export function usePermissions() {
  const { userProfile, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const permissions = useMemo(() => {
    if (!userProfile) return [];
    
    // Admin has all permissions
    if (userProfile.role === 'admin') {
      return Object.keys(PERMISSION_DESCRIPTIONS) as Permission[];
    }
    
    // Get permissions from user profile or role defaults
    return userProfile.permissions || ROLE_PERMISSIONS[userProfile.role as UserRole] || [];
  }, [userProfile]);

  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    return hasAnyPermission(permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    return hasAllPermissions(permissions);
  };

  const canAccessAdmin = (): boolean => {
    return checkPermission('admin:all');
  };

  const canManageUsers = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:users']);
  };

  const canManageReviews = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:reviews']);
  };

  const canManageSchedules = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:schedules']);
  };

  const canViewAnalytics = (): boolean => {
    return checkAnyPermission(['admin:all', 'read:analytics']);
  };

  const canManageSettings = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:settings']);
  };

  return {
    permissions,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    canAccessAdmin,
    canManageUsers,
    canManageReviews,
    canManageSchedules,
    canViewAnalytics,
    canManageSettings,
  };
}

/**
 * Hook for checking user roles
 */
export function useRoles() {
  const { userProfile, hasRole, hasAnyRole } = useAuth();

  const currentRole = useMemo(() => {
    return userProfile?.role as UserRole || 'viewer';
  }, [userProfile]);

  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  const checkAnyRole = (roles: UserRole[]): boolean => {
    return hasAnyRole(roles);
  };

  const isAdmin = (): boolean => {
    return checkRole('admin');
  };

  const isEditor = (): boolean => {
    return checkRole('editor');
  };

  const isViewer = (): boolean => {
    return checkRole('viewer');
  };

  const canAccessAdminPanel = (): boolean => {
    return checkAnyRole(['admin']);
  };

  const canEditContent = (): boolean => {
    return checkAnyRole(['admin', 'editor']);
  };

  return {
    currentRole,
    checkRole,
    checkAnyRole,
    isAdmin,
    isEditor,
    isViewer,
    canAccessAdminPanel,
    canEditContent,
  };
}

/**
 * Hook for route access control
 */
export function useRouteAccess() {
  const { permissions, canAccessAdmin } = usePermissions();
  const { currentRole } = useRoles();

  const getAccessibleRoutes = () => {
    const routes = [];

    // Dashboard routes
    if (permissions.includes('read:reviews') || permissions.includes('read:schedules')) {
      routes.push('/dashboard');
    }

    // Admin routes
    if (canAccessAdmin()) {
      routes.push('/admin');
      routes.push('/admin/members');
      routes.push('/admin/roles');
      routes.push('/admin/permissions');
      routes.push('/admin/settings');
    }

    return routes;
  };

  const isRouteAccessible = (pathname: string): boolean => {
    const accessibleRoutes = getAccessibleRoutes();
    return accessibleRoutes.some(route => pathname.startsWith(route));
  };

  return {
    getAccessibleRoutes,
    isRouteAccessible,
  };
}

/**
 * Hook for user management permissions
 */
export function useUserManagement() {
  const { checkPermission, checkAnyPermission } = usePermissions();

  const canCreateUser = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:users']);
  };

  const canEditUser = (): boolean => {
    return checkAnyPermission(['admin:all', 'write:users']);
  };

  const canDeleteUser = (): boolean => {
    return checkAnyPermission(['admin:all', 'delete:users']);
  };

  const canViewUsers = (): boolean => {
    return checkAnyPermission(['admin:all', 'read:users']);
  };

  const canAssignRoles = (): boolean => {
    return checkPermission('admin:all');
  };

  return {
    canCreateUser,
    canEditUser,
    canDeleteUser,
    canViewUsers,
    canAssignRoles,
  };
}
