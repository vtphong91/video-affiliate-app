import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import type { EnhancedUserProfile, UserRole, Permission } from '@/lib/auth/config/auth-types';

export const dynamic = 'force-dynamic';

// GET /api/admin/members/[id] - Get member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('👤 Fetching member...', { id });

    const { data, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch member',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/members/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { full_name, role, permissions, is_active } = body;

    console.log('🔄 Updating member...', { id, role, is_active });

    // Get current member data before update for audit log
    const { data: currentMember, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, role, email')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const updateData: Partial<EnhancedUserProfile> = {
      updated_at: new Date().toISOString()
    };

    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log role change activity if role was updated
    if (role !== undefined && role !== currentMember.role) {
      try {
        const { db } = await import('@/lib/db/supabase');
        const { getUserIdFromRequest } = await import('@/lib/auth/helpers/auth-helpers');
        const adminUserId = await getUserIdFromRequest(request);

        if (adminUserId) {
          await db.createActivityLog({
            user_id: adminUserId,
            type: 'user.role_change',
            title: 'Thay đổi vai trò thành viên',
            description: `Đã thay đổi vai trò của ${currentMember.email} từ ${currentMember.role} sang ${role}`,
            status: 'success',
            metadata: {
              target_user_id: id,
              target_user_email: currentMember.email,
              old_role: currentMember.role,
              new_role: role
            }
          });
          console.log('✅ Role change activity log created');
        }
      } catch (logError) {
        console.error('⚠️ Failed to create role change activity log (non-critical):', logError);
      }
    }

    // Log activation/deactivation if status was changed
    if (is_active !== undefined) {
      try {
        const { db } = await import('@/lib/db/supabase');
        const { getUserIdFromRequest } = await import('@/lib/auth/helpers/auth-helpers');
        const adminUserId = await getUserIdFromRequest(request);

        if (adminUserId) {
          await db.createActivityLog({
            user_id: adminUserId,
            type: is_active ? 'user.activate' : 'user.deactivate',
            title: is_active ? 'Kích hoạt thành viên' : 'Vô hiệu hóa thành viên',
            description: `Đã ${is_active ? 'kích hoạt' : 'vô hiệu hóa'} thành viên ${currentMember.email}`,
            status: 'success',
            metadata: {
              target_user_id: id,
              target_user_email: currentMember.email,
              is_active
            }
          });
          console.log('✅ Status change activity log created');
        }
      } catch (logError) {
        console.error('⚠️ Failed to create status change activity log (non-critical):', logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to update member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update member',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/members/[id] - Delete member (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('🗑️ Soft deleting member...', { id });

    // Get current admin user ID
    const { getUserIdFromRequest } = await import('@/lib/auth/helpers/auth-helpers');
    const adminUserId = await getUserIdFromRequest(request);

    // Validation 1: Prevent self-deletion
    if (adminUserId === id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bạn không thể xóa chính tài khoản của mình',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Get member info before deletion for logging
    const { data: memberData, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('email, full_name, role, is_active')
      .eq('id', id)
      .single();

    if (fetchError || !memberData) {
      console.error('❌ Error fetching member:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy thành viên',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Validation 2: Check if already deleted
    if (!memberData.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thành viên đã bị vô hiệu hóa trước đó',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Soft delete: Set is_active to false + add deleted timestamp
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error soft deleting member:', error);
      throw error;
    }

    console.log('✅ Soft deleted member:', id);

    // Log deletion activity (non-blocking)
    if (adminUserId) {
      try {
        const { db } = await import('@/lib/db/supabase');
        await db.createActivityLog({
          user_id: adminUserId,
          type: 'user.soft_delete',
          title: 'Vô hiệu hóa thành viên',
          description: `Đã vô hiệu hóa thành viên ${memberData.email} (${memberData.full_name})`,
          status: 'success',
          metadata: {
            target_user_id: id,
            target_user_email: memberData.email,
            target_user_name: memberData.full_name,
            previous_role: memberData.role
          }
        });
        console.log('✅ Activity log created successfully');
      } catch (logError) {
        // Log error but don't fail the request
        console.error('⚠️ Failed to create activity log (non-critical):', logError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đã vô hiệu hóa thành viên thành công. Thành viên không thể đăng nhập nhưng dữ liệu vẫn được giữ lại.',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to soft delete member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể vô hiệu hóa thành viên',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
