/**
 * Roles Hook
 * Provides role-based functionality and permission checking
 */

import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '../config/auth-types';
import type { UserRole, Permission } from '../config/auth-types';

export const useRoles = () => {
  const { user, hasRole, hasPermission } = useAuth();

  // Get current user role
  const getCurrentRole = (): UserRole | null => {
    if (!user) return null;
    return user.profile?.role || user.role || null;
  };

  // Check if user has specific role
  const checkRole = (role: UserRole): boolean => {
    return hasRole(role);
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    const userRole = getCurrentRole();
    return userRole ? roles.includes(userRole) : false;
  };

  // Check if user has specific permission
  const checkPermission = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
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
    return hasAnyPermission(['write:users', 'delete:users', 'admin:all']);
  };

  // Check if user can manage reviews
  const canManageReviews = (): boolean => {
    return hasAnyPermission(['write:reviews', 'delete:reviews', 'admin:all']);
  };

  // Check if user can manage schedules
  const canManageSchedules = (): boolean => {
    return hasAnyPermission(['write:schedules', 'delete:schedules', 'admin:all']);
  };

  // Check if user can view analytics
  const canViewAnalytics = (): boolean => {
    return hasAnyPermission(['read:analytics', 'admin:all']);
  };

  // Check if user can manage settings
  const canManageSettings = (): boolean => {
    return hasAnyPermission(['write:settings', 'admin:all']);
  };

  // Get role display name
  const getRoleDisplayName = (role?: UserRole): string => {
    const roleToDisplay = role || getCurrentRole();
    
    switch (roleToDisplay) {
      case 'admin':
        return 'Quản trị viên';
      case 'user':
        return 'Người dùng';
      case 'guest':
        return 'Khách';
      default:
        return 'Không xác định';
    }
  };

  // Get role color for UI
  const getRoleColor = (role?: UserRole): string => {
    const roleToDisplay = role || getCurrentRole();
    
    switch (roleToDisplay) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if user can perform action on resource
  const canPerformAction = (action: string, resource: string): boolean => {
    const permission = `${action}:${resource}` as Permission;
    return hasPermission(permission);
  };

  // Get accessible routes based on role
  const getAccessibleRoutes = (): string[] => {
    const routes = ['/'];
    
    if (checkRole('user') || checkRole('admin')) {
      routes.push('/dashboard', '/reviews', '/schedules');
    }
    
    if (checkRole('admin')) {
      routes.push('/admin', '/admin/users', '/admin/analytics', '/admin/settings');
    }
    
    return routes;
  };

  // Check if route is accessible
  const isRouteAccessible = (route: string): boolean => {
    const accessibleRoutes = getAccessibleRoutes();
    return accessibleRoutes.includes(route);
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
    hasAnyPermission,
    hasAllPermissions,
    
    // Permission checking
    canAccessAdmin,
    canManageUsers,
    canManageReviews,
    canManageSchedules,
    canViewAnalytics,
    canManageSettings,
    canPerformAction,
    
    // Route access
    accessibleRoutes: getAccessibleRoutes(),
    isRouteAccessible,
  };
};
















