import { NextResponse } from 'next/server';
import { getAllReviewsForUser } from '@/lib/services/review-service';
import { createClient } from '@supabase/supabase-js';

/**
 * Debug endpoint to trace exactly where the review is being lost
 */
export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    console.log('\n========== DEBUG RPC FULL ==========');

    // Step 1: Get actual database count
    const { count: dbCount } = await admin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    console.log(`Step 1: Database count = ${dbCount}`);

    // Step 2: Call RPC directly
    const { data: rpcReviews, error: rpcError } = await admin
      .rpc('get_user_reviews', { p_user_id: userId });

    console.log(`Step 2: RPC returned ${rpcReviews?.length || 0} reviews`);
    if (rpcError) {
      console.error('RPC Error:', rpcError);
    }

    // Step 3: Get all IDs from RPC
    const rpcIds = rpcReviews?.map(r => r.id) || [];
    console.log(`Step 3: RPC IDs count = ${rpcIds.length}`);

    // Step 4: Call service layer function
    const serviceReviews = await getAllReviewsForUser(userId);
    console.log(`Step 4: Service layer returned ${serviceReviews.length} reviews`);

    // Step 5: Compare IDs
    const serviceIds = serviceReviews.map(r => r.id);
    const rpcIdsSet = new Set(rpcIds);
    const serviceIdsSet = new Set(serviceIds);

    const missingInService = rpcIds.filter(id => !serviceIdsSet.has(id));
    const extraInService = serviceIds.filter(id => !rpcIdsSet.has(id));

    console.log(`Step 5: Missing in service = ${missingInService.length}`);
    console.log('Missing IDs:', missingInService);

    // Step 6: Check categories
    const categoryIds = [...new Set(rpcReviews?.map(r => r.category_id).filter(Boolean) || [])];
    console.log(`Step 6: Unique category IDs = ${categoryIds.length}`);

    const { data: categories } = await admin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    console.log(`Step 6: Categories fetched = ${categories?.length || 0}`);

    // Step 7: Check if any review has null category that doesn't exist
    const categoriesMap = new Map(categories?.map(c => [c.id, c]) || []);
    const reviewsWithMissingCategory = rpcReviews?.filter(r =>
      r.category_id && !categoriesMap.has(r.category_id)
    ) || [];

    console.log(`Step 7: Reviews with missing category = ${reviewsWithMissingCategory.length}`);

    // Step 8: Map categories manually
    const manualMapping = rpcReviews?.map(review => ({
      ...review,
      categories: review.category_id ? categoriesMap.get(review.category_id) : null
    })) || [];

    console.log(`Step 8: After manual mapping = ${manualMapping.length}`);

    console.log('========================================\n');

    return NextResponse.json({
      steps: {
        step1_database_count: dbCount,
        step2_rpc_count: rpcReviews?.length || 0,
        step3_rpc_ids_count: rpcIds.length,
        step4_service_count: serviceReviews.length,
        step5_missing_count: missingInService.length,
        step6_categories_count: categories?.length || 0,
        step7_missing_category_count: reviewsWithMissingCategory.length,
        step8_manual_mapping_count: manualMapping.length,
      },
      lost_reviews: {
        missing_in_service: missingInService,
        extra_in_service: extraInService,
        reviews_with_missing_category: reviewsWithMissingCategory.map(r => ({
          id: r.id,
          title: r.video_title,
          category_id: r.category_id
        })),
      },
      missing_review_details: missingInService.length > 0
        ? rpcReviews?.filter(r => missingInService.includes(r.id)).map(r => ({
            id: r.id,
            created_at: r.created_at,
            title: r.video_title,
            category_id: r.category_id,
            status: r.status,
            has_category: !!r.category_id,
            category_exists: r.category_id ? categoriesMap.has(r.category_id) : null,
          }))
        : [],
      conclusion: {
        data_lost_in_rpc: (rpcReviews?.length || 0) < (dbCount || 0),
        data_lost_in_service: serviceReviews.length < (rpcReviews?.length || 0),
        data_lost_in_category_mapping: manualMapping.length < (rpcReviews?.length || 0),
        problem_location:
          (rpcReviews?.length || 0) < (dbCount || 0) ? 'RPC function itself' :
          serviceReviews.length < (rpcReviews?.length || 0) ? 'Service layer (getAllReviewsForUser)' :
          manualMapping.length < (rpcReviews?.length || 0) ? 'Category mapping' :
          'Unknown - check UI rendering'
      }
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
