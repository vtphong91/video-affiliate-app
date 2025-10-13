import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/update-review-status
 * API để update review status
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Update Review Status API called');
    
    const body = await request.json();
    const { reviewId, status } = body;
    
    if (!reviewId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing reviewId or status' 
      }, { status: 400 });
    }
    
    console.log(`🔍 Updating review ${reviewId} to status: ${status}`);
    
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({ status })
      .eq('id', reviewId)
      .select();
    
    if (error) {
      console.error('❌ Error updating review status:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update review status' 
      }, { status: 500 });
    }
    
    console.log(`✅ Review ${reviewId} updated to ${status}`);
    
    return NextResponse.json({
      success: true,
      data: {
        reviewId,
        status,
        updatedReview: data[0]
      }
    });
  } catch (error) {
    console.error('❌ Update Review Status API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An unexpected error occurred',
      details: error 
    }, { status: 500 });
  }
}
