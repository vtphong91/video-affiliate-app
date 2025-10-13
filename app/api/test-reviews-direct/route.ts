import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/test-reviews-direct - Direct database test
export async function GET() {
  try {
    console.log('🔍 Direct Reviews Test API called');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Simple query without joins - use actual column names
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('id, slug, video_title, video_url, video_platform, affiliate_links, created_at, user_id')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error
      });
    }
    
    console.log('✅ Reviews fetched:', reviews?.length || 0);
    
    return NextResponse.json({
      success: true,
      message: 'Direct database test successful',
      data: {
        reviews: reviews || [],
        total: reviews?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error in direct test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Direct test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
