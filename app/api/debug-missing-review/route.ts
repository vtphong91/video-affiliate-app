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
  const missingId = 'i3cf25b4-531c-4a43-8fbb-7d3ee8e01a0b';

  // Test 1: Get the specific missing review with ALL fields
  const { data: specificReview, error: specificError } = await admin
    .from('reviews')
    .select('*')
    .eq('id', missingId)
    .single();

  // Test 2: Try with explicit fields
  const { data: explicitFields, error: explicitError } = await admin
    .from('reviews')
    .select(`
      id, user_id, slug, video_url, video_platform, video_id,
      video_title, video_thumbnail, video_description,
      channel_name, channel_url, custom_title, summary,
      pros, cons, key_points, comparison_table,
      target_audience, seo_keywords, affiliate_links,
      category_id, status, views, clicks, created_at, updated_at
    `)
    .eq('id', missingId)
    .single();

  // Test 3: Check if it appears in user's reviews list with select('*')
  const { data: allReviewsStar, error: starError } = await admin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Test 4: Check if it appears with explicit fields
  const { data: allReviewsExplicit, error: explicitListError } = await admin
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

  const hasMissingInStar = allReviewsStar?.some(r => r.id === missingId);
  const hasMissingInExplicit = allReviewsExplicit?.some(r => r.id === missingId);

  return NextResponse.json({
    missingId,
    test1_selectStar: {
      found: !!specificReview,
      error: specificError,
      data: specificReview ? {
        id: specificReview.id,
        title: specificReview.video_title,
        created_at: specificReview.created_at,
        user_id: specificReview.user_id,
        // Check for problematic fields
        hasNullFields: Object.entries(specificReview).filter(([k, v]) => v === null).map(([k]) => k),
        hasUndefinedFields: Object.entries(specificReview).filter(([k, v]) => v === undefined).map(([k]) => k),
      } : null,
    },
    test2_explicitFields: {
      found: !!explicitFields,
      error: explicitError,
      data: explicitFields ? {
        id: explicitFields.id,
        title: explicitFields.video_title,
        created_at: explicitFields.created_at,
      } : null,
    },
    test3_allReviewsStar: {
      total: allReviewsStar?.length,
      hasMissing: hasMissingInStar,
      error: starError,
    },
    test4_allReviewsExplicit: {
      total: allReviewsExplicit?.length,
      hasMissing: hasMissingInExplicit,
      error: explicitListError,
    },
    comparison: {
      star_vs_explicit: {
        starCount: allReviewsStar?.length,
        explicitCount: allReviewsExplicit?.length,
        difference: (allReviewsStar?.length || 0) - (allReviewsExplicit?.length || 0),
      },
      missingInStar: !hasMissingInStar,
      missingInExplicit: !hasMissingInExplicit,
    },
  });
}
