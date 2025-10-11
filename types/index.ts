// Export API types
export * from './api';

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

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  created_at: string;
  updated_at: string;
}

// Schedule
export interface Schedule {
  id: string;
  user_id: string;
  review_id: string;
  scheduled_for: string;
  timezone: string;
  target_type: 'page' | 'group';
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
  
  // Additional fields for webhook payload (optional, can be populated from reviews table)
  video_url?: string;
  video_thumbnail?: string;
  affiliate_links?: AffiliateLink[];
  channel_name?: string;
  video_title?: string;
  review_summary?: string;
  review_pros?: string[];
  review_cons?: string[];
  review_key_points?: KeyPoint[];
  review_target_audience?: string[];
  review_cta?: string;
  review_seo_keywords?: string[];
}

// Webhook Log
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

// Activity Log
export interface ActivityLog {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  status: 'success' | 'error' | 'warning' | 'info';
  metadata?: any;
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

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<{ success: boolean }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  updateProfile?: (data: any) => Promise<{ error?: any }>;
}
