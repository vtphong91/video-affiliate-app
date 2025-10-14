import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API route để test database schema sau migration
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database schema...');

    // Test user_profiles table
    const { data: userProfiles, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role, permissions, is_active')
      .limit(5);

    // Test roles table
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('name, display_name, permissions')
      .limit(5);

    // Test permissions table
    const { data: permissions, error: permissionsError } = await supabaseAdmin
      .from('permissions')
      .select('name, display_name, resource, action')
      .limit(10);

    return NextResponse.json({
      success: true,
      message: 'Database schema test completed',
      results: {
        userProfiles: {
          success: !userError,
          data: userProfiles || [],
          error: userError?.message
        },
        roles: {
          success: !rolesError,
          data: roles || [],
          error: rolesError?.message
        },
        permissions: {
          success: !permissionsError,
          data: permissions || [],
          error: permissionsError?.message
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database test failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// API route để update user role (for testing)
export async function POST(request: NextRequest) {
  try {
    const { userId, role, permissions } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating user ${userId} to role ${role}`);

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role,
        permissions: permissions || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} updated to ${role}`,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
