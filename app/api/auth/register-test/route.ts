import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing registration API...');
    
    const { full_name, email, password } = await request.json();
    
    if (!email || !password || !full_name) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    console.log('📧 Testing with email:', email);

    // Test 1: Check if user exists in user_profiles
    console.log('🔍 Step 1: Checking existing user...');
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', checkError);
      return NextResponse.json({ error: 'Database error: ' + checkError.message }, { status: 500 });
    }
    
    if (existingProfile) {
      console.log('❌ User already exists');
      return NextResponse.json({ error: 'Email này đã được đăng ký' }, { status: 400 });
    }

    console.log('✅ Step 1 passed: No existing user');

    // Test 2: Create user in auth
    console.log('🔍 Step 2: Creating auth user...');
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (createUserError) {
      console.error('❌ Error creating auth user:', createUserError);
      return NextResponse.json({ error: 'Auth error: ' + createUserError.message }, { status: 500 });
    }

    console.log('✅ Step 2 passed: Auth user created');

    const userId = newUser.user.id;

    // Test 3: Create user profile
    console.log('🔍 Step 3: Creating user profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        full_name: full_name,
        role: 'viewer',
        permissions: [],
        status: 'pending',
        is_active: false,
        registration_source: 'public_registration',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      // Clean up auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('❌ Failed to delete auth user:', deleteError);
      }
      return NextResponse.json({ error: 'Profile error: ' + profileError.message }, { status: 500 });
    }

    console.log('✅ Step 3 passed: User profile created');

    // Test 4: Add to approval queue
    console.log('🔍 Step 4: Adding to approval queue...');
    const { error: queueError } = await supabaseAdmin
      .from('user_approval_queue')
      .insert({
        user_id: userId,
        email: email,
        full_name: full_name,
        requested_at: new Date().toISOString()
      });

    if (queueError) {
      console.error('❌ Error adding to approval queue:', queueError);
      // Don't fail the registration for this
    } else {
      console.log('✅ Step 4 passed: Added to approval queue');
    }

    // Test 5: Log registration
    console.log('🔍 Step 5: Logging registration...');
    const { error: logError } = await supabaseAdmin
      .from('user_registration_logs')
      .insert({
        user_id: userId,
        action: 'registered',
        details: { email, full_name, registration_source: 'public_registration' }
      });

    if (logError) {
      console.error('❌ Error logging registration:', logError);
      // Don't fail the registration for this
    } else {
      console.log('✅ Step 5 passed: Registration logged');
    }

    console.log('🎉 Registration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Tài khoản đang chờ duyệt.',
      user: {
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name,
        status: profileData.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Unhandled registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


