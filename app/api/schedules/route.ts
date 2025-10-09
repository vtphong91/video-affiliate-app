import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schemas
const createScheduleSchema = z.object({
  reviewId: z.string().min(1), // Keep as string, not UUID
  scheduledFor: z.string().min(1), // Accept any string, we'll validate manually
  targetType: z.enum(['page', 'group']),
  targetId: z.string().optional(), // Make.com sẽ xử lý
  targetName: z.string().optional(),
  postMessage: z.string().optional(), // Make.com sẽ xử lý
  landingPageUrl: z.string().optional(), // Make.com sẽ xử lý
  videoUrl: z.string().optional(), // Additional fields from frontend
  videoThumbnail: z.string().optional(),
  affiliateLinks: z.array(z.any()).optional(),
  channelName: z.string().optional(),
});

const updateScheduleSchema = z.object({
  scheduledFor: z.string().datetime().optional(),
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

    const schedules = await db.getSchedules(userId || undefined, status || undefined);

    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSchedules = schedules.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        schedules: paginatedSchedules,
        pagination: {
          page,
          limit,
          total: schedules.length,
          totalPages: Math.ceil(schedules.length / limit),
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
    
    // Manual datetime validation for GMT+7 format
    const scheduledForDate = new Date(validatedData.scheduledFor);
    if (isNaN(scheduledForDate.getTime())) {
      return NextResponse.json({
        success: false,
        error: 'Invalid datetime format',
        details: `scheduledFor must be a valid datetime string, got: ${validatedData.scheduledFor}`
      }, { status: 400 });
    }
    console.log('✅ Datetime validation passed:', scheduledForDate.toISOString());
    
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
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
    // Format affiliate links
    const formatAffiliateLinks = (affiliateLinks: any[] | null | undefined): string => {
      if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
        return 'Đặt mua giá tốt lại: Không có thông tin';
      }

      const formattedLinks = affiliateLinks.map((link, index) => {
        const platform = link.platform || 'Nền tảng';
        const price = link.price || 'Giá liên hệ';
        const url = link.url || '#';
        
        return `${index + 1}. ${platform} - ${price}: ${url}`;
      }).join('\n');

      return `Đặt mua giá tốt lại:\n${formattedLinks}`;
    };

    const formattedAffiliateLinks = formatAffiliateLinks(review.affiliate_links);
    
    console.log('📝 Generated real post message:', realPostMessage.substring(0, 100) + '...');
    console.log('🔗 Formatted affiliate links:', formattedAffiliateLinks.substring(0, 100) + '...');
    
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
      // Add formatted affiliate links
      affiliate_links: formattedAffiliateLinks,
      video_url: validatedData.videoUrl || review.video_url,
      video_thumbnail: validatedData.videoThumbnail || review.video_thumbnail,
      channel_name: validatedData.channelName || review.channel_name,
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
