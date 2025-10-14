import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing constraint fix...');
    
    // Test creating a user profile with 'viewer' role
    const testUserId = 'test-user-' + Date.now();
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('🔍 Step 1: Creating auth user...');
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'Test123!@#',
      email_confirm: true,
      user_metadata: { full_name: 'Test User' }
    });

    if (createUserError) {
      console.error('❌ Error creating auth user:', createUserError);
      return NextResponse.json({ error: 'Auth error: ' + createUserError.message }, { status: 500 });
    }

    console.log('✅ Auth user created:', newUser.user.id);

    console.log('🔍 Step 2: Creating user profile with viewer role...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        email: testEmail,
        full_name: 'Test User',
        role: 'viewer', // This should work now
        permissions: [],
        status: 'pending',
        is_active: false,
        registration_source: 'test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError);
      // Clean up auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      } catch (deleteError) {
        console.error('❌ Failed to delete auth user:', deleteError);
      }
      return NextResponse.json({ 
        error: 'Profile error: ' + profileError.message,
        details: profileError
      }, { status: 500 });
    }

    console.log('✅ User profile created successfully!');

    // Clean up
    console.log('🔍 Step 3: Cleaning up...');
    try {
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      console.log('✅ Test user deleted successfully');
    } catch (deleteError) {
      console.error('❌ Failed to delete test user:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Constraint fix test passed! Registration should work now.',
      details: {
        userCreated: true,
        profileCreated: true,
        role: 'viewer',
        constraintFixed: true
      }
    });

  } catch (error) {
    console.error('❌ Constraint test error:', error);
    return NextResponse.json({
      error: 'Constraint test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


