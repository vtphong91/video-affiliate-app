import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Mock schedules storage (in-memory for now)
let mockSchedules: any[] = [];

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching mock schedules:', mockSchedules.length);
    
    return NextResponse.json({
      success: true,
      data: {
        schedules: mockSchedules,
        pagination: {
          page: 1,
          limit: 10,
          total: mockSchedules.length,
          totalPages: Math.ceil(mockSchedules.length / 10),
        },
      },
    });

  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch schedules' 
      },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📤 Creating schedule:', body);
    
    // Validate required fields
    console.log('🔍 Validating fields:');
    console.log('  reviewId:', body.reviewId, typeof body.reviewId);
    console.log('  scheduledFor:', body.scheduledFor, typeof body.scheduledFor);
    
    if (!body.reviewId || !body.scheduledFor) {
      console.log('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: reviewId, scheduledFor',
          details: {
            reviewId: body.reviewId,
            scheduledFor: body.scheduledFor,
            reviewIdType: typeof body.reviewId,
            scheduledForType: typeof body.scheduledFor
          }
        },
        { status: 400 }
      );
    }
    
    // Create mock schedule
    const mockSchedule = {
      id: 'schedule-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      user_id: 'default-user',
      review_id: body.reviewId,
      scheduled_for: body.scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: body.targetType || 'page',
      target_id: body.targetId || 'make-com-handled',
      target_name: body.targetName || 'Make.com Auto',
      post_message: body.postMessage || 'Auto-generated from review',
      landing_page_url: body.landingPageUrl || 'https://example.com/review/auto',
      status: 'pending',
      posted_at: null,
      facebook_post_id: null,
      facebook_post_url: null,
      error_message: null,
      retry_count: 0,
      max_retries: 3,
      next_retry_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Add review data for display
      reviews: {
        id: body.reviewId,
        video_title: 'Mock Review Title',
        video_thumbnail: 'https://via.placeholder.com/300x200',
        slug: 'mock-review-slug'
      }
    };
    
    // Add to mock storage
    mockSchedules.push(mockSchedule);
    
    console.log('✅ Schedule created successfully:', mockSchedule.id);
    console.log('📊 Total schedules:', mockSchedules.length);
    
    return NextResponse.json({
      success: true,
      data: mockSchedule,
      message: 'Schedule created successfully',
    });

  } catch (error) {
    console.error('Error creating schedule:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const scheduleId = pathSegments[pathSegments.length - 1];
    
    if (!scheduleId || scheduleId === 'schedules-mock-storage') {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }
    
    const initialLength = mockSchedules.length;
    mockSchedules = mockSchedules.filter(schedule => schedule.id !== scheduleId);
    
    if (mockSchedules.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Schedule deleted:', scheduleId);
    console.log('📊 Remaining schedules:', mockSchedules.length);
    
    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete schedule' 
      },
      { status: 500 }
    );
  }
}
