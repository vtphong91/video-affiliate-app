import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug-reviews-status
 * Debug API để check reviews status
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Reviews Status API called');
    
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        slug,
        video_title,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching reviews status:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch reviews status' 
      }, { status: 500 });
    }

    console.log(`✅ Found ${reviews?.length || 0} reviews`);
    
    // Group by status
    const statusCounts = reviews?.reduce((acc, review) => {
      const status = review.status || 'null';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        statusCounts,
        total: reviews?.length || 0
      }
    });
  } catch (error) {
    console.error('❌ Debug Reviews Status API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}


