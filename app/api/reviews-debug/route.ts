import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews-debug
 * Debug API để test reviews không cần authentication
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Reviews Debug API called');
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    
    console.log('🔍 Reviews Debug API params:', { page, limit });
    
    const offset = (page - 1) * limit;
    
    console.log('🔍 Fetching reviews from database...');
    
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        slug,
        video_title,
        video_url,
        video_platform,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching reviews:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Database error',
        details: error 
      }, { status: 500 });
    }

    console.log(`✅ Reviews fetched: ${reviews?.length || 0} reviews`);
    
    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews || [],
        totalPages: Math.ceil((reviews?.length || 0) / limit),
        total: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Unhandled error in reviews debug API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
