import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/admin/permissions - Get all permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const action = searchParams.get('action');

    console.log('📋 Fetching permissions...', { resource, action });

    let query = supabaseAdmin
      .from('permissions')
      .select('*')
      .order('resource, action');

    // Apply filters
    if (resource) {
      query = query.eq('resource', resource);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Group permissions by resource for easier UI handling
    const groupedPermissions = (data || []).reduce((acc: Record<string, any[]>, permission: any) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      data: data || [],
      grouped: groupedPermissions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch permissions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch permissions',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
