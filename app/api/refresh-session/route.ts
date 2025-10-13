import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/refresh-session
 * API để refresh session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Refresh Session API called');
    
    // Try to refresh the session
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    console.log('🔍 Refresh Session result:', { 
      hasSession: !!session, 
      error: error?.message,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (error) {
      console.error('❌ Refresh Session error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 401 });
    }
    
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
        } : null
      }
    });
  } catch (error) {
    console.error('❌ Refresh Session API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
