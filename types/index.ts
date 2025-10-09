// Video Platform Types
export type VideoPlatform = 'youtube' | 'tiktok';

// Video Info
export interface VideoInfo {
  platform: VideoPlatform;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  description?: string;
  transcript?: string;
  channelName?: string;
  channelUrl?: string;
  viewCount?: number;
  publishedAt?: string;
}

// AI Analysis Types
export interface KeyPoint {
  time: string;
  content: string;
}

export interface ComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface AIAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  keyPoints: KeyPoint[];
  comparisonTable: ComparisonTable;
  targetAudience: string[];
  cta: string;
  seoKeywords: string[];
}

// Affiliate Link
export interface AffiliateLink {
  platform: string;
  url: string;
  price?: string;
  discount?: string;
}

// Review Status
export type ReviewStatus = 'draft' | 'published';

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

// Review (Database Model)
export interface Review {
  id: string;
  user_id: string;
  category_id?: string;
  slug: string;
  video_url: string;
  video_platform: VideoPlatform;
  video_id: string;
  video_title: string;
  video_thumbnail: string;
  video_description?: string;
  channel_name?: string;
  channel_url?: string;

  // AI generated content
  summary: string;
  pros: string[];
  cons: string[];
  key_points: KeyPoint[];
  comparison_table: ComparisonTable;
  target_audience: string[];
  cta: string;
  seo_keywords: string[];

  // Custom edits
  custom_title?: string;
  custom_content?: string;

  // Affiliate
  affiliate_links: AffiliateLink[];

  // Facebook
  fb_post_id?: string;
  fb_post_url?: string;
  posted_at?: string;

  // Analytics
  views: number;
  clicks: number;
  conversions: number;

  // Meta
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

// User Settings
export interface UserSettings {
  user_id: string;
  youtube_api_key?: string;
  facebook_page_id?: string;
  facebook_access_token?: string;
  default_affiliate_platform?: string;
  created_at: string;
}

// API Request/Response Types
export interface AnalyzeVideoRequest {
  videoUrl: string;
}

export interface AnalyzeVideoResponse {
  videoInfo: VideoInfo;
  analysis: AIAnalysis;
}

export interface CreateReviewRequest {
  videoUrl: string;
  videoInfo: VideoInfo;
  analysis: AIAnalysis;
  affiliateLinks?: AffiliateLink[];
  customTitle?: string;
  customContent?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  review: Review;
}

export interface PostFacebookRequest {
  reviewId: string;
  pageId: string;
  message: string;
  link: string;
}

export interface PostFacebookResponse {
  success: boolean;
  postId: string;
  postUrl: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalReviews: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  recentReviews: Review[];
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
}
