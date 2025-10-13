import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/test-reviews-status
 * Test API để check reviews status không cần auth
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Reviews Status API called');
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '5');
    
    console.log(`🔍 Fetching reviews with status: ${status}, limit: ${limit}`);
    
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        slug,
        video_title,
        video_thumbnail,
        status,
        created_at,
        user_id
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching reviews:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch reviews' 
      }, { status: 500 });
    }

    console.log(`✅ Found ${reviews?.length || 0} reviews with status: ${status}`);
    
    return NextResponse.json({
      success: true,
      data: {
        reviews,
        status,
        count: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Test Reviews Status API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
