import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const newestId = '13cf25b4-531c-4a43-8fbb-7d3ee8e01a0b';

  // Test 1: Check if this specific review exists
  const { data: specificReview, error: specificError } = await admin
    .from('reviews')
    .select('id, video_title, created_at, user_id')
    .eq('id', newestId)
    .single();

  // Test 2: Get all reviews with select('*')
  const { data: allReviewsStar, error: starError } = await admin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Test 3: Get all reviews with explicit fields
  const { data: allReviewsExplicit, error: explicitError } = await admin
    .from('reviews')
    .select(`
      id, user_id, slug, video_url, video_platform, video_id,
      video_title, video_thumbnail, video_description,
      channel_name, channel_url, custom_title, summary,
      pros, cons, key_points, comparison_table,
      target_audience, seo_keywords, affiliate_links,
      category_id, status, views, clicks, created_at, updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const hasInStar = allReviewsStar?.some(r => r.id === newestId);
  const hasInExplicit = allReviewsExplicit?.some(r => r.id === newestId);

  return NextResponse.json({
    newestId,
    specificReview: {
      found: !!specificReview,
      error: specificError,
      data: specificReview,
    },
    allReviewsStar: {
      total: allReviewsStar?.length,
      hasNewest: hasInStar,
      error: starError,
      first5Ids: allReviewsStar?.slice(0, 5).map(r => r.id),
    },
    allReviewsExplicit: {
      total: allReviewsExplicit?.length,
      hasNewest: hasInExplicit,
      error: explicitError,
      first5Ids: allReviewsExplicit?.slice(0, 5).map(r => r.id),
    },
    comparison: {
      starCount: allReviewsStar?.length,
      explicitCount: allReviewsExplicit?.length,
      difference: (allReviewsStar?.length || 0) - (allReviewsExplicit?.length || 0),
    },
  });
}
