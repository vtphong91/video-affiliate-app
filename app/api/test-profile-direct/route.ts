import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/test-profile-direct - Test direct profile fetch
export async function GET() {
  try {
    console.log('🔍 Testing direct profile fetch...');
    
    const startTime = Date.now();
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Test direct query without timeout
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1')
      .single();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Direct profile fetch test completed:', {
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
      message: `Direct profile fetch took ${duration}ms`
    });
  } catch (error) {
    console.error('❌ Exception in direct profile fetch test:', error);
    return NextResponse.json({
      success: false,
      error: 'Direct profile fetch test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
