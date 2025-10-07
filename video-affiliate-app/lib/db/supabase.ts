import { createClient } from '@supabase/supabase-js';
import type { Review, UserSettings, Category } from '@/types';

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
};
