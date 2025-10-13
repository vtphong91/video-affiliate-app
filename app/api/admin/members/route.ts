import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { EnhancedUserProfile, UserRole, Permission } from '@/lib/auth/config/auth-types';

export const dynamic = 'force-dynamic';

// GET /api/admin/members - Get all members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    console.log('📋 Fetching members...', { page, limit, role, search, active });

    let query = supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        role,
        permissions,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch members:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch members',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, role, permissions } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    console.log('👤 Creating new member...', { email, role });

    // First, create user in auth.users (this would typically be done via Supabase Auth)
    // For now, we'll assume the user already exists and we're just creating the profile
    
    // Create user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        email,
        full_name,
        role,
        permissions: permissions || [],
        is_active: true,
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
      message: 'Member created successfully',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to create member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create member',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
