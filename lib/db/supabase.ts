import { createClient } from '@supabase/supabase-js';
import type { Review, UserSettings, Category, Schedule, WebhookLog, ActivityLog, PromptTemplate, ReviewTemplateUsage } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured and create appropriate client
let supabase: any;
let supabaseAdmin: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.warn('⚠️ Supabase not configured, using mock mode');
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
      upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      range: () => Promise.resolve({ data: [], error: null }),
      lte: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
      lt: () => ({ lte: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      in: () => Promise.resolve({ data: [], error: null })
    }),
    rpc: () => Promise.resolve({ error: null })
  };
  
  supabaseAdmin = supabase;
} else {
  console.log('✅ Supabase configured, creating real client');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Server-side client with service role (fallback to anon key if service role not available)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && !serviceRoleKey.includes('your_supabase')) {
    console.log('✅ Creating admin client with service role');
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  } else {
    console.warn('⚠️ Service role key not configured, using anon key for admin client');
    supabaseAdmin = supabase; // Use same client as fallback
  }
}

export { supabase, supabaseAdmin };

// Database queries
export const db = {
  // Reviews
  async getReviews(options: { userId?: string; status?: string; limit?: number; offset?: number } = {}) {
    try {
      const { userId, status, limit = 10, offset = 0 } = options;
      
      console.log('🔍 db.getReviews called with:', { userId, status, limit, offset });
      
      let query = supabaseAdmin
        .from('reviews')
        .select(`
          id, 
          slug, 
          video_title, 
          video_url, 
          video_platform, 
          video_thumbnail, 
          channel_name,
          summary,
          pros,
          cons,
          target_audience,
          seo_keywords,
          affiliate_links,
          status, 
          created_at, 
          user_id
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
        console.log('🔍 Filtering by user_id:', userId);
      }

      if (status) {
        query = query.eq('status', status);
        console.log('🔍 Filtering by status:', status);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching reviews:', error);
        return [];
      }
      
      console.log('✅ Reviews fetched:', data?.length || 0, 'reviews');
      return data || [];
    } catch (error) {
      console.error('❌ Exception in getReviews:', error);
      return [];
    }
  },

  async getReviewsCount(options: { userId?: string; status?: string } = {}) {
    try {
      const { userId, status } = options;
      
      let query = supabaseAdmin
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching reviews count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      console.error('Exception in getReviewsCount:', error);
      return 0;
    }
  },

  async getReview(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching review:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getReview:', error);
      return null;
    }
  },

  async getReviewBySlug(slug: string) {
    try {
      console.log('🔍 getReviewBySlug: Fetching review with slug:', slug);

      const { data, error } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('❌ Error fetching review by slug:', error);
        return null;
      }

      console.log('✅ getReviewBySlug: Found review:', data?.id);
      return data;
    } catch (error) {
      console.error('❌ Exception in getReviewBySlug:', error);
      return null;
    }
  },

  async createReview(review: Partial<Review>) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) {
        console.error('Error creating review:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createReview:', error);
      throw error;
    }
  },

  async updateReview(id: string, updates: Partial<Review>) {
    try {
      const { data, error } = await supabaseAdmin  // ✅ Use supabaseAdmin to bypass RLS
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating review:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateReview:', error);
      throw error;
    }
  },

  async deleteReview(id: string) {
    try {
      console.log('🗑️ deleteReview: Deleting review with ID:', id);

      const { error } = await supabaseAdmin  // ✅ Use supabaseAdmin to bypass RLS
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting review:', error);
        throw error;
      }

      console.log('✅ deleteReview: Successfully deleted review', id);
      return true;
    } catch (error) {
      console.error('❌ Exception in deleteReview:', error);
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getCategories:', error);
      return [];
    }
  },

  async createCategory(category: Partial<Category>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createCategory:', error);
      throw error;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateCategory:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting category:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Exception in deleteCategory:', error);
      throw error;
    }
  },

  // Schedules
  async getSchedules(userId?: string, status?: string, limit = 10, offset = 0) {
    try {
      let query = supabaseAdmin
        .from('schedules')
        .select(`
          *,
          affiliate_links
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching schedules:', error);
        return [];
      }
      
      console.log(`📋 getSchedules: Found ${data?.length || 0} schedules for user ${userId}, status: ${status}`);
      return data || [];
    } catch (error) {
      console.error('Exception in getSchedules:', error);
      return [];
    }
  },

  async getSchedulesCount(userId?: string, status?: string) {
    try {
      let query = supabaseAdmin
        .from('schedules')
        .select('*', { count: 'exact', head: true });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching schedules count:', error);
        return 0;
      }
      
      console.log(`📊 getSchedulesCount: Found ${count || 0} schedules for user ${userId}, status: ${status}`);
      return count || 0;
    } catch (error) {
      console.error('Exception in getSchedulesCount:', error);
      return 0;
    }
  },

  async getPendingSchedules() {
    try {
      console.log('🔍 getPendingSchedules - Getting pending schedules that are due...');

      // Get current UTC time
      const nowUTC = new Date();
      const nowUTCString = nowUTC.toISOString();

      console.log('🔍 Current UTC time:', nowUTCString);
      console.log('🔍 Current server time:', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

      // TEMP FIX: Get ALL pending schedules first, then filter in JavaScript
      // This works regardless of database column type (TEXT, TIMESTAMP, or TIMESTAMPTZ)
      const { data, error } = await supabaseAdmin
        .from('schedules')
        .select('*')
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('❌ Error fetching pending schedules:', error);
        return [];
      }

      console.log(`📋 Total pending schedules: ${data?.length || 0}`);

      // Filter in JavaScript: scheduled_for <= current time
      const nowTime = Date.now();
      const dueSchedules = (data || []).filter((schedule: any) => {
        try {
          // Parse scheduled_for - handle multiple formats
          const scheduledTime = new Date(schedule.scheduled_for).getTime();
          const isDue = scheduledTime <= nowTime;

          console.log(`  ${isDue ? '✓' : '✗'} Schedule ${schedule.id.substring(0, 8)}:`, {
            scheduled_for: schedule.scheduled_for,
            scheduled_time: new Date(schedule.scheduled_for).toISOString(),
            current_time: new Date(nowTime).toISOString(),
            is_due: isDue,
            diff_minutes: Math.round((scheduledTime - nowTime) / 60000)
          });

          return isDue;
        } catch (parseError) {
          console.error(`❌ Error parsing schedule ${schedule.id}:`, parseError);
          return false;
        }
      });

      console.log(`📋 Found ${dueSchedules.length} pending schedules that are due`);

      return dueSchedules;
    } catch (error) {
      console.error('❌ Exception in getPendingSchedules:', error);
      return [];
    }
  },

  async getFailedSchedulesForRetry() {
    try {
      const { data, error } = await supabaseAdmin
        .from('schedules')
        .select('*')
        .eq('status', 'failed')
        .lte('next_retry_at', new Date().toISOString())
        .order('next_retry_at', { ascending: true });

      if (error) {
        console.error('Error fetching failed schedules for retry:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception in getFailedSchedulesForRetry:', error);
      return [];
    }
  },

  async createSchedule(schedule: Partial<Schedule>) {
    try {
      const { data, error} = await supabaseAdmin  // Use supabaseAdmin to bypass RLS
        .from('schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createSchedule:', error);
      throw error;
    }
  },

  async updateSchedule(id: string, updates: Partial<Schedule>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateSchedule:', error);
      throw error;
    }
  },

  async getSchedule(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching schedule:', error);
        throw error;
      }

      console.log(`📋 getSchedule: Found schedule ${id}`);
      return data;
    } catch (error) {
      console.error('Exception in getSchedule:', error);
      throw error;
    }
  },

  async deleteSchedule(id: string) {
    try {
      const { error } = await supabaseAdmin
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting schedule:', error);
        throw error;
      }

      console.log(`🗑️ deleteSchedule: Deleted schedule ${id}`);
      return true;
    } catch (error) {
      console.error('Exception in deleteSchedule:', error);
      throw error;
    }
  },

  // Webhook Logs
  async createWebhookLog(log: Partial<WebhookLog>) {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .insert(log)
        .select()
        .single();

      if (error) {
        console.error('Error creating webhook log:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createWebhookLog:', error);
      throw error;
    }
  },

  async updateWebhookLog(id: string, updates: Partial<WebhookLog>) {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating webhook log:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateWebhookLog:', error);
      throw error;
    }
  },

  // User Profiles
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getUserProfile:', error);
      return null;
    }
  },

  async createUserProfile(profile: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createUserProfile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateUserProfile:', error);
      throw error;
    }
  },

  // Activity Logs
  async createActivityLog(log: Partial<ActivityLog>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .insert(log)
        .select()
        .single();

      if (error) {
        console.error('Error creating activity log:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createActivityLog:', error);
      throw error;
    }
  },

  async getActivityLogs(userId?: string, limit = 50, hoursAgo = 48) {
    try {
      // Calculate timestamp for X hours ago
      const timestampCutoff = new Date();
      timestampCutoff.setHours(timestampCutoff.getHours() - hoursAgo);
      const cutoffISO = timestampCutoff.toISOString();

      console.log(`🔍 getActivityLogs: Fetching logs from last ${hoursAgo}h (since ${cutoffISO})`);

      let query = supabaseAdmin
        .from('activity_logs')
        .select('*')
        .gte('created_at', cutoffISO) // Only logs from last X hours
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} activity logs in last ${hoursAgo}h`);
      return data || [];
    } catch (error) {
      console.error('Exception in getActivityLogs:', error);
      return [];
    }
  },

  // User Settings
  async getUserSettings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getUserSettings:', error);
      return null;
    }
  },

  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, ...settings })
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateUserSettings:', error);
      throw error;
    }
  },

  // ============================================
  // PROMPT TEMPLATES
  // ============================================

  async getTemplates(options: {
    userId?: string;
    category?: string;
    platform?: string;
    contentType?: string;
    isSystem?: boolean;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      const {
        userId,
        category,
        platform,
        contentType,
        isSystem,
        isActive = true,
        limit = 50,
        offset = 0,
      } = options;

      let query = supabaseAdmin
        .from('prompt_templates')
        .select('*')
        .eq('is_active', isActive)
        .order('usage_count', { ascending: false })
        .range(offset, offset + limit - 1);

      if (userId !== undefined) {
        query = query.eq('user_id', userId);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (platform) {
        query = query.eq('platform', platform);
      }

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      if (isSystem !== undefined) {
        query = query.eq('is_system', isSystem);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching templates:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} templates`);
      return data || [];
    } catch (error) {
      console.error('Exception in getTemplates:', error);
      return [];
    }
  },

  async getTemplate(id: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('prompt_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getTemplate:', error);
      return null;
    }
  },

  async createTemplate(template: Partial<PromptTemplate>) {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        console.error('Error creating template:', error);
        throw error;
      }

      console.log('✅ Template created:', data.id);
      return data;
    } catch (error) {
      console.error('Exception in createTemplate:', error);
      throw error;
    }
  },

  async updateTemplate(id: string, updates: Partial<PromptTemplate>) {
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        throw error;
      }

      console.log('✅ Template updated:', id);
      return data;
    } catch (error) {
      console.error('Exception in updateTemplate:', error);
      throw error;
    }
  },

  async deleteTemplate(id: string) {
    try {
      // Soft delete by setting is_active = false
      const { data, error } = await supabase
        .from('prompt_templates')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      console.log('✅ Template deleted (soft):', id);
      return true;
    } catch (error) {
      console.error('Exception in deleteTemplate:', error);
      throw error;
    }
  },

  async incrementTemplateUsage(templateId: string) {
    try {
      const { error } = await supabaseAdmin
        .from('prompt_templates')
        .update({ usage_count: supabaseAdmin.raw('usage_count + 1') })
        .eq('id', templateId);

      if (error) {
        console.error('Error incrementing template usage:', error);
      }
    } catch (error) {
      console.error('Exception in incrementTemplateUsage:', error);
    }
  },

  async createTemplateUsage(usage: Partial<ReviewTemplateUsage>) {
    try {
      const { data, error } = await supabase
        .from('review_template_usage')
        .insert(usage)
        .select()
        .single();

      if (error) {
        console.error('Error creating template usage:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Exception in createTemplateUsage:', error);
      throw error;
    }
  },

  async getTemplateUsage(reviewId: string) {
    try {
      const { data, error } = await supabase
        .from('review_template_usage')
        .select(`
          *,
          template:prompt_templates(*)
        `)
        .eq('review_id', reviewId)
        .single();

      if (error) {
        console.error('Error fetching template usage:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getTemplateUsage:', error);
      return null;
    }
  }
};