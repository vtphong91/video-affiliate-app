import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedules Table Structure - Starting...');
    
    // 1. Get all schedules with review information
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        review_id,
        video_title,
        status,
        scheduled_for,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    if (schedulesError) {
      throw new Error(`Schedules error: ${schedulesError.message}`);
    }
    
    // 2. Get all reviews
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, slug, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      throw new Error(`Reviews error: ${reviewsError.message}`);
    }
    
    // 3. Analyze relationships
    const analysis = {
      schedules: schedules?.map(schedule => ({
        scheduleId: schedule.id,
        reviewId: schedule.review_id,
        scheduleVideoTitle: schedule.video_title,
        scheduleStatus: schedule.status,
        scheduledFor: schedule.scheduled_for,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
        hasReviewId: !!schedule.review_id,
        reviewExists: reviews?.some(r => r.id === schedule.review_id) || false
      })) || [],
      
      reviews: reviews?.map(review => ({
        reviewId: review.id,
        videoTitle: review.video_title,
        slug: review.slug,
        status: review.status,
        isScheduled: schedules?.some(s => s.review_id === review.id) || false,
        scheduleCount: schedules?.filter(s => s.review_id === review.id).length || 0
      })) || []
    };
    
    // 4. Find issues
    const issues = [];
    
    // Check for schedules without review_id
    const schedulesWithoutReviewId = analysis.schedules.filter(s => !s.hasReviewId);
    if (schedulesWithoutReviewId.length > 0) {
      issues.push(`${schedulesWithoutReviewId.length} schedules have no review_id`);
    }
    
    // Check for schedules with non-existent review_id
    const schedulesWithInvalidReviewId = analysis.schedules.filter(s => s.hasReviewId && !s.reviewExists);
    if (schedulesWithInvalidReviewId.length > 0) {
      issues.push(`${schedulesWithInvalidReviewId.length} schedules reference non-existent reviews`);
    }
    
    // Check for reviews that are scheduled multiple times
    const reviewsScheduledMultipleTimes = analysis.reviews.filter(r => r.scheduleCount > 1);
    if (reviewsScheduledMultipleTimes.length > 0) {
      issues.push(`${reviewsScheduledMultipleTimes.length} reviews are scheduled multiple times`);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSchedules: schedules?.length || 0,
          totalReviews: reviews?.length || 0,
          schedulesWithReviewId: analysis.schedules.filter(s => s.hasReviewId).length,
          schedulesWithoutReviewId: analysis.schedules.filter(s => !s.hasReviewId).length,
          reviewsScheduled: analysis.reviews.filter(r => r.isScheduled).length,
          reviewsAvailable: analysis.reviews.filter(r => !r.isScheduled).length
        },
        analysis,
        issues,
        recommendations: {
          problems: issues.length > 0 ? issues : ['No structural issues found'],
          actions: [
            'Verify review_id foreign key relationships',
            'Check if schedules are properly linked to reviews',
            'Ensure used-review-ids API returns correct data',
            'Test CreateScheduleDialog filtering with real data'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug schedules structure:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
