import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/test-pending - Simple test for pending users
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing pending users API...');

    // Simple query without complex joins
    const { data: pendingUsers, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, role, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching pending users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Found pending users:', pendingUsers?.length || 0);

    return NextResponse.json({
      success: true,
      count: pendingUsers?.length || 0,
      users: pendingUsers || []
    });

  } catch (error) {
    console.error('❌ Error in test API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


