import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Check if supabaseAdmin is properly configured
    console.log('🔍 Step 1: Checking supabaseAdmin...');
    console.log('supabaseAdmin type:', typeof supabaseAdmin);
    console.log('supabaseAdmin.auth:', typeof supabaseAdmin?.auth);
    console.log('supabaseAdmin.auth.admin:', typeof supabaseAdmin?.auth?.admin);
    
    if (!supabaseAdmin || !supabaseAdmin.auth || !supabaseAdmin.auth.admin) {
      return NextResponse.json({ 
        error: 'Supabase admin client not properly configured',
        details: {
          hasSupabaseAdmin: !!supabaseAdmin,
          hasAuth: !!supabaseAdmin?.auth,
          hasAdmin: !!supabaseAdmin?.auth?.admin
        }
      }, { status: 500 });
    }

    // Test 2: Check available methods
    console.log('🔍 Step 2: Checking available methods...');
    const adminMethods = Object.getOwnPropertyNames(supabaseAdmin.auth.admin);
    console.log('Available admin methods:', adminMethods);

    // Test 3: Try to create a simple user
    console.log('🔍 Step 3: Testing user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    
    const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Test User' }
    });

    if (createUserError) {
      console.error('❌ Error creating user:', createUserError);
      return NextResponse.json({ 
        error: 'Failed to create user',
        details: createUserError
      }, { status: 500 });
    }

    console.log('✅ User created successfully:', newUser.user.id);

    // Test 4: Clean up - delete the test user
    console.log('🔍 Step 4: Cleaning up test user...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test user:', deleteError);
    } else {
      console.log('✅ Test user deleted successfully');
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection test passed',
      details: {
        userCreated: true,
        userDeleted: !deleteError,
        availableMethods: adminMethods
      }
    });

  } catch (error) {
    console.error('❌ Supabase test error:', error);
    return NextResponse.json({
      error: 'Supabase test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


