'use client';

/**
 * Route Protection HOCs
 * Higher-order components for protecting routes
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../SupabaseAuthProvider';
import { Loader2 } from 'lucide-react';
import type { UserRole, Permission } from '../config/auth-types';

interface RouteProtectionOptions {
  requireAuth?: boolean;
  allowedRoles?: UserRole[];
  allowedPermissions?: Permission[];
  fallback?: 'redirect' | 'component' | 'error';
  fallbackComponent?: React.ComponentType;
  fallbackRedirect?: string;
}

/**
 * HOC to protect routes with authentication
 */
export function withRouteProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: RouteProtectionOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    allowedPermissions = [],
    fallback = 'redirect',
    fallbackComponent: FallbackComponent,
    fallbackRedirect = '/auth/login',
  } = options;

  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const { user, userProfile, loading } = useAuth();

    useEffect(() => {
      console.log('🔍 Route Protection useEffect - loading:', loading, 'user:', !!user, 'userProfile:', !!userProfile);
      
      if (loading) {
        console.log('⏳ Still loading, waiting...');
        return;
      }

      // Check authentication
      if (requireAuth && !user) {
        console.log('❌ Not authenticated, redirecting to login');
        if (fallback === 'redirect') {
          router.push(fallbackRedirect);
        }
        return;
      }

      // Check role-based access - ONLY if userProfile is loaded
      if (allowedRoles.length > 0) {
        console.log('🔍 Role check - userProfile:', userProfile, 'allowedRoles:', allowedRoles);
        
        // Wait for userProfile to be loaded before checking role
        if (!userProfile) {
          console.log('⏳ userProfile not loaded yet, waiting...');
          return;
        }
        
        if (!userProfile.role || !allowedRoles.includes(userProfile.role)) {
          console.log('❌ Role check failed - userProfile.role:', userProfile.role);
          if (fallback === 'redirect') {
            router.push('/admin-access-denied');
          }
          return;
        }
        console.log('✅ Role check passed - userProfile.role:', userProfile.role);
      }
    }, [user, userProfile, loading, router, fallback, fallbackRedirect]);

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      );
    }

    // Show fallback component
    if (fallback === 'component' && FallbackComponent) {
      return <FallbackComponent />;
    }

    // Show error component
    if (fallback === 'error') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600 mb-4">
              Bạn không có quyền truy cập vào trang này
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      );
    }

    // Check access
    if (requireAuth && !user) {
      return null;
    }

    if (allowedRoles.length > 0) {
      console.log('🔍 Final access check - userProfile:', userProfile, 'allowedRoles:', allowedRoles);
      
      // Wait for userProfile to be loaded before final check, but with timeout
      if (!userProfile && loading) {
        console.log('⏳ Final check - userProfile not loaded yet, showing loading...');
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user profile...</p>
            </div>
          </div>
        );
      }
      
      // If not loading anymore but still no userProfile, allow access (fallback)
      if (!userProfile && !loading) {
        console.log('⚠️ No userProfile but not loading, allowing access as fallback');
        return <Component {...props} />;
      }
      
      if (userProfile && (!userProfile.role || !allowedRoles.includes(userProfile.role))) {
        console.log('❌ Final access check failed - userProfile.role:', userProfile.role);
        return null;
      }
      console.log('✅ Final access check passed - userProfile.role:', userProfile?.role);
    }

    // Render protected component
    return <Component {...props} />;
  };
}

/**
 * HOC for admin-only routes
 */
export function withAdminRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedRoles: ['admin'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for user-only routes
 */
export function withUserRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedRoles: ['admin', 'user'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for guest-only routes
 */
export function withGuestRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: false,
  });
}

/**
 * HOC for specific role
 */
export function withRoleRoute<P extends object>(
  Component: React.ComponentType<P>,
  role: UserRole
) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedRoles: [role],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for specific permission
 */
export function withPermissionRoute<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission
) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: [permission],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for multiple permissions
 */
export function withAnyPermissionRoute<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission[]
) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: permissions,
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for dashboard access
 */
export function withDashboardRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedRoles: ['admin', 'user'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for review management
 */
export function withReviewRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: ['read:reviews', 'write:reviews', 'delete:reviews', 'admin:all'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for user management
 */
export function withUserManagementRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: ['read:users', 'write:users', 'delete:users', 'admin:all'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for schedule management
 */
export function withScheduleRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: ['read:schedules', 'write:schedules', 'delete:schedules', 'admin:all'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for analytics access
 */
export function withAnalyticsRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: ['read:analytics', 'admin:all'],
    fallbackRedirect: '/auth/login',
  });
}

/**
 * HOC for settings management
 */
export function withSettingsRoute<P extends object>(Component: React.ComponentType<P>) {
  return withRouteProtection(Component, {
    requireAuth: true,
    allowedPermissions: ['write:settings', 'admin:all'],
    fallbackRedirect: '/auth/login',
  });
}
