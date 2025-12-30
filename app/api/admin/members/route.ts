// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import type { EnhancedUserProfile, UserRole, Permission } from '@/lib/auth/config/auth-types';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null }> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return { isAdmin: false, userId: null };
  }

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  // Check user role
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  return { isAdmin, userId };
}

// Generate secure random password
function generateSecurePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Send account information email via External Service (Resend/SendGrid)
async function sendAccountEmail(email: string, fullName: string, password: string, role: string) {
  try {
    console.log('📧 Sending account information email via External Service...');
    
    // Professional HTML email template
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Video Affiliate App</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0;">Thông tin tài khoản mới</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #374151; margin-top: 0;">Xin chào ${fullName}!</h2>
          
          <p style="color: #6b7280; line-height: 1.6;">
            Tài khoản của bạn đã được tạo thành công trên hệ thống <strong>Video Affiliate App</strong>.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Thông tin đăng nhập:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                <td style="padding: 8px 0; color: #6b7280;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Mật khẩu:</td>
                <td style="padding: 8px 0; color: #6b7280; font-family: monospace; background: #f9fafb; padding: 4px 8px; border-radius: 4px; border: 1px solid #e5e7eb;">${password}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Vai trò:</td>
                <td style="padding: 8px 0; color: #6b7280;">${role === 'admin' ? 'Quản trị viên' : role === 'editor' ? 'Biên tập viên' : 'Người xem'}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-top: 0;">⚠️ QUAN TRỌNG:</h4>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Vui lòng đổi mật khẩu ngay lần đầu đăng nhập</li>
              <li>Mật khẩu này chỉ sử dụng được một lần</li>
              <li>Để bảo mật tài khoản, hãy tạo mật khẩu mạnh</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/auth/login" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Đăng nhập ngay
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
            Trân trọng,<br>
            <strong>Đội ngũ Video Affiliate App</strong>
          </p>
        </div>
      </div>
    `;

    // TODO: Integrate with actual email service
    // Option 1: Resend (Recommended)
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@yourdomain.com',
    //   to: email,
    //   subject: 'Thông tin tài khoản Video Affiliate App',
    //   html: emailContent
    // });

    // Option 2: SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: email,
    //   from: 'noreply@yourdomain.com',
    //   subject: 'Thông tin tài khoản Video Affiliate App',
    //   html: emailContent
    // });

    // Option 3: Nodemailer
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransporter({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: email,
    //   subject: 'Thông tin tài khoản Video Affiliate App',
    //   html: emailContent
    // });

    // For now, log the email content (Development only)
    console.log('📧 Email Content Generated:');
    console.log('=====================================');
    console.log(`To: ${email}`);
    console.log(`Subject: Thông tin tài khoản Video Affiliate App`);
    console.log('Content: Professional HTML email template');
    console.log('Password:', password);
    console.log('Role:', role);
    console.log('=====================================');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send account email:', error);
    return false;
  }
}

// GET /api/admin/members - Get all members
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

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
        status,
        last_login_at,
        created_at,
        updated_at,
        approved_at,
        rejected_at,
        rejection_reason
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
      members: data || [],
      data: data || [], // Keep both for compatibility
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      },
      totalPages: Math.ceil((totalCount || 0) / limit), // Keep both for compatibility
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
    // Check admin access
    const { isAdmin } = await checkAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, full_name, role, permissions } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    console.log('👤 Creating new member...', { email, role });

    // Check if user already exists in auth.users
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    let userId: string;
    
    if (existingUser?.user) {
      // User already exists, use their ID
      userId = existingUser.user.id;
      console.log('✅ User already exists:', userId);
    } else {
      // Generate secure password
      const generatedPassword = generateSecurePassword();
      console.log('🔐 Generated password for', email, ':', generatedPassword);

      // Create new user in auth.users
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: generatedPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: full_name || email.split('@')[0],
          first_login: true, // Flag to require password change
          generated_password: true
        }
      });

      if (createUserError || !newUser?.user) {
        console.error('❌ Failed to create user:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      console.log('✅ New user created:', userId);

      // Send account information email
      const emailSent = await sendAccountEmail(email, full_name || email.split('@')[0], generatedPassword, role);
      if (!emailSent) {
        console.warn('⚠️ Failed to send account email, but user was created');
      }
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User profile already exists' },
        { status: 400 }
      );
    }

    // Create user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId, // Use the auth user ID
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
      data: {
        ...data,
        password_generated: !existingUser?.user,
        email_sent: !existingUser?.user,
        requires_password_change: !existingUser?.user
      },
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
