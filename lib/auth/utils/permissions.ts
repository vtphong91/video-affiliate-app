/**
 * Permissions Utilities
 * Provides permission-related constants and utilities
 */

export const PERMISSION_CATEGORIES = {
  DASHBOARD: 'dashboard',
  SCHEDULES: 'schedules',
  REVIEWS: 'reviews',
  ADMIN: 'admin',
  USERS: 'users',
  SETTINGS: 'settings',
} as const;

export const PERMISSION_DISPLAY_NAMES = {
  'dashboard.view': 'View Dashboard',
  'dashboard.stats': 'View Statistics',
  'schedules.create': 'Create Schedules',
  'schedules.edit': 'Edit Schedules',
  'schedules.delete': 'Delete Schedules',
  'schedules.view': 'View Schedules',
  'reviews.create': 'Create Reviews',
  'reviews.edit': 'Edit Reviews',
  'reviews.delete': 'Delete Reviews',
  'reviews.view': 'View Reviews',
  'admin.users': 'Manage Users',
  'admin.roles': 'Manage Roles',
  'admin.permissions': 'Manage Permissions',
  'admin.settings': 'Admin Settings',
  'users.view': 'View Users',
  'users.edit': 'Edit Users',
  'users.delete': 'Delete Users',
  'settings.view': 'View Settings',
  'settings.edit': 'Edit Settings',
} as const;

export const PERMISSION_DESCRIPTIONS = {
  'dashboard.view': 'Access to dashboard overview',
  'dashboard.stats': 'View dashboard statistics and analytics',
  'schedules.create': 'Create new posting schedules',
  'schedules.edit': 'Edit existing schedules',
  'schedules.delete': 'Delete schedules',
  'schedules.view': 'View all schedules',
  'reviews.create': 'Create new video reviews',
  'reviews.edit': 'Edit existing reviews',
  'reviews.delete': 'Delete reviews',
  'reviews.view': 'View all reviews',
  'admin.users': 'Manage user accounts',
  'admin.roles': 'Manage user roles',
  'admin.permissions': 'Manage user permissions',
  'admin.settings': 'Access admin settings',
  'users.view': 'View user profiles',
  'users.edit': 'Edit user profiles',
  'users.delete': 'Delete user accounts',
  'settings.view': 'View application settings',
  'settings.edit': 'Edit application settings',
} as const;

export type Permission = keyof typeof PERMISSION_DISPLAY_NAMES;

export const ROLE_PERMISSIONS = {
  admin: [
    'dashboard.view',
    'dashboard.stats',
    'schedules.create',
    'schedules.edit',
    'schedules.delete',
    'schedules.view',
    'reviews.create',
    'reviews.edit',
    'reviews.delete',
    'reviews.view',
    'admin.users',
    'admin.roles',
    'admin.permissions',
    'admin.settings',
    'users.view',
    'users.edit',
    'users.delete',
    'settings.view',
    'settings.edit',
  ],
  user: [
    'dashboard.view',
    'schedules.create',
    'schedules.edit',
    'schedules.view',
    'reviews.create',
    'reviews.edit',
    'reviews.view',
    'users.view',
    'settings.view',
  ],
  guest: [
    'dashboard.view',
    'schedules.view',
    'reviews.view',
  ],
} as const;

export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions?.includes(permission) || false;
}

export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}
