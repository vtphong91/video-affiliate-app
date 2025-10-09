import { createClient } from '@supabase/supabase-js';
import type { Review, UserSettings, Category } from '@/types';

// Schedule types
export interface Schedule {
  id: string;
  user_id: string; // Now TEXT type
  review_id: string;
  scheduled_for: string;
  timezone: string;
  target_type: 'page' | 'group'; // Back to target_type (correct)
  target_id: string;
  target_name?: string;
  post_message: string;
  landing_page_url: string;
  status: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled';
  posted_at?: string;
  facebook_post_id?: string;
  facebook_post_url?: string;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  schedule_id: string;
  request_payload?: any;
  request_sent_at: string;
  response_payload?: any;
  response_status?: number;
  response_received_at?: string;
  error_message?: string;
  retry_attempt: number;
  created_at: string;
}

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
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data as Schedule;
  },

  async getSchedules(userId?: string, status?: string) {
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

    const { data, error } = await query;
    if (error) throw error;
    return data as (Schedule & { reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug'> })[];
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
    const now = new Date().toISOString();
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
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data as (Schedule & { 
      reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug' | 'video_url' | 'channel_name' | 'summary' | 'pros' | 'cons' | 'target_audience' | 'seo_keywords' | 'affiliate_links'> 
    })[];
  },

  async getFailedSchedulesForRetry() {
    const now = new Date().toISOString();
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
      .eq('status', 'failed')
      .lt('retry_count', supabase.rpc('get_max_retries'))
      .lte('next_retry_at', now)
      .order('next_retry_at', { ascending: true });

    if (error) throw error;
    return data as (Schedule & { 
      reviews: Pick<Review, 'id' | 'video_title' | 'video_thumbnail' | 'slug' | 'video_url' | 'channel_name' | 'summary' | 'pros' | 'cons' | 'target_audience' | 'seo_keywords' | 'affiliate_links'> 
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

  async getWebhookLogs(scheduleId: string) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as WebhookLog[];
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
};
