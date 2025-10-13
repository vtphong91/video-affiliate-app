/**
 * Auth Middleware
 * Route protection and authentication middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../config/supabase-auth';
import type { AuthMiddlewareOptions, UserRole, Permission } from '../config/auth-types';

/**
 * Middleware function to protect routes
 */
export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
) {
  const {
    redirectTo = '/auth/login',
    requireAuth = true,
    allowedRoles = [],
    allowedPermissions = [],
  } = options;

  try {
    // Get session from request
    const session = await getSessionFromRequest(request);
    
    if (!session) {
      if (requireAuth) {
        return redirectToLogin(request, redirectTo);
      }
      return NextResponse.next();
    }

    // Get user from session
    const user = session.user;
    if (!user) {
      if (requireAuth) {
        return redirectToLogin(request, redirectTo);
      }
      return NextResponse.next();
    }

    // Check role-based access
    if (allowedRoles.length > 0) {
      const userRole = user.role || user.profile?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        return redirectToUnauthorized(request);
      }
    }

    // Check permission-based access
    if (allowedPermissions.length > 0) {
      const userPermissions = user.permissions || user.profile?.permissions || [];
      const hasPermission = allowedPermissions.some(permission => 
        userPermissions.includes(permission) || 
        userPermissions.includes('admin:all')
      );
      
      if (!hasPermission) {
        return redirectToUnauthorized(request);
      }
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role || user.profile?.role || 'user');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (requireAuth) {
      return redirectToLogin(request, redirectTo);
    }
    
    return NextResponse.next();
  }
}

/**
 * Get session from request
 */
async function getSessionFromRequest(request: NextRequest) {
  try {
    // Try to get session from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        return null;
      }
      
      return { user: data.user };
    }

    // Try to get session from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    
    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error || !data.session) {
        return null;
      }
      
      return data.session;
    }

    return null;
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Redirect to login page
 */
function redirectToLogin(request: NextRequest, redirectTo: string) {
  const url = request.nextUrl.clone();
  url.pathname = redirectTo;
  url.searchParams.set('redirect', request.nextUrl.pathname);
  
  return NextResponse.redirect(url);
}

/**
 * Redirect to unauthorized page
 */
function redirectToUnauthorized(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/unauthorized';
  
  return NextResponse.redirect(url);
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(request: NextRequest) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin'],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for user-only routes
 */
export function withUserAuth(request: NextRequest) {
  return withAuth(request, {
    requireAuth: true,
    allowedRoles: ['admin', 'user'],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for specific permission
 */
export function withPermission(
  request: NextRequest,
  permission: Permission
) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: [permission],
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for multiple permissions (OR logic)
 */
export function withAnyPermission(
  request: NextRequest,
  permissions: Permission[]
) {
  return withAuth(request, {
    requireAuth: true,
    allowedPermissions: permissions,
    redirectTo: '/auth/login',
  });
}

/**
 * Middleware for guest access (no auth required)
 */
export function withGuestAuth(request: NextRequest) {
  return withAuth(request, {
    requireAuth: false,
  });
}










