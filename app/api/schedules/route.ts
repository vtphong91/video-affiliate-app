import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { supabaseAdmin } from '@/lib/db/supabase';
import { z } from 'zod';
import { requireAuth, getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { ActivityLogger } from '@/lib/utils/activity-logger';

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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      console.log('❌ No user ID found in request');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    console.log('👤 Authenticated user ID:', userId);
    
    // Verify user exists in user_profiles table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, role, status, is_active')
      .eq('id', userId)
      .single();
    
    if (profileError || !userProfile) {
      console.log('❌ User profile not found:', profileError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'User profile not found' 
        },
        { status: 404 }
      );
    }
    
    if (!userProfile.is_active || userProfile.status !== 'active') {
      console.log('❌ User not active:', { status: userProfile.status, is_active: userProfile.is_active });
      return NextResponse.json(
        { 
          success: false, 
          error: 'User account is not active' 
        },
        { status: 403 }
      );
    }
    
    console.log('✅ User profile verified:', { email: userProfile.email, role: userProfile.role });

    // Get total count for pagination (user-specific)
    const totalCount = await db.getSchedulesCount(userId, status || undefined);
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated schedules (user-specific)
    const schedules = await db.getSchedules(userId, status || undefined, limit, (page - 1) * limit);

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
    
    // Get authenticated user ID
    const userId = await requireAuth(request);
    console.log('👤 Authenticated user ID:', userId);
    
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
    
    // Generate complete post message using Facebook module
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const landingUrl = `${baseUrl}/review/${review.slug}`;
    
    // Import the Facebook post formatter
    const { formatFacebookPost } = await import('@/lib/apis/facebook');
    
    const realPostMessage = formatFacebookPost({
      title: review.video_title,
      summary: review.review_summary || review.summary || 'Đánh giá chi tiết về sản phẩm',
      pros: review.review_pros || review.pros || [],
      cons: review.review_cons || review.cons || [],
      targetAudience: review.review_target_audience || review.target_audience || [],
      keywords: review.review_seo_keywords || review.seo_keywords || [],
      channelName: review.channel_name,
      landingUrl: landingUrl
    });
    
    console.log('📝 Generated real post message:', realPostMessage.substring(0, 100) + '...');
    
    // Get affiliate_links from validated data or review (prioritize validated data)
    const affiliateLinksArray = validatedData.affiliate_links || review.affiliate_links || [];
    
    console.log('🔍 API schedules affiliate_links debug:', {
      validatedData_affiliate_links: validatedData.affiliate_links,
      review_affiliate_links: review.affiliate_links,
      final_array: affiliateLinksArray,
      array_length: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'not array',
      array_type: typeof affiliateLinksArray
    });
    
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
      post_message: realPostMessage, // Always use real post message from Facebook module
      landing_page_url: validatedData.landingPageUrl || landingUrl, // Use real landing URL
      affiliate_links: affiliateLinksArray, // Save as jsonb array instead of text
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      // Add review information to schedules table
      video_title: review.video_title,
      video_url: review.video_url,
      video_thumbnail: review.video_thumbnail,
      channel_name: review.channel_name,
      review_summary: review.review_summary || review.summary,
      review_pros: review.review_pros || review.pros,
      review_cons: review.review_cons || review.cons,
      review_key_points: review.review_key_points || review.key_points,
      review_target_audience: review.review_target_audience || review.target_audience,
      review_cta: review.review_cta || review.cta,
      review_seo_keywords: review.review_seo_keywords || review.seo_keywords,
    });

    console.log('✅ Schedule created successfully:', schedule.id);

    // Log activity
    await ActivityLogger.scheduleCreated(userId, schedule.id, validatedData.scheduledFor);

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
