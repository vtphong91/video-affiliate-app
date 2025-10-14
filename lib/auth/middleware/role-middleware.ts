/**
 * Role Middleware
 * Role-based access control middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './auth-middleware';
import type { UserRole, Permission } from '../config/auth-types';

/**
 * Middleware for admin role
 */
export function requireAdmin(request: NextRequest) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin'],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for user role (admin or user)
 */
export function requireUser(request: NextRequest) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin', 'user'],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for guest role (no auth required)
 */
export function requireGuest(request: NextRequest) {
  return withAuth(request, {
    requireAuth: false,
  });
}

/**
 * Middleware for specific role
 */
export function requireRole(request: NextRequest, role: UserRole) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: [role],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for multiple roles (OR logic)
 */
export function requireAnyRole(request: NextRequest, roles: UserRole[]) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: roles,
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for specific permission
 */
export function requirePermission(request: NextRequest, permission: Permission) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: [permission],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for multiple permissions (OR logic)
 */
export function requireAnyPermission(request: NextRequest, permissions: Permission[]) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: permissions,
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for all permissions (AND logic)
 */
export function requireAllPermissions(request: NextRequest, permissions: Permission[]) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: permissions,
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for review management
 */
export function requireReviewAccess(request: NextRequest) {
  return requireAnyPermission(request, [
    'read:reviews',
    'write:reviews',
    'delete:reviews',
    'admin:all'
  ]);
}

/**
 * Middleware for user management
 */
export function requireUserManagement(request: NextRequest) {
  return requireAnyPermission(request, [
    'read:users',
    'write:users',
    'delete:users',
    'admin:all'
  ]);
}

/**
 * Middleware for schedule management
 */
export function requireScheduleAccess(request: NextRequest) {
  return requireAnyPermission(request, [
    'read:schedules',
    'write:schedules',
    'delete:schedules',
    'admin:all'
  ]);
}

/**
 * Middleware for analytics access
 */
export function requireAnalyticsAccess(request: NextRequest) {
  return requireAnyPermission(request, [
    'read:analytics',
    'admin:all'
  ]);
}

/**
 * Middleware for settings management
 */
export function requireSettingsAccess(request: NextRequest) {
  return requireAnyPermission(request, [
    'write:settings',
    'admin:all'
  ]);
}

/**
 * Middleware for dashboard access
 */
export function requireDashboardAccess(request: NextRequest) {
  return requireUser(request);
}

/**
 * Middleware for API routes
 */
export function requireApiAuth(request: NextRequest) {
  return withAuth(request, {
    requireAuth: true,
    redirectTo: '/api/auth/unauthorized',
  });
}

/**
 * Middleware for API routes with specific permission
 */
export function requireApiPermission(request: NextRequest, permission: Permission) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: [permission],
    redirectTo: '/api/auth/unauthorized',
  });
}

/**
 * Middleware for API routes with role
 */
export function requireApiRole(request: NextRequest, role: UserRole) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: [role],
    redirectTo: '/api/auth/unauthorized',
  });
}
















