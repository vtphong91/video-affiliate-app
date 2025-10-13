import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/reviews-fast - Fast reviews API with minimal data
export async function GET() {
  try {
    console.log('🚀 Fast reviews API called');
    
    const startTime = Date.now();
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Get only essential fields for dropdown
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, slug, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20); // Limit to 20 for better performance
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (error) {
      console.log('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error
      });
    }
    
    console.log(`✅ Fast reviews fetched: ${reviews?.length || 0} in ${duration}ms`);
    
    return NextResponse.json({
      success: true,
      data: reviews || [],
      duration: `${duration}ms`,
      message: 'Fast reviews fetched successfully'
    });
    
  } catch (error) {
    console.error('❌ Exception in fast reviews API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
