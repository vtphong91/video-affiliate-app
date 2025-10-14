import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/admin/pending-users - Get all pending users
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching pending users...');

    const { data: pendingUsers, error } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        created_at,
        approved_by,
        approved_at,
        rejected_by,
        rejected_at,
        rejection_reason,
        registration_source
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching pending users:', error);
      return NextResponse.json({ error: 'Failed to fetch pending users' }, { status: 500 });
    }

    console.log('✅ Found pending users:', pendingUsers?.length || 0);

    return NextResponse.json({
      success: true,
      members: pendingUsers || [],
      total: pendingUsers?.length || 0
    });

  } catch (error) {
    console.error('❌ Error in pending users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}