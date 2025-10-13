import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { Role, Permission } from '@/lib/auth/config/auth-types';

export const dynamic = 'force-dynamic';

// GET /api/admin/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching roles...');

    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch roles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch roles',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, display_name, description, permissions } = body;

    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Name and display_name are required' },
        { status: 400 }
      );
    }

    console.log('👤 Creating new role...', { name, display_name });

    const { data, error } = await supabaseAdmin
      .from('roles')
      .insert({
        name,
        display_name,
        description,
        permissions: permissions || [],
        is_system_role: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Role created successfully',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to create role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create role',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
