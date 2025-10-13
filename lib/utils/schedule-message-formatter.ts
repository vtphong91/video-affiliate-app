/**
 * Schedule Message Formatter
 * 
 * ⚠️ QUAN TRỌNG: Đây là function chuẩn cho việc tạo post_message trong schedules.
 * KHÔNG ĐƯỢC THAY ĐỔI mà không hỏi trước!
 * 
 * Function này đảm bảo tính nhất quán với Facebook Post module và Cron Service.
 */

export interface ScheduleMessageParams {
  video_title: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  target_audience?: string[];
  seo_keywords?: string[];
  video_url: string;
  channel_name?: string;
  landing_url: string;
}

/**
 * Tạo post_message chuẩn cho schedules
 * Dựa trên formatFacebookPost nhưng phù hợp với cấu trúc reviews table
 */
export function createSchedulePostMessage(params: ScheduleMessageParams): string {
  const {
    video_title,
    summary = 'Đánh giá chi tiết về sản phẩm',
    pros = [],
    cons = [],
    target_audience = [],
    seo_keywords = [],
    video_url,
    channel_name,
    landing_url
  } = params;

  let message = `🔥 ${video_title}\n\n`;

  // Summary
  message += `📝 ${summary}\n\n`;

  // Pros
  if (pros.length > 0) {
    message += '✅ ƯU ĐIỂM:\n';
    pros.slice(0, 5).forEach((pro) => {
      message += `• ${pro}\n`;
    });
    message += '\n';
  }

  // Cons
  if (cons.length > 0) {
    message += '⚠️ NHƯỢC ĐIỂM CẦN LƯU Ý:\n';
    cons.slice(0, 3).forEach((con) => {
      message += `• ${con}\n`;
    });
    message += '\n';
  }

  // Target Audience
  if (target_audience.length > 0) {
    message += '👥 PHÙ HỢP VỚI:\n';
    target_audience.forEach((audience) => {
      message += `• ${audience}\n`;
    });
    message += '\n';
  }

  // Video link
  message += `🎥 Xem video gốc:\n${video_url}\n\n`;

  // Copyright notice
  const channelCredit = channel_name || 'kênh gốc';
  message += `⚖️ Bản quyền video thuộc về ${channelCredit}\n`;
  message += `Mọi quyền thuộc về kênh gốc. Đây chỉ là nội dung tham khảo.\n\n`;

  // Hashtags
  if (seo_keywords.length > 0) {
    const hashtags = seo_keywords
      .slice(0, 10)
      .map((k) => `#${k.replace(/\s+/g, '').replace(/[^\w\u00C0-\u1EF9]/g, '')}`);
    message += hashtags.join(' ');
  }

  return message;
}

/**
 * Tạo webhook payload chuẩn cho Make.com
 * ⚠️ QUAN TRỌNG: Function này phải tương thích với Cron Service!
 */
export function createWebhookPayload(schedule: any) {
  return {
    scheduleId: schedule.id,
    reviewId: schedule.review_id,
    targetType: schedule.target_type,
    targetId: schedule.target_id,
    targetName: schedule.target_name,
    message: schedule.post_message,
    link: schedule.landing_page_url,
    imageUrl: schedule.video_thumbnail,
    videoUrl: schedule.video_url,
    videoTitle: schedule.video_title,
    channelName: schedule.channel_name,
    affiliateLinks: schedule.affiliate_links || 'Đặt sản phẩm với giá tốt tại: Không có thông tin',
    reviewSummary: schedule.review_summary,
    reviewPros: schedule.review_pros,
    reviewCons: schedule.review_cons,
    reviewKeyPoints: schedule.review_key_points,
    reviewTargetAudience: schedule.review_target_audience,
    reviewCta: schedule.review_cta,
    reviewSeoKeywords: schedule.review_seo_keywords,
    scheduledFor: schedule.scheduled_for,
    triggeredAt: new Date().toISOString(),
    retryAttempt: schedule.retry_count || 0,
  };
}
