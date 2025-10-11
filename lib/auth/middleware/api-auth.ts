/**
 * API Auth Middleware
 * Middleware for protecting API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasRole, hasPermission, createUnauthorizedResponse, createForbiddenResponse } from '../utils/api-auth';
import type { UserRole, Permission } from '../config/auth-types';

/**
 * Middleware for API authentication
 */
export async function withApiAuth(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API admin access
 */
export async function withApiAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  if (!hasRole(user, 'admin')) {
    return createForbiddenResponse('Admin access required');
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API user access
 */
export async function withApiUser(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  if (!hasRole(user, 'admin') && !hasRole(user, 'user')) {
    return createForbiddenResponse('User access required');
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API role-based access
 */
export async function withApiRole(request: NextRequest, role: UserRole) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  if (!hasRole(user, role)) {
    return createForbiddenResponse(`${role} access required`);
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API permission-based access
 */
export async function withApiPermission(request: NextRequest, permission: Permission) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  if (!hasPermission(user, permission)) {
    return createForbiddenResponse(`Permission required: ${permission}`);
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API multiple permissions (OR logic)
 */
export async function withApiAnyPermission(request: NextRequest, permissions: Permission[]) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return createUnauthorizedResponse('Authentication required');
  }
  
  const hasAnyPermission = permissions.some(permission => hasPermission(user, permission));
  
  if (!hasAnyPermission) {
    return createForbiddenResponse(`One of these permissions required: ${permissions.join(', ')}`);
  }
  
  return NextResponse.next();
}

/**
 * Middleware for API review access
 */
export async function withApiReviewAccess(request: NextRequest) {
  return withApiAnyPermission(request, [
    'read:reviews',
    'write:reviews',
    'delete:reviews',
    'admin:all'
  ]);
}

/**
 * Middleware for API user management
 */
export async function withApiUserManagement(request: NextRequest) {
  return withApiAnyPermission(request, [
    'read:users',
    'write:users',
    'delete:users',
    'admin:all'
  ]);
}

/**
 * Middleware for API schedule access
 */
export async function withApiScheduleAccess(request: NextRequest) {
  return withApiAnyPermission(request, [
    'read:schedules',
    'write:schedules',
    'delete:schedules',
    'admin:all'
  ]);
}

/**
 * Middleware for API analytics access
 */
export async function withApiAnalyticsAccess(request: NextRequest) {
  return withApiAnyPermission(request, [
    'read:analytics',
    'admin:all'
  ]);
}

/**
 * Middleware for API settings access
 */
export async function withApiSettingsAccess(request: NextRequest) {
  return withApiAnyPermission(request, [
    'write:settings',
    'admin:all'
  ]);
}










