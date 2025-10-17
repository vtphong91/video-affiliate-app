import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// POST /api/admin/members/[id]/restore - Restore soft-deleted member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('♻️ Restoring member...', { id });

    // Get current admin user ID
    const adminUserId = await getUserIdFromRequest(request);

    if (!adminUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // Get member info
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

    // Validation: Check if already active
    if (memberData.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thành viên này đang hoạt động',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Restore: Set is_active to true
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error restoring member:', error);
      throw error;
    }

    console.log('✅ Restored member:', id);

    // Log restoration activity (non-blocking)
    try {
      const { db } = await import('@/lib/db/supabase');
      await db.createActivityLog({
        user_id: adminUserId,
        type: 'user.restore',
        title: 'Khôi phục thành viên',
        description: `Đã khôi phục thành viên ${memberData.email} (${memberData.full_name})`,
        status: 'success',
        metadata: {
          target_user_id: id,
          target_user_email: memberData.email,
          target_user_name: memberData.full_name,
          role: memberData.role
        }
      });
      console.log('✅ Activity log created successfully');
    } catch (logError) {
      // Log error but don't fail the request
      console.error('⚠️ Failed to create activity log (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Đã khôi phục thành viên thành công. Thành viên có thể đăng nhập lại.',
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to restore member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể khôi phục thành viên',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
