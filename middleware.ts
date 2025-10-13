import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
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
            // This is handled by the client
          },
          remove(name: string, options: any) {
            // This is handled by the client
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session && !!session.user;

    console.log('🔍 Middleware Debug:');
    console.log('  - Pathname:', pathname);
    console.log('  - Session exists:', !!session);
    console.log('  - User exists:', !!session?.user);
    console.log('  - User email:', session?.user?.email);
    console.log('  - Is authenticated:', isAuthenticated);
    console.log('  - Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 20)}...`));

    // TEMPORARILY DISABLE REDIRECTS TO FIX LOOP ISSUE
    // Let client-side handle authentication redirects
    
    // Protect dashboard routes - DISABLED
    // if (pathname.startsWith('/dashboard')) {
    //   if (!isAuthenticated) {
    //     console.log('Redirecting to auth/login for', pathname);
    //     const loginUrl = new URL('/auth/login', request.url);
    //     loginUrl.searchParams.set('redirect', pathname);
    //     return NextResponse.redirect(loginUrl);
    //   }
    // }

    // Redirect authenticated users away from login page - DISABLED
    // if (pathname === '/auth/login' && isAuthenticated) {
    //   console.log('User already authenticated, redirecting from auth/login to dashboard');
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }

    // Allow auth routes
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next();
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
