/**
 * Auth Helper Functions
 * Utilities for extracting user information from requests
 */

import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';

/**
 * Get user ID from request headers or session (optimized version)
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    console.log('🔍 getUserIdFromRequest - Starting authentication check');
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
    console.log('🔍 Cookies:', request.cookies.getAll());

    // Method 1: Try to get from headers first (fastest)
    const userIdFromHeader = request.headers.get('x-user-id');
    if (userIdFromHeader) {
      console.log('✅ User ID from header (fast):', userIdFromHeader);
      return userIdFromHeader;
    }

    // Method 2: Try to get from Supabase cookies (correct cookie names)
    // Supabase stores auth in cookies with project-specific names
    // Format: sb-{project-ref}-auth-token
    const cookies = request.cookies;
    const allCookies = cookies.getAll();
    console.log('🔍 All cookies count:', allCookies.length);

    const authTokenCookie = allCookies.find(cookie =>
      cookie.name.includes('auth-token') && cookie.name.startsWith('sb-')
    );

    console.log('🔍 Auth token cookie found:', authTokenCookie ? authTokenCookie.name : 'NONE');

    if (authTokenCookie) {
      try {
        console.log('🔍 Parsing auth cookie value...');
        // Parse the auth token cookie value (it's a JSON string)
        const authData = JSON.parse(authTokenCookie.value);
        console.log('🔍 Auth data keys:', Object.keys(authData));

        if (authData.access_token) {
          console.log('🔍 Access token found, verifying with Supabase...');
          // Use supabaseAdmin for server-side token verification in API routes
          const { data, error } = await supabaseAdmin.auth.getUser(authData.access_token);

          if (error) {
            console.log('⚠️ Supabase auth error:', error.message);
          } else if (!data.user) {
            console.log('⚠️ No user data returned from Supabase');
          } else {
            console.log('✅ User ID from Supabase auth cookie:', data.user.id);
            return data.user.id;
          }
        } else {
          console.log('⚠️ No access_token in auth data');
        }
      } catch (error) {
        console.log('⚠️ Supabase cookie auth failed:', error);
      }
    }

    // Method 3: Try Bearer token (fallback)
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Use supabaseAdmin for server-side token verification
        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (!error && data.user) {
          console.log('✅ User ID from Bearer token:', data.user.id);
          return data.user.id;
        }
      } catch (error) {
        console.log('⚠️ Bearer token auth failed');
      }
    }

    console.log('❌ No user ID found in request');
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
    console.error('❌ Error getting user email from request:', error);
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
      const { data, error } = await supabase
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
    console.error('❌ Error getting user role from request:', error);
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
