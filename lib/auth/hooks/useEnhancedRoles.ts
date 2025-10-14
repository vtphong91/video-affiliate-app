/**
 * Enhanced Roles Hook for Member Management System
 * Provides comprehensive role-based functionality and permission checking
 */

import { useAuth } from '../SupabaseAuthProvider';
import { ROLE_PERMISSIONS, ROLE_DISPLAY_NAMES, ROLE_COLORS, PERMISSION_DESCRIPTIONS } from '../config/auth-types';
import type { UserRole, Permission } from '../config/auth-types';

export const useRoles = () => {
  const { user, userProfile, hasRole, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Get current user role
  const getCurrentRole = (): UserRole | null => {
    if (!userProfile) return null;
    return userProfile.role as UserRole || null;
  };

  // Check if user has specific role
  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!userProfile) return false;
    const userRole = getCurrentRole();
    return userRole ? roles.includes(userRole) : false;
  };

  // Check if user has specific permission
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermissionList = (permissions: Permission[]): boolean => {
    if (!userProfile) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissionsList = (permissions: Permission[]): boolean => {
    if (!userProfile) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  // Get permissions for current user role
  const getRolePermissions = (): Permission[] => {
    const userRole = getCurrentRole();
    if (!userRole) return [];
    return ROLE_PERMISSIONS[userRole] || [];
  };

  // Check if user can access admin features
  const canAccessAdmin = (): boolean => {
    return checkRole('admin');
  };

  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasAnyPermissionList(['write:users', 'delete:users', 'admin:all']);
  };

  // Check if user can manage reviews
  const canManageReviews = (): boolean => {
    return hasAnyPermissionList(['write:reviews', 'delete:reviews', 'admin:all']);
  };

  // Check if user can manage schedules
  const canManageSchedules = (): boolean => {
    return hasAnyPermissionList(['write:schedules', 'delete:schedules', 'admin:all']);
  };

  // Check if user can manage categories
  const canManageCategories = (): boolean => {
    return hasAnyPermissionList(['write:categories', 'delete:categories', 'admin:all']);
  };

  // Check if user can view analytics
  const canViewAnalytics = (): boolean => {
    return hasAnyPermissionList(['read:analytics', 'admin:all']);
  };

  // Check if user can manage settings
  const canManageSettings = (): boolean => {
    return hasAnyPermissionList(['write:settings', 'admin:all']);
  };

  // Check if user can view audit logs
  const canViewAuditLogs = (): boolean => {
    return hasAnyPermissionList(['read:audit_logs', 'admin:all']);
  };

  // Get role display name
  const getRoleDisplayName = (role?: UserRole): string => {
    const roleToDisplay = role || getCurrentRole();
    
    if (!roleToDisplay) return 'Không xác định';
    return ROLE_DISPLAY_NAMES[roleToDisplay] || 'Không xác định';
  };

  // Get role color for UI
  const getRoleColor = (role?: UserRole): string => {
    const roleToDisplay = role || getCurrentRole();
    
    if (!roleToDisplay) return 'bg-gray-100 text-gray-800 border-gray-200';
    return ROLE_COLORS[roleToDisplay] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get permission description
  const getPermissionDescription = (permission: Permission): string => {
    return PERMISSION_DESCRIPTIONS[permission] || permission;
  };

  // Check if user can perform action on resource
  const canPerformAction = (action: string, resource: string): boolean => {
    const permission = `${action}:${resource}` as Permission;
    return hasPermission(permission);
  };

  // Get accessible routes based on role
  const getAccessibleRoutes = (): string[] => {
    const routes = ['/'];
    
    if (checkRole('viewer') || checkRole('editor') || checkRole('admin')) {
      routes.push('/dashboard', '/reviews', '/schedules');
    }
    
    if (checkRole('editor') || checkRole('admin')) {
      routes.push('/dashboard/create');
    }
    
    if (checkRole('admin')) {
      routes.push('/admin', '/admin/members', '/admin/roles', '/admin/permissions', '/admin/settings');
    }
    
    return routes;
  };

  // Check if route is accessible
  const isRouteAccessible = (route: string): boolean => {
    const accessibleRoutes = getAccessibleRoutes();
    return accessibleRoutes.includes(route);
  };

  // Check if user is active
  const isUserActive = (): boolean => {
    return userProfile?.is_active !== false;
  };

  // Get user status
  const getUserStatus = (): 'active' | 'inactive' | 'unknown' => {
    if (!userProfile) return 'unknown';
    return userProfile.is_active !== false ? 'active' : 'inactive';
  };

  return {
    // Role data
    currentRole: getCurrentRole(),
    roleDisplayName: getRoleDisplayName(),
    roleColor: getRoleColor(),
    rolePermissions: getRolePermissions(),
    
    // Role checking
    checkRole,
    hasAnyRole,
    checkPermission,
    hasAnyPermission: hasAnyPermissionList,
    hasAllPermissions: hasAllPermissionsList,
    
    // Permission checking
    canAccessAdmin,
    canManageUsers,
    canManageReviews,
    canManageSchedules,
    canManageCategories,
    canViewAnalytics,
    canManageSettings,
    canViewAuditLogs,
    canPerformAction,
    
    // Utility functions
    getRoleDisplayName,
    getRoleColor,
    getPermissionDescription,
    
    // Route access
    accessibleRoutes: getAccessibleRoutes(),
    isRouteAccessible,
    
    // User status
    isUserActive,
    getUserStatus,
  };
};
