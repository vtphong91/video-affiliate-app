// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null }> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return { isAdmin: false, userId: null };
  }

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  return { isAdmin, userId };
}

// GET /api/admin/pending-users - Get all pending users
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔍 Fetching pending users...');

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

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