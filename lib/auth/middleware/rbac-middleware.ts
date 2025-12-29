import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Define route permissions
const ROUTE_PERMISSIONS = {
  '/admin': ['admin:all'],
  '/admin/members': ['read:users', 'write:users'],
  '/admin/roles': ['read:users', 'write:users'],
  '/admin/permissions': ['read:users', 'write:users'],
  '/admin/settings': ['read:settings', 'write:settings'],
  '/dashboard': ['read:reviews', 'read:schedules'],
  '/dashboard/reviews': ['read:reviews', 'write:reviews'],
  '/dashboard/schedules': ['read:schedules', 'write:schedules'],
  '/dashboard/categories': ['read:categories', 'write:categories'],
} as const;

// Define role hierarchy
const ROLE_HIERARCHY = {
  admin: ['admin', 'editor', 'viewer'],
  editor: ['editor', 'viewer'],
  viewer: ['viewer'],
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase') || supabaseKey.includes('your_supabase')) {
      console.log('Supabase not configured, allowing access');
      return NextResponse.next();
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.next();
    }

    // Check if user is authenticated
    const isAuthenticated = !!session?.user;

    // Get user profile with role and permissions
    let userProfile = null;
    if (isAuthenticated) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, permissions, is_active')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else {
        userProfile = profile;
      }
    }

    // Helper function to check permissions
    const hasPermission = (requiredPermissions: string[]): boolean => {
      if (!userProfile) return false;
      
      // Admin has all permissions
      if (userProfile.role === 'admin') return true;
      
      // Check if user has any of the required permissions
      const userPermissions = userProfile.permissions || [];
      return requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    };

    // Helper function to check role hierarchy
    const hasRole = (requiredRoles: string[]): boolean => {
      if (!userProfile) return false;

      const userRole = userProfile.role;
      const allowedRoles = (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || []) as readonly string[];

      return requiredRoles.some(role => allowedRoles.includes(role as any));
    };

    // Check route access
    const routePermissions = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS];
    
    if (routePermissions) {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log(`🔒 Unauthenticated access to ${pathname}, redirecting to login`);
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user profile exists and is active
      if (!userProfile || !userProfile.is_active) {
        console.log(`🔒 Inactive user access to ${pathname}, redirecting to unauthorized`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Check permissions
      if (!hasPermission([...routePermissions])) {
        console.log(`🔒 Insufficient permissions for ${pathname}, user role: ${userProfile.role}`);
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      console.log(`✅ Access granted to ${pathname} for user ${userProfile.role}`);
    }

    // Redirect authenticated users away from login page
    if (pathname === '/auth/login' && isAuthenticated) {
      console.log('🔍 Authenticated user on login page, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users from protected routes
    if (pathname.startsWith('/dashboard') && !isAuthenticated) {
      console.log('🔍 Unauthenticated user on dashboard, redirecting to login');
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Check if user has specific permission (for API route usage)
 * @param userId - User ID to check
 * @param permission - Permission string to check (e.g., 'manage_settings', 'manage_users')
 * @returns boolean - true if user has permission
 */
export async function checkPermission(userId: string, permission: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not configured');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return false;
    }

    // Check if user is active
    if (!profile.is_active) {
      return false;
    }

    // Admin has all permissions
    if (profile.role === 'admin') {
      return true;
    }

    // Map permission strings to role-based access
    const permissionRoleMap: Record<string, string[]> = {
      'manage_settings': ['admin'],
      'manage_users': ['admin'],
      'manage_roles': ['admin'],
      'read_settings': ['admin', 'editor'],
      'write_reviews': ['admin', 'editor'],
      'read_reviews': ['admin', 'editor', 'viewer'],
      'write_schedules': ['admin', 'editor'],
      'read_schedules': ['admin', 'editor', 'viewer'],
    };

    const allowedRoles = permissionRoleMap[permission] || [];
    return allowedRoles.includes(profile.role);

  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

