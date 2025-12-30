// @ts-nocheck
import { db } from '@/lib/db/supabase';

/**
 * Activity Logger Utility
 * Provides easy-to-use functions for logging user activities
 */

export type ActivityType =
  | 'review_created'
  | 'review_updated'
  | 'review_deleted'
  | 'schedule_created'
  | 'schedule_updated'
  | 'schedule_deleted'
  | 'post_scheduled'
  | 'post_published'
  | 'post_failed'
  | 'webhook_sent'
  | 'webhook_failed'
  | 'user_login'
  | 'user_logout'
  | 'category_created';

export type ActivityStatus = 'success' | 'error' | 'warning' | 'info';

interface LogActivityParams {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  status: ActivityStatus;
  metadata?: any;
}

/**
 * Log an activity to the database
 */
export async function logActivity({
  userId,
  type,
  title,
  description,
  status,
  metadata,
}: LogActivityParams) {
  try {
    console.log(`📝 Logging activity: ${type} - ${title}`);

    await db.createActivityLog({
      user_id: userId,
      type,
      title,
      description,
      status,
      metadata: metadata || {},
    });

    console.log(`✅ Activity logged: ${type}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

/**
 * Convenience functions for common activity types
 */

export const ActivityLogger = {
  // Review activities
  reviewCreated: async (userId: string, reviewTitle: string, reviewId: string) => {
    await logActivity({
      userId,
      type: 'review_created',
      title: 'Tạo review mới',
      description: `Đã tạo review: ${reviewTitle}`,
      status: 'success',
      metadata: { reviewId, reviewTitle },
    });
  },

  reviewUpdated: async (userId: string, reviewTitle: string, reviewId: string) => {
    await logActivity({
      userId,
      type: 'review_updated',
      title: 'Cập nhật review',
      description: `Đã cập nhật review: ${reviewTitle}`,
      status: 'success',
      metadata: { reviewId, reviewTitle },
    });
  },

  reviewDeleted: async (userId: string, reviewTitle: string, reviewId: string) => {
    await logActivity({
      userId,
      type: 'review_deleted',
      title: 'Xóa review',
      description: `Đã xóa review: ${reviewTitle}`,
      status: 'warning',
      metadata: { reviewId, reviewTitle },
    });
  },

  // Schedule activities
  scheduleCreated: async (userId: string, scheduleId: string, scheduledFor: string) => {
    await logActivity({
      userId,
      type: 'schedule_created',
      title: 'Tạo lịch đăng mới',
      description: `Đã tạo lịch đăng cho ${new Date(scheduledFor).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
      status: 'success',
      metadata: { scheduleId, scheduledFor },
    });
  },

  scheduleUpdated: async (userId: string, scheduleId: string, scheduledFor: string) => {
    await logActivity({
      userId,
      type: 'schedule_updated',
      title: 'Cập nhật lịch đăng',
      description: `Đã cập nhật lịch đăng cho ${new Date(scheduledFor).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
      status: 'success',
      metadata: { scheduleId, scheduledFor },
    });
  },

  scheduleDeleted: async (userId: string, scheduleId: string) => {
    await logActivity({
      userId,
      type: 'schedule_deleted',
      title: 'Xóa lịch đăng',
      description: `Đã xóa lịch đăng`,
      status: 'warning',
      metadata: { scheduleId },
    });
  },

  // Post publishing activities
  postPublished: async (userId: string, scheduleId: string, facebookPostUrl?: string) => {
    await logActivity({
      userId,
      type: 'post_published',
      title: 'Đăng bài thành công',
      description: 'Đã đăng bài lên Facebook thành công',
      status: 'success',
      metadata: { scheduleId, facebookPostUrl },
    });
  },

  postFailed: async (userId: string, scheduleId: string, errorMessage: string) => {
    await logActivity({
      userId,
      type: 'post_failed',
      title: 'Đăng bài thất bại',
      description: `Lỗi: ${errorMessage}`,
      status: 'error',
      metadata: { scheduleId, errorMessage },
    });
  },

  // Webhook activities
  webhookSent: async (userId: string, scheduleId: string, webhookUrl: string) => {
    await logActivity({
      userId,
      type: 'webhook_sent',
      title: 'Gửi webhook',
      description: 'Đã gửi webhook tới Make.com',
      status: 'info',
      metadata: { scheduleId, webhookUrl },
    });
  },

  webhookFailed: async (userId: string, scheduleId: string, errorMessage: string) => {
    await logActivity({
      userId,
      type: 'webhook_failed',
      title: 'Webhook thất bại',
      description: `Lỗi: ${errorMessage}`,
      status: 'error',
      metadata: { scheduleId, errorMessage },
    });
  },

  // Category activities
  categoryCreated: async (userId: string, categoryName: string, categoryId: string) => {
    await logActivity({
      userId,
      type: 'category_created',
      title: 'Tạo danh mục mới',
      description: `Đã tạo danh mục: ${categoryName}`,
      status: 'success',
      metadata: { categoryId, categoryName },
    });
  },
};
