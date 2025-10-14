import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface ApprovalRequest {
  role: string;
  permissions?: string[];
  notes?: string;
}

// POST /api/admin/users/[id]/approve - Approve a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body: ApprovalRequest = await request.json();
    const { role, permissions, notes } = body;

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    console.log('✅ Approving user...', { userId, role });

    // Convert permissions array to JSONB
    const permissionsJsonb = permissions ? JSON.stringify(permissions) : null;

    // Use the database function to approve user
    const { data, error } = await supabaseAdmin.rpc('approve_user', {
      p_user_id: userId,
      p_role: role,
      p_permissions: permissionsJsonb,
      p_notes: notes || null
    });

    if (error) {
      console.error('❌ Failed to approve user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to approve user' },
        { status: 500 }
      );
    }

    console.log('✅ User approved successfully:', userId);

    // Send approval email notification
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (userProfile) {
        console.log('📧 Sending approval email to:', userProfile.email);
        
        // TODO: Implement actual email sending
        // For now, just log the email content
        console.log('📧 Approval Email Content:');
        console.log('=====================================');
        console.log(`To: ${userProfile.email}`);
        console.log(`Subject: Tài khoản của bạn đã được duyệt - Video Affiliate App`);
        console.log('');
        console.log(`Xin chào ${userProfile.full_name},`);
        console.log('');
        console.log('Tài khoản của bạn đã được admin duyệt thành công!');
        console.log('');
        console.log('Thông tin tài khoản:');
        console.log(`Email: ${userProfile.email}`);
        console.log(`Vai trò: ${role === 'admin' ? 'Quản trị viên' : role === 'editor' ? 'Biên tập viên' : 'Người xem'}`);
        console.log('');
        console.log('Bây giờ bạn có thể đăng nhập vào hệ thống tại:');
        console.log('http://localhost:3000/auth/login');
        console.log('');
        console.log('Trân trọng,');
        console.log('Đội ngũ Video Affiliate App');
        console.log('=====================================');
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
      data: {
        user_id: userId,
        role: role,
        approved_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to approve user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve user',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
