import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js Middleware
 * Handles route protection and authentication with Supabase or fallback to cookie auth
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (handled separately)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let isAuthenticated = false;
    
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your_supabase') && !supabaseKey.includes('your_supabase')) {
      // Use Supabase auth
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // This is handled by the client
            },
            remove(name: string, options: any) {
              // This is handled by the client
            },
          },
        }
      );
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      isAuthenticated = !!session;
      
      console.log('Middleware: Using Supabase auth, session:', !!session);
    } else {
      // Fallback to cookie-based auth
      const authToken = request.cookies.get('auth_token')?.value;
      isAuthenticated = !!authToken;
      
      console.log('Middleware: Using cookie auth, token:', !!authToken);
    }

    console.log('Middleware: Checking access for', pathname, 'authenticated:', isAuthenticated);

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!isAuthenticated) {
        console.log('Middleware: Redirecting to login for', pathname);
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      console.log('Middleware: Allowing dashboard access for', pathname);
    }

    // Allow auth routes
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Allow other routes
    console.log('Middleware: Allowing access to', pathname);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
