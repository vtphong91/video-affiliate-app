import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Debug API để test schedule creation
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedule Creation...');
    
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    // Step 1: Check if reviewId exists in reviews table
    if (body.reviewId) {
      try {
        const review = await db.getReview(body.reviewId);
        console.log('✅ Review found:', review ? 'Yes' : 'No');
        if (review) {
          console.log('📋 Review details:', {
            id: review.id,
            title: review.video_title,
            status: review.status
          });
        }
      } catch (error) {
        console.log('❌ Review not found:', error);
        return NextResponse.json({
          success: false,
          error: 'Review not found',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 404 });
      }
    }
    
    // Step 2: Test validation
    const createScheduleSchema = z.object({
      reviewId: z.string().uuid(),
      scheduledFor: z.string().datetime(),
      targetType: z.enum(['page', 'group']),
      targetId: z.string().optional(),
      targetName: z.string().optional(),
      postMessage: z.string().optional(),
      landingPageUrl: z.string().optional(),
    });
    
    try {
      const validatedData = createScheduleSchema.parse(body);
      console.log('✅ Validation passed:', validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('❌ Validation failed:', error.errors);
        return NextResponse.json({
          success: false,
          error: 'Validation error',
          details: error.errors
        }, { status: 400 });
      }
    }
    
    // Step 3: Test database insert
    try {
      const scheduleData = {
        user_id: 'default-user-id',
        review_id: body.reviewId,
        scheduled_for: body.scheduledFor,
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: body.targetType || 'page',
        target_id: body.targetId || 'make-com-handled',
        target_name: body.targetName || 'Make.com Auto',
        post_message: body.postMessage || 'Auto-generated from review',
        landing_page_url: body.landingPageUrl || 'https://example.com/review/auto',
        status: 'pending' as const,
        retry_count: 0,
        max_retries: 3,
      };
      
      console.log('📤 Schedule data to insert:', scheduleData);
      
      const schedule = await db.createSchedule(scheduleData);
      console.log('✅ Schedule created successfully:', schedule.id);
      
      return NextResponse.json({
        success: true,
        data: schedule,
        message: 'Schedule created successfully',
        debug: {
          reviewExists: true,
          validationPassed: true,
          databaseInsertSuccess: true
        }
      });
      
    } catch (error) {
      console.log('❌ Database insert failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          reviewExists: true,
          validationPassed: true,
          databaseInsertSuccess: false
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint để list available reviews
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Getting available reviews for debugging...');
    
    const reviews = await db.getReviews();
    console.log(`📊 Found ${reviews.length} reviews`);
    
    const reviewList = reviews.map(review => ({
      id: review.id,
      title: review.video_title,
      status: review.status,
      slug: review.slug
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        reviews: reviewList,
        count: reviews.length
      },
      message: 'Available reviews for schedule creation'
    });
    
  } catch (error) {
    console.error('❌ Error getting reviews:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
