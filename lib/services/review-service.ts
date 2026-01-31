// @ts-nocheck
/**
 * Review Service - Centralized review data fetching logic
 * All review queries go through this service
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
 * Fetch all reviews for a user (no filters)
 */
export async function getAllReviewsForUser(userId: string): Promise<ReviewWithCategory[]> {
  console.log(`📥 Fetching ALL reviews for user: ${userId}`);

  // ✅ USE CENTRALIZED FRESH CLIENT with cache-busting headers
  const supabaseAdmin = getFreshSupabaseAdminClient();

  // ✅ USE DIRECT QUERY - RPC function has caching issues
  const timestamp = Date.now();
  console.log(`🔄 Using DIRECT QUERY with fresh client... (ts: ${timestamp})`);

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log(`📥 [DIRECT] Returned ${reviews?.length || 0} reviews`);

  if (error) {
    console.error('❌ Error from direct query:', error);
    throw new Error(`Failed to fetch reviews: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    console.log('📭 No reviews found for user');
    return [];
  }

  // Already sorted by database
  // 📊 STATISTICS: Count by status
  const draftCount = reviews.filter((r: any) => r.status === 'draft').length;
  const publishedCount = reviews.filter((r: any) => r.status === 'published').length;

  console.log(`✅ [ALL REVIEWS] Total: ${reviews.length} reviews`);
  console.log(`📊 [STATISTICS] Draft: ${draftCount}, Published: ${publishedCount}`);
  console.log(`📋 [FIRST 3] IDs:`, reviews.slice(0, 3).map((r: any) => `${r.id.substring(0, 8)}... (${r.status})`));

  // 🔍 DEBUG: Check if the specific draft reviews are present
  const draftId1 = 'ebf7dcde-eeb0-46a0-997c-5d77f9f41128'; // MÁY XAY SINH TỐ
  const draftId2 = 'c014b170-30fb-428b-8e66-e3a82cf1b48e'; // Nồi cơm điện
  const hasDraft1 = reviews.some((r: any) => r.id === draftId1);
  const hasDraft2 = reviews.some((r: any) => r.id === draftId2);
  console.log(`🔍 [DEBUG] Contains draft ${draftId1.substring(0, 8)}...: ${hasDraft1 ? 'YES ✅' : 'NO ❌'}`);
  console.log(`🔍 [DEBUG] Contains draft ${draftId2.substring(0, 8)}...: ${hasDraft2 ? 'YES ✅' : 'NO ❌'}`);

  // Fetch categories separately
  const categoryIds = [...new Set(reviews.map((r: any) => r.category_id).filter(Boolean))];
  let categoriesMap = new Map();

  if (categoryIds.length > 0) {
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    if (categories) {
      categories.forEach(cat => categoriesMap.set(cat.id, cat));
    }
  }

  // Map categories to reviews
  const reviewsWithCategories = reviews.map((review: any) => ({
    ...review,
    categories: review.category_id ? categoriesMap.get(review.category_id) : null
  }));

  console.log(`📤 Returning ${reviewsWithCategories.length} reviews after category mapping`);

  return reviewsWithCategories;
}

/**
 * Fetch reviews with status filter
 */
export async function getReviewsByStatus(
  userId: string,
  status: 'draft' | 'published'
): Promise<ReviewWithCategory[]> {
  console.log(`📥 Fetching ${status} reviews for user: ${userId}`);

  const supabaseAdmin = getFreshSupabaseAdminClient();

  // ✅ USE DIRECT QUERY - RPC function has caching issues
  const timestamp = Date.now();
  console.log(`🔄 Using DIRECT QUERY for ${status}... (ts: ${timestamp})`);

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  console.log(`📥 [DIRECT ${status.toUpperCase()}] Returned ${reviews?.length || 0} reviews`);

  // 🔍 DEBUG: Log all review IDs to find which ones are missing
  if (reviews && reviews.length > 0) {
    console.log('🔍 [DEBUG] All returned review IDs:');
    reviews.forEach((r: any, i: number) => {
      console.log(`   ${i + 1}. ${r.id} - ${r.video_title?.substring(0, 50)}`);
    });
  }

  if (error) {
    console.error(`❌ Error fetching ${status} reviews:`, error);
    throw new Error(`Failed to fetch ${status} reviews: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    console.log(`📭 [BY STATUS] No ${status} reviews found`);
    return [];
  }

  console.log(`✅ [BY STATUS: ${status}] Total: ${reviews.length} reviews`);
  console.log(`📋 [FIRST 3] IDs:`, reviews.slice(0, 3).map((r: any) => `${r.id.substring(0, 8)}... (${r.status})`));

  // Fetch categories
  const categoryIds = [...new Set(reviews.map((r: any) => r.category_id).filter(Boolean))];
  let categoriesMap = new Map();

  if (categoryIds.length > 0) {
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    if (categories) {
      categories.forEach(cat => categoriesMap.set(cat.id, cat));
    }
  }

  return reviews.map((review: any) => ({
    ...review,
    categories: review.category_id ? categoriesMap.get(review.category_id) : null
  }));
}

/**
 * Get paginated reviews
 */
export async function getPaginatedReviews(
  userId: string,
  page: number,
  limit: number,
  statusFilter?: 'draft' | 'published'
): Promise<{
  reviews: ReviewWithCategory[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  console.log(`📄 Fetching page ${page} (limit: ${limit}) for user: ${userId}`);

  // Fetch all reviews first (with optional status filter)
  let allReviews: ReviewWithCategory[];

  if (statusFilter) {
    allReviews = await getReviewsByStatus(userId, statusFilter);
  } else {
    allReviews = await getAllReviewsForUser(userId);
  }

  // Calculate pagination
  const total = allReviews.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Slice for current page
  const reviews = allReviews.slice(offset, offset + limit);

  console.log(`✅ Page ${page}: ${reviews.length} reviews (total: ${total})`);

  return {
    reviews,
    total,
    totalPages,
    currentPage: page,
  };
}

/**
 * Get all published reviews (for public page)
 */
export async function getAllPublishedReviews(): Promise<ReviewWithCategory[]> {
  console.log('📥 Fetching ALL published reviews');

  // ✅ Use fresh admin client
  const supabaseAdmin = getFreshSupabaseAdminClient();

  // ✅ USE DIRECT QUERY - RPC function has caching issues
  const timestamp = Date.now();
  console.log(`🔄 Using DIRECT QUERY for published... (ts: ${timestamp})`);

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  console.log(`📥 [DIRECT] Returned ${reviews?.length || 0} published reviews`);

  if (error) {
    console.error('❌ [DIRECT] Error fetching published reviews:', error);
    throw new Error(`Failed to fetch published reviews: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    console.log('📭 [DIRECT] No published reviews found');
    return [];
  }

  console.log(`✅ [DIRECT] Found ${reviews.length} published reviews (already sorted by DB)`);

  // Fetch categories
  const categoryIds = [...new Set(reviews.map(r => r.category_id).filter(Boolean))];
  let categoriesMap = new Map();

  if (categoryIds.length > 0) {
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    if (categories) {
      categories.forEach(cat => categoriesMap.set(cat.id, cat));
    }
  }

  return reviews.map(review => ({
    ...review,
    categories: review.category_id ? categoriesMap.get(review.category_id) : null
  }));
}

/**
 * Exclude scheduled reviews from list
 * CHỈ hiển thị reviews CHƯA BAO GIỜ có trong bảng schedules
 * Logic đơn giản: review_id NOT IN (SELECT DISTINCT review_id FROM schedules)
 */
export async function excludeScheduledReviews(
  reviews: ReviewWithCategory[]
): Promise<ReviewWithCategory[]> {
  if (reviews.length === 0) return [];

  // ✅ Use fresh admin client
  const supabaseAdmin = getFreshSupabaseAdminClient();

  // ✅ FIX: Query by user_id instead of .in(review_id, array)
  // .in() clause có thể miss một số records khi array quá lớn
  // Lấy user_id từ review đầu tiên (tất cả reviews cùng user)
  const userId = reviews[0].user_id;

  if (!userId) {
    console.error('❌ No user_id found in reviews');
    return reviews;
  }

  // ✅ FIXED: Query by user_id instead of .in() to avoid missing records
  const { data: scheduledReviews, error} = await supabaseAdmin
    .from('schedules')
    .select('review_id')
    .eq('user_id', userId)
    .not('review_id', 'is', null);

  if (error) {
    console.error('❌ Error fetching scheduled reviews:', error);
    return reviews; // Return all if error
  }

  // Lấy danh sách UNIQUE review_id đã từng có schedule
  const scheduledIds = new Set(scheduledReviews?.map(s => s.review_id) || []);

  console.log(`📊 [excludeScheduledReviews] Total reviews: ${reviews.length}, Already scheduled (ever): ${scheduledIds.size}, Available (never scheduled): ${reviews.length - scheduledIds.size}`);

  // Chỉ trả về reviews CHƯA BAO GIỜ có trong schedules
  return reviews.filter(review => !scheduledIds.has(review.id));
}

/**
 * Get reviews by date range (for calendar view)
 * Uses created_at for filtering since reviews don't have scheduled_for
 */
export async function getReviewsByDateRange(
  userId: string,
  startDate: string,
  endDate: string,
  limit: number = 100
): Promise<ReviewWithCategory[]> {
  console.log(`📅 Fetching reviews by date range: ${startDate} to ${endDate}`);

  const supabaseAdmin = getFreshSupabaseAdminClient();

  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('❌ Error fetching reviews by date range:', error);
    throw new Error(`Failed to fetch reviews by date range: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    console.log('📭 No reviews found in date range');
    return [];
  }

  console.log(`✅ Found ${reviews.length} reviews in date range`);

  // Fetch categories
  const categoryIds = [...new Set(reviews.map((r: any) => r.category_id).filter(Boolean))];
  let categoriesMap = new Map();

  if (categoryIds.length > 0) {
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);

    if (categories) {
      categories.forEach(cat => categoriesMap.set(cat.id, cat));
    }
  }

  return reviews.map((review: any) => ({
    ...review,
    categories: review.category_id ? categoriesMap.get(review.category_id) : null
  }));
}
