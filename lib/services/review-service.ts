/**
 * Review Service - Centralized review data fetching logic
 * All review queries go through this service
 */

import { createClient } from '@supabase/supabase-js';
import type { Review } from '@/types';

// ✅ Create fresh admin client each time to avoid stale connections
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

  const supabaseAdmin = getFreshAdminClient();

  // ✅ USE RPC FUNCTION - Supabase connection issue with direct queries
  const timestamp = Date.now();
  console.log(`🔄 Using RPC get_user_reviews... (ts: ${timestamp})`);

  const { data: reviews, error } = await supabaseAdmin
    .rpc('get_user_reviews', { p_user_id: userId });

  console.log(`📥 [RPC] Returned ${reviews?.length || 0} reviews`);

  if (error) {
    console.error('❌ Error from RPC:', error);
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

  const supabaseAdmin = getFreshAdminClient();

  // ✅ USE RPC FUNCTION - Supabase connection issue with direct queries
  const timestamp = Date.now();
  console.log(`🔄 Using RPC get_user_reviews_by_status... (ts: ${timestamp})`);

  const { data: reviews, error } = await supabaseAdmin
    .rpc('get_user_reviews_by_status', {
      p_user_id: userId,
      p_status: status
    });

  console.log(`📥 [RPC ${status.toUpperCase()}] Returned ${reviews?.length || 0} reviews`);

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
  const supabaseAdmin = getFreshAdminClient();

  // ✅ Use direct query instead of RPC to avoid cache issues
  const { data: reviews, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ [RPC] Error fetching published reviews:', error);
    throw new Error(`Failed to fetch published reviews: ${error.message}`);
  }

  if (!reviews || reviews.length === 0) {
    console.log('📭 [RPC] No published reviews found');
    return [];
  }

  console.log(`✅ [RPC] Found ${reviews.length} published reviews (already sorted by DB)`);

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
 */
export async function excludeScheduledReviews(
  reviews: ReviewWithCategory[]
): Promise<ReviewWithCategory[]> {
  if (reviews.length === 0) return [];

  // ✅ Use fresh admin client
  const supabaseAdmin = getFreshAdminClient();

  const reviewIds = reviews.map(r => r.id);

  const { data: scheduledReviews, error} = await supabaseAdmin
    .from('schedules')
    .select('review_id')
    .in('review_id', reviewIds)
    .not('review_id', 'is', null);

  if (error) {
    console.error('❌ Error fetching scheduled reviews:', error);
    return reviews; // Return all if error
  }

  const scheduledIds = new Set(scheduledReviews?.map(s => s.review_id) || []);
  return reviews.filter(review => !scheduledIds.has(review.id));
}
