/**
 * Schedule Filter Service - Logic mới: Kiểm tra schedules trước, sau đó filter reviews
 */

import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import type { Review } from '@/types';

interface ReviewWithCategory extends Review {
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * LẤY DANH SÁCH REVIEWS CHỈ CHƯA CÓ TRONG SCHEDULES
 *
 * LOGIC MỚI:
 * 1. Query TẤT CẢ review_ids từ bảng schedules của user
 * 2. Tạo Set chứa các review_ids đã được schedule
 * 3. Filter reviews: loại bỏ những reviews có id trong Set
 *
 * @param userId - ID của user
 * @returns Array reviews chưa bao giờ có trong schedules
 */
export async function getUnscheduledReviews(userId: string): Promise<ReviewWithCategory[]> {
  console.log(`\n🔍 [SCHEDULE FILTER] Starting for user: ${userId}`);

  const supabaseAdmin = getFreshSupabaseAdminClient();

  // ========================================
  // STEP 1: Query TẤT CẢ schedules của user
  // ========================================
  console.log('📊 STEP 1: Fetching ALL schedules for user...');

  const { data: schedules, error: schedulesError } = await supabaseAdmin
    .from('schedules')
    .select('review_id')
    .eq('user_id', userId)
    .not('review_id', 'is', null);

  if (schedulesError) {
    console.error('❌ Error fetching schedules:', schedulesError);
    // Nếu lỗi, return empty để tránh hiển thị sai data
    return [];
  }

  console.log(`✅ Found ${schedules?.length || 0} schedules`);

  // ========================================
  // STEP 2: Tạo Set chứa review_ids đã schedule
  // ========================================
  console.log('📊 STEP 2: Creating Set of scheduled review_ids...');

  const scheduledReviewIds = new Set<string>();

  if (schedules && schedules.length > 0) {
    schedules.forEach(schedule => {
      if (schedule.review_id) {
        scheduledReviewIds.add(schedule.review_id);
      }
    });
  }

  console.log(`✅ Set contains ${scheduledReviewIds.size} unique review_ids`);

  // Log sample IDs
  if (scheduledReviewIds.size > 0) {
    const sampleIds = Array.from(scheduledReviewIds).slice(0, 3);
    console.log(`   Sample scheduled IDs: ${sampleIds.map(id => id.substring(0, 8) + '...').join(', ')}`);
  }

  // ========================================
  // STEP 3: Query CHỈ PUBLISHED reviews của user
  // ========================================
  console.log('📊 STEP 3: Fetching PUBLISHED reviews for user...');

  const { data: allReviews, error: reviewsError } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'published') // ✅ CHỈ lấy reviews đã publish
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('❌ Error fetching reviews:', reviewsError);
    return [];
  }

  console.log(`✅ Found ${allReviews?.length || 0} total reviews`);

  if (!allReviews || allReviews.length === 0) {
    console.log('📭 No reviews found for user');
    return [];
  }

  // ========================================
  // STEP 4: Filter reviews - Loại bỏ những đã schedule
  // ========================================
  console.log('📊 STEP 4: Filtering reviews - exclude scheduled ones...');

  const unscheduledReviews = allReviews.filter(review => {
    const isScheduled = scheduledReviewIds.has(review.id);

    // Debug log cho review đầu tiên
    if (review === allReviews[0]) {
      console.log(`   Example: Review ${review.id.substring(0, 8)}... "${review.video_title?.substring(0, 40)}..."`);
      console.log(`            → Is scheduled? ${isScheduled ? 'YES (exclude)' : 'NO (keep)'}`);
    }

    return !isScheduled; // Chỉ giữ lại reviews CHƯA schedule
  });

  console.log(`✅ Filter result: ${unscheduledReviews.length} unscheduled reviews (excluded ${scheduledReviewIds.size})`);

  // ========================================
  // STEP 5: Fetch categories cho reviews
  // ========================================
  console.log('📊 STEP 5: Fetching categories...');

  const categoryIds = [...new Set(unscheduledReviews.map(r => r.category_id).filter(Boolean))];
  let categoriesMap = new Map();

  if (categoryIds.length > 0) {
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    if (categories) {
      categories.forEach(cat => categoriesMap.set(cat.id, cat));
    }

    console.log(`✅ Loaded ${categories?.length || 0} categories`);
  }

  // ========================================
  // STEP 6: Map categories to reviews
  // ========================================
  const reviewsWithCategories = unscheduledReviews.map(review => ({
    ...review,
    categories: review.category_id ? categoriesMap.get(review.category_id) : null
  }));

  // ========================================
  // FINAL SUMMARY
  // ========================================
  console.log('\n📊 [SUMMARY]');
  console.log(`   Total reviews: ${allReviews.length}`);
  console.log(`   Scheduled (exclude): ${scheduledReviewIds.size}`);
  console.log(`   Unscheduled (return): ${reviewsWithCategories.length}`);
  console.log('✅ [SCHEDULE FILTER] Completed\n');

  return reviewsWithCategories;
}

/**
 * KIỂM TRA XEM MỘT REVIEW CÓ ĐƯỢC SCHEDULE CHƯA
 *
 * @param reviewId - ID của review cần check
 * @param userId - ID của user
 * @returns true nếu đã có schedule, false nếu chưa
 */
export async function isReviewScheduled(reviewId: string, userId: string): Promise<boolean> {
  const supabaseAdmin = getFreshSupabaseAdminClient();

  const { data, error } = await supabaseAdmin
    .from('schedules')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.error('❌ Error checking schedule:', error);
    return false; // Nếu lỗi, assume chưa schedule để safe
  }

  const hasSchedule = data && data.length > 0;

  console.log(`🔍 Review ${reviewId.substring(0, 8)}... is scheduled? ${hasSchedule ? 'YES' : 'NO'}`);

  return hasSchedule;
}
