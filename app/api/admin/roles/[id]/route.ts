import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/admin/roles/[id] - Get role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('📋 Fetching role...', { id });

    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch role',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/roles/[id] - Update role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { display_name, description, permissions } = body;

    // Get userId for audit logging
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Updating role...', { id, display_name });

    // Check if role is system role
    const { data: existingRole, error: fetchError } = await supabaseAdmin
      .from('roles')
      .select('is_system_role, name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (existingRole.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (display_name !== undefined) updateData.display_name = display_name;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;

    const { data, error } = await supabaseAdmin
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await db.createActivityLog({
      user_id: userId,
      type: 'role.update',
      title: 'Cập nhật vai trò',
      description: `Đã cập nhật vai trò: ${existingRole.name}`,
      status: 'success',
      metadata: {
        role_id: id,
        role_name: existingRole.name,
        changes: updateData
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to update role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update role',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get userId for audit logging
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🗑️ Deleting role...', { id });

    // Check if role is system role
    const { data: existingRole, error: fetchError } = await supabaseAdmin
      .from('roles')
      .select('is_system_role, name')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    if (existingRole.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      );
    }

    // Check if any users are assigned this role
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('role', existingRole.name)
      .limit(1);

    if (usersError) throw usersError;

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users. Please reassign users first.' },
        { status: 400 }
      );
    }

    // Delete the role
    const { error } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log activity
    await db.createActivityLog({
      user_id: userId,
      type: 'role.delete',
      title: 'Xóa vai trò',
      description: `Đã xóa vai trò: ${existingRole.name}`,
      status: 'success',
      metadata: {
        role_id: id,
        role_name: existingRole.name
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to delete role:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete role',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
