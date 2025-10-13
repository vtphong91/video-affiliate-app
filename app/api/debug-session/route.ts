import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug-session
 * Debug API để test session loading
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Session API called');
    
    // Test 1: Get session from Supabase
    console.log('🔍 Test 1: Getting session from Supabase...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔍 Test 1 result:', { 
      hasSession: !!session, 
      error: sessionError?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    // Test 2: Get user from Supabase
    console.log('🔍 Test 2: Getting user from Supabase...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('🔍 Test 2 result:', { 
      hasUser: !!user, 
      error: userError?.message,
      userId: user?.id,
      userEmail: user?.email
    });
    
    return NextResponse.json({
      success: true,
      data: {
        session: session ? {
          access_token: session.access_token ? 'present' : 'missing',
          refresh_token: session.refresh_token ? 'present' : 'missing',
          expires_at: session.expires_at,
          user: {
            id: session.user.id,
            email: session.user.email,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at
          }
        } : null,
        sessionError: sessionError?.message,
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        } : null,
        userError: userError?.message
      }
    });
  } catch (error) {
    console.error('❌ Debug Session API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
