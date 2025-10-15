import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

interface RejectionRequest {
  reason: string;
}

// Check if user is admin
async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null }> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return { isAdmin: false, userId: null };
  }

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  return { isAdmin, userId };
}

// POST /api/admin/users/[id]/reject - Reject a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin access
    const { isAdmin, userId: adminId } = await checkAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const userId = params.id;
    const body: RejectionRequest = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    console.log('❌ Rejecting user...', { userId, reason });

    // Use the database function to reject user
    const { data, error } = await supabaseAdmin.rpc('reject_user', {
      p_user_id: userId,
      p_rejection_reason: reason.trim(),
      p_notes: null
    });

    if (error) {
      console.error('❌ Failed to reject user:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to reject user' },
        { status: 500 }
      );
    }

    console.log('✅ User rejected successfully:', userId);

    // Send rejection email notification
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (userProfile) {
        console.log('📧 Sending rejection email to:', userProfile.email);
        
        // TODO: Implement actual email sending
        // For now, just log the email content
        console.log('📧 Rejection Email Content:');
        console.log('=====================================');
        console.log(`To: ${userProfile.email}`);
        console.log(`Subject: Thông báo về đơn đăng ký tài khoản - Video Affiliate App`);
        console.log('');
        console.log(`Xin chào ${userProfile.full_name},`);
        console.log('');
        console.log('Chúng tôi xin thông báo rằng đơn đăng ký tài khoản của bạn đã không được duyệt.');
        console.log('');
        console.log('Lý do từ chối:');
        console.log(reason);
        console.log('');
        console.log('Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.');
        console.log('');
        console.log('Trân trọng,');
        console.log('Đội ngũ Video Affiliate App');
        console.log('=====================================');
      }
    } catch (emailError) {
      console.warn('⚠️ Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'User rejected successfully',
      data: {
        user_id: userId,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to reject user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reject user',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


