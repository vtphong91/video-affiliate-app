import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Fresh admin client
function getFreshAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// GET /api/reviews-available - NEW endpoint with inline logic (bypass cache)
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [NEW] Reviews-available API called');

    const startTime = Date.now();

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID:', userId);

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const supabaseAdmin = getFreshAdminClient();

    // STEP 1: Get all reviews for user
    const { data: allReviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, slug, created_at, affiliate_links, status, user_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError);
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    if (!allReviews || allReviews.length === 0) {
      console.log('📭 No reviews found');
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No reviews found'
      });
    }

    console.log(`📥 Found ${allReviews.length} total reviews`);

    // STEP 2: Get ALL schedules for this user
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('schedules')
      .select('review_id')
      .eq('user_id', userId)
      .not('review_id', 'is', null);

    if (schedulesError) {
      console.error('❌ Error fetching schedules:', schedulesError);
      // Continue without filtering if error
      return NextResponse.json({
        success: true,
        data: allReviews.map(r => ({
          id: r.id,
          video_title: r.video_title,
          slug: r.slug,
          created_at: r.created_at,
          affiliate_links: r.affiliate_links,
          status: r.status
        })),
        message: 'All reviews (filter failed)'
      });
    }

    // STEP 3: Create Set of scheduled review IDs
    const scheduledIds = new Set(schedules?.map(s => s.review_id) || []);

    console.log(`📊 Scheduled reviews: ${scheduledIds.size}`);

    // STEP 4: Filter out reviews that have been scheduled
    const availableReviews = allReviews.filter(review => !scheduledIds.has(review.id));

    console.log(`✅ Available reviews: ${availableReviews.length} (excluded ${scheduledIds.size})`);

    // Map to dropdown format
    const reviewsForDropdown = availableReviews.map(review => ({
      id: review.id,
      video_title: review.video_title,
      slug: review.slug,
      created_at: review.created_at,
      affiliate_links: review.affiliate_links,
      status: review.status
    }));

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Aggressive no-cache headers
    const response = NextResponse.json({
      success: true,
      data: reviewsForDropdown,
      stats: {
        total: allReviews.length,
        scheduled: scheduledIds.size,
        available: availableReviews.length
      },
      duration: `${duration}ms`,
      message: 'Available reviews fetched successfully'
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('❌ Exception in reviews-available API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
