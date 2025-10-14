import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/test-profile-fetch - Test profile fetch performance
export async function GET() {
  try {
    console.log('🔍 Testing profile fetch performance...');
    
    const startTime = Date.now();
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Test profile fetch with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 20000)
    );
    
    const profilePromise = supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1')
      .single();
    
    const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Profile fetch test completed:', {
      duration: `${duration}ms`,
      hasData: !!data,
      error: error?.message,
      dataKeys: data ? Object.keys(data) : null
    });
    
    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      hasData: !!data,
      error: error?.message,
      data: data,
      message: `Profile fetch took ${duration}ms`
    });
  } catch (error) {
    console.error('❌ Exception in profile fetch test:', error);
    return NextResponse.json({
      success: false,
      error: 'Profile fetch test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}


