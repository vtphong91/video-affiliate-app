/**
 * Auth Helper Functions
 * Utilities for extracting user information from requests
 */
// @ts-nocheck
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { createServerClient } from '@supabase/ssr';

/**
 * Get user ID from request using Supabase SSR (correct method for API routes)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Method 1: Try to get from headers first (fastest)
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) {
      console.log('✅ Got user ID from header:', userIdFromHeader);
      return userIdFromHeader;
    }

    // Method 2: Use Supabase SSR to get user from cookies (correct way)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase credentials not configured');
      return null;
    }

    // Create Supabase client for server-side with proper cookie handling
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {
            // No-op for API routes (can't set cookies in response here)
          },
          remove() {
            // No-op for API routes
          },
        },
      }
    );

    console.log('🔐 Getting session from Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return null;
    }

    if (session?.user) {
      console.log('✅ Got user from Supabase session:', session.user.id);
      return session.user.id;
    }

    // Method 3: Try Bearer token (fallback)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        console.log('🔐 Trying Bearer token...');
        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (!error && data.user) {
          console.log('✅ Got user from Bearer token:', data.user.id);
          return data.user.id;
        }
      } catch (error) {
        console.error('❌ Bearer token error:', error);
      }
    }

    console.log('❌ No valid authentication method found');
    return null;
  } catch (error) {
    console.error('❌ Error getting user ID from request:', error);
    return null;
  }
}

/**
 * Get user email from request headers or session
 */
export async function getUserEmailFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Method 1: Try to get from headers
    const emailFromHeader = request.headers.get('x-user-email');
    if (emailFromHeader) {
      return emailFromHeader;
    }

    // Method 2: Get user ID first, then query user_profiles table
    const userId = await getUserIdFromRequest(request);
    if (userId) {
      // Query user_profiles table for email using supabaseAdmin
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data.email || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user email from request:', error);
    return null;
  }
}

/**
 * Get user role from request headers or session
 */
export async function getUserRoleFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Method 1: Try to get from headers
    const roleFromHeader = request.headers.get('x-user-role');
    if (roleFromHeader) {
      return roleFromHeader;
    }

    // Method 2: Try to get from user profile
    const userId = await getUserIdFromRequest(request);
    if (userId) {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return data.role;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user role from request:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated(request: NextRequest): Promise<boolean> {
  const userId = await getUserIdFromRequest(request);
  return userId !== null;
}

/**
 * Require authentication and return user ID or throw error
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}
