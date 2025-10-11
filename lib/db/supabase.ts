import { createClient } from '@supabase/supabase-js';
import type { Review, UserSettings, Category, Schedule, WebhookLog, ActivityLog } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database queries
export const db = {
  // Reviews
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getReview(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getReviewBySlug(slug: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getReviews(options?: { userId?: string; status?: string | null; limit?: number; offset?: number }) {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.status) query = query.eq('status', options.status);
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1);

    const { data, error } = await query;

    if (error) throw error;
    return data as Review[];
  },

  async getReviewsCount(options?: { userId?: string; status?: string | null }) {
    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    if (options?.userId) query = query.eq('user_id', options.userId);
    if (options?.status) query = query.eq('status', options.status);

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },

  async updateReview(id: string, updates: Partial<Review>) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async deleteReview(id: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementViews(id: string) {
    const { error } = await supabase.rpc('increment_views', { review_id: id });
    if (error) throw error;
  },

  async incrementClicks(id: string) {
    const { error } = await supabase.rpc('increment_clicks', { review_id: id });
    if (error) throw error;
  },

  // User Settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserSettings | null;
  },

  async upsertUserSettings(settings: Omit<UserSettings, 'created_at'>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(settings)
      .select()
      .single();

    if (error) throw error;
    return data as UserSettings;
  },

  // Stats
  async getDashboardStats(userId: string) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('views, clicks, conversions')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = reviews.reduce(
      (acc, review) => ({
        totalViews: acc.totalViews + review.views,
        totalClicks: acc.totalClicks + review.clicks,
        totalConversions: acc.totalConversions + review.conversions,
      }),
      { totalViews: 0, totalClicks: 0, totalConversions: 0 }
    );

    return {
      totalReviews: reviews.length,
      ...stats,
    };
  },

  // Categories
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async getCategory(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Schedules
  async createSchedule(schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>) {
    // Get review data to populate additional fields
    const review = await this.getReview(schedule.review_id);
    
    // Create schedule with all data
    const scheduleData = {
      ...schedule,
      video_url: review.video_url,
      video_thumbnail: review.video_thumbnail,
      affiliate_links: review.affiliate_links,
      channel_name: review.channel_name,
      video_title: review.video_title,
      review_summary: review.summary,
      review_pros: review.pros,
      review_cons: review.cons,
      review_key_points: review.key_points,
      review_target_audience: review.target_audience,
      review_cta: review.cta,
      review_seo_keywords: review.seo_keywords,
    };

    // Use regular insert with timezone handling
    console.log('🕐 Creating schedule with timezone handling:');
    console.log('  Input scheduled_for:', scheduleData.scheduled_for);
    console.log('  Input timezone:', scheduleData.timezone);
    
    // Create a copy of scheduleData with scheduled_for as text to preserve timezone
    const scheduleDataWithText = {
      ...scheduleData,
      scheduled_for: scheduleData.scheduled_for // Keep as text to preserve timezone
    };
    
    const { data, error } = await supabase
      .from('schedules')
      .insert(scheduleDataWithText)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }
    
    console.log('✅ Schedule created successfully:');
    console.log('  Output scheduled_for:', data.scheduled_for);
    console.log('  Output timezone:', data.timezone);
    
    return data as Schedule;
  },

  async getSchedules(userId?: string, status?: string, limit?: number, offset?: number) {
    let query = supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug
        )
      `)
      .order('scheduled_for', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as (Schedule & { reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug'> })[];
  },

  async getSchedulesCount(userId?: string, status?: string) {
    let query = supabase
      .from('schedules')
      .select('*', { count: 'exact', head: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async getSchedule(id: string) {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug,
          video_url,
          channel_name,
          summary,
          pros,
          cons,
          target_audience,
          seo_keywords,
          affiliate_links
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Schedule & { 
      reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug' | 'video_url' | 'channel_name' | 'summary' | 'pros' | 'cons' | 'target_audience' | 'seo_keywords' | 'affiliate_links'> 
    };
  },

  async updateSchedule(id: string, updates: Partial<Schedule>) {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Schedule;
  },

  async deleteSchedule(id: string) {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getPendingSchedules() {
    // Sử dụng utility function để lấy thời gian hiện tại
    const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
    const nowGMT7 = getCurrentTimestamp();
    
    console.log('🕐 getPendingSchedules - Current time:', nowGMT7);
    
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug,
          video_url,
          channel_name,
          summary,
          pros,
          cons,
          key_points,
          target_audience,
          cta,
          seo_keywords,
          affiliate_links
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', nowGMT7)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data as (Schedule & { 
      reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug' | 'video_url' | 'channel_name' | 'summary' | 'pros' | 'cons' | 'key_points' | 'target_audience' | 'cta' | 'seo_keywords' | 'affiliate_links'> 
    })[];
  },

  async getFailedSchedulesForRetry() {
    // Sử dụng utility function để lấy thời gian hiện tại
    const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
    const nowGMT7 = getCurrentTimestamp();
    
    console.log('🕐 getFailedSchedulesForRetry - Current time:', nowGMT7);
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug,
          video_url,
          channel_name,
          summary,
          pros,
          cons,
          key_points,
          target_audience,
          cta,
          seo_keywords,
          affiliate_links
        )
      `)
      .eq('status', 'failed')
      .lt('retry_count', 3) // Use hardcoded max retries instead of RPC
      .lte('next_retry_at', nowGMT7)
      .order('next_retry_at', { ascending: true });

    if (error) throw error;
    return data as (Schedule & { 
      reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug' | 'video_url' | 'channel_name' | 'summary' | 'pros' | 'cons' | 'key_points' | 'target_audience' | 'cta' | 'seo_keywords' | 'affiliate_links'> 
    })[];
  },

  // Webhook Logs
  async createWebhookLog(log: Omit<WebhookLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data as WebhookLog;
  },

  async updateWebhookLog(scheduleId: string, updates: Partial<WebhookLog>) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .update(updates)
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false })
      .limit(1)
      .select()
      .single();

    if (error) throw error;
    return data as WebhookLog;
  },

  // Helper function to get review IDs that already have schedules
  async getScheduledReviewIds() {
    const { data, error } = await supabase
      .from('schedules')
      .select('review_id')
      .in('status', ['pending', 'processing', 'posted']);

    if (error) throw error;
    return data.map(item => item.review_id);
  },

  // Activity Logs
  async createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ActivityLog;
  },

  async getActivityLogs(limit: number = 50) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as ActivityLog[];
  },

  async updateActivityLog(id: string, updates: Partial<ActivityLog>) {
    const { data, error } = await supabase
      .from('activity_logs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ActivityLog;
  },

  async deleteActivityLog(id: string) {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
