import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// Debug endpoint to check current user authentication
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking current user...');

    // Get user ID from request
    const userId = await getUserIdFromRequest(request);
    console.log('👤 DEBUG: User ID from request:', userId);

    if (!userId) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No user session found',
        userId: null,
        profile: null,
      });
    }

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ DEBUG: Error fetching profile:', error);
      return NextResponse.json({
        success: false,
        authenticated: true,
        userId,
        profile: null,
        error: error.message,
      });
    }

    console.log('✅ DEBUG: User profile found:', profile.email, profile.role);

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId,
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        is_active: profile.is_active,
        status: profile.status,
      },
      isAdmin: profile.role === 'admin',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ DEBUG: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
