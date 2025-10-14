import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/create-fallback-profile - Create fallback profile for testing
export async function POST() {
  try {
    console.log('🔍 Creating fallback profile...');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('✅ Profile already exists:', existingProfile);
      return NextResponse.json({
        success: true,
        profile: existingProfile,
        message: 'Profile already exists'
      });
    }
    
    // Create fallback profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
        status: 'active',
        is_active: true,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating fallback profile:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create fallback profile',
        details: createError
      }, { status: 500 });
    }
    
    console.log('✅ Fallback profile created:', newProfile);
    
    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Fallback profile created successfully'
    });
    
  } catch (error) {
    console.error('❌ Exception in create fallback profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create fallback profile',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


