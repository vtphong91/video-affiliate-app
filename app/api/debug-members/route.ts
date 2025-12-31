import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Debug endpoint to test direct database query
export async function GET() {
  try {
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    console.log('🔍 DEBUG: Fetching all user profiles...');

    const { data, error, count } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ DEBUG: Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
      }, { status: 500 });
    }

    console.log('✅ DEBUG: Successfully fetched', data?.length, 'profiles');

    return NextResponse.json({
      success: true,
      totalCount: count,
      profiles: data,
      message: 'Direct database query successful',
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
