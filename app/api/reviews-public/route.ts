import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

// Public endpoint - no authentication required
// Only returns published reviews

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Public Reviews API called');

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Fetch ONLY published reviews (no user filtering - public data)
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        slug,
        video_title,
        video_url,
        video_platform,
        video_thumbnail,
        channel_name,
        summary,
        pros,
        cons,
        target_audience,
        seo_keywords,
        affiliate_links,
        status,
        created_at,
        views
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching public reviews:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Get total count of published reviews
    const { count, error: countError } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (countError) {
      console.error('❌ Error counting reviews:', countError);
    }

    console.log(`✅ Found ${reviews?.length || 0} published reviews`);

    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews || [],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: Math.floor(offset / limit) + 1,
        pagination: {
          limit,
          offset,
          hasMore: (reviews?.length || 0) === limit,
        },
      },
    });
  } catch (error) {
    console.error('❌ Exception in public reviews API:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
