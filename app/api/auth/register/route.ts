// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface RegistrationRequest {
  email: string;
  password: string;
  full_name: string;
  registration_source?: string;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  error?: string;
  user_id?: string;
}

// POST /api/auth/register - Public user registration
export async function POST(request: NextRequest) {
  try {
    const body: RegistrationRequest = await request.json();
    const { email, password, full_name, registration_source = 'public_registration' } = body;

    // Validate input
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: 'Email, password và họ tên là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 8 ký tự' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Check if user already exists by checking user_profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được đăng ký' },
        { status: 400 }
      );
    }

    console.log('👤 Registering new user...', { email, registration_source });

    // Create user in Supabase Auth
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: {
        full_name: full_name,
        registration_source: registration_source
      }
    });

    if (createUserError || !newUser?.user) {
      console.error('❌ Failed to create user:', createUserError);
      return NextResponse.json(
        { success: false, error: 'Không thể tạo tài khoản. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    const userId = newUser.user.id;
    console.log('✅ User created successfully:', userId);

    // Create user profile with pending status
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        full_name: full_name,
        role: 'viewer', // Default role
        permissions: [], // Empty permissions until approved
        status: 'pending',
        is_active: false, // Inactive until approved
        registration_source: registration_source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError);
      // Try to clean up the auth user if profile creation fails
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('❌ Failed to delete auth user:', deleteError);
      }
      return NextResponse.json(
        { success: false, error: 'Không thể tạo hồ sơ người dùng. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    // Add to approval queue
    const { error: queueError } = await supabaseAdmin
      .from('user_approval_queue')
      .insert({
        user_id: userId,
        email: email,
        full_name: full_name,
        registration_data: {
          source: registration_source,
          registered_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        },
        requested_at: new Date().toISOString(),
        priority: 0,
        notes: 'Đăng ký từ form công khai'
      });

    if (queueError) {
      console.warn('⚠️ Failed to add to approval queue:', queueError);
      // Don't fail the registration if queue insertion fails
    }

    // Log registration action
    try {
      await supabaseAdmin.rpc('log_user_action', {
        p_user_id: userId,
        p_action: 'registered',
        p_performed_by: userId, // Self-registration
        p_details: {
          registration_source: registration_source,
          full_name: full_name,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent')
        },
        p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        p_user_agent: request.headers.get('user-agent')
      });
    } catch (logError) {
      console.warn('⚠️ Failed to log registration action:', logError);
      // Don't fail the registration if logging fails
    }

    console.log('✅ Registration completed successfully:', {
      user_id: userId,
      email: email,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Tài khoản của bạn đang chờ admin duyệt.',
      user_id: userId
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.'
      },
      { status: 500 }
    );
  }
}

// GET /api/auth/register - Check registration status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and get status
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, status, created_at, approved_at, rejected_at, rejection_reason')
      .eq('email', email)
      .single();

    if (!userProfile) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Email chưa được đăng ký'
      });
    }

    return NextResponse.json({
      success: true,
      exists: true,
      status: userProfile.status,
      created_at: userProfile.created_at,
      approved_at: userProfile.approved_at,
      rejected_at: userProfile.rejected_at,
      rejection_reason: userProfile.rejection_reason
    });

  } catch (error) {
    console.error('❌ Registration status check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Có lỗi xảy ra khi kiểm tra trạng thái đăng ký.'
      },
      { status: 500 }
    );
  }
}
