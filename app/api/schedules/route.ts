import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schemas
const createScheduleSchema = z.object({
  reviewId: z.string().min(1), // Keep as string, not UUID
  scheduledFor: z.string().refine((val) => {
    // Accept both ISO format and GMT+7 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    const gmt7Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/;
    return isoRegex.test(val) || gmt7Regex.test(val) || !isNaN(Date.parse(val));
  }, {
    message: "Invalid datetime format. Expected ISO format or GMT+7 format"
  }),
  targetType: z.enum(['page', 'group']),
  targetId: z.string().optional(), // Make.com sẽ xử lý
  targetName: z.string().optional(),
  postMessage: z.string().optional(), // Make.com sẽ xử lý
  landingPageUrl: z.string().optional(), // Make.com sẽ xử lý
  affiliate_links: z.array(z.object({
    url: z.string(),
    price: z.string(),
    discount: z.string().optional(),
    platform: z.string(),
  })).optional(),
});

const updateScheduleSchema = z.object({
  scheduledFor: z.string().refine((val) => {
    // Accept both ISO format and GMT+7 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    const gmt7Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/;
    return isoRegex.test(val) || gmt7Regex.test(val) || !isNaN(Date.parse(val));
  }, {
    message: "Invalid datetime format. Expected ISO format or GMT+7 format"
  }).optional(),
  targetType: z.enum(['page', 'group']).optional(),
  targetId: z.string().min(1).optional(),
  targetName: z.string().optional(),
  postMessage: z.string().min(1).optional(),
  landingPageUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'posted', 'failed', 'cancelled']).optional(),
});

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get total count for pagination
    const totalCount = await db.getSchedulesCount(userId || undefined, status || undefined);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated schedules
    const schedules = await db.getSchedules(userId || undefined, status || undefined, limit, (page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        total: totalCount,
        totalPages,
        currentPage: page,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
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
    console.log('📥 POST /api/schedules - Starting...');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // Validate input
    console.log('🔍 Validating input...');
    const validatedData = createScheduleSchema.parse(body);
    console.log('✅ Validation passed:', validatedData);
    
    // Get user ID from request (you might need to implement auth)
    const userId = 'default-user-id'; // TODO: Get from auth context
    console.log('👤 User ID:', userId);
    
    // Get review data to populate real values
    console.log('📋 Fetching review data...');
    const review = await db.getReview(validatedData.reviewId);
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        details: `Review with ID ${validatedData.reviewId} does not exist`
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Generate real post message from review (simple version)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const landingUrl = `${baseUrl}/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}`;
    
    console.log('📝 Generated real post message:', realPostMessage.substring(0, 100) + '...');
    
    // Create schedule
    console.log('📤 Creating schedule in database...');
    const schedule = await db.createSchedule({
      user_id: userId,
      review_id: validatedData.reviewId,
      scheduled_for: validatedData.scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: validatedData.targetType,
      target_id: validatedData.targetId || 'make-com-handled',
      target_name: validatedData.targetName || 'Make.com Auto',
      post_message: validatedData.postMessage || realPostMessage, // Use real post message
      landing_page_url: validatedData.landingPageUrl || landingUrl, // Use real landing URL
      affiliate_links: validatedData.affiliate_links || review.affiliate_links || [], // Use affiliate_links from request or review
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    });

    console.log('✅ Schedule created successfully:', schedule.id);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
    });

  } catch (error) {
    console.error('❌ Error creating schedule:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Validation errors:', error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Log the actual error for debugging
    console.error('❌ Database error:', error);
    
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
