// Video Platform
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
  url: string;              // Original product URL or manually entered URL
  trackingUrl?: string;     // Generated affiliate tracking URL (from API/deeplink)
  price?: string;
  discount?: string;
  affSid?: string;          // Tracking ID from generation
  generationMethod?: 'api' | 'deeplink';  // How the tracking URL was generated
  merchantId?: string;      // ID of merchant used for generation
  merchantName?: string;    // Name of merchant (for display)
  clicks?: number;          // Click counter (Phase 4-Lite)
  lastClickedAt?: string;   // Last click timestamp
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
  color?: string;
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

// ============================================
// PROMPT TEMPLATES SYSTEM
// ============================================

export type PromptCategory = 'tech' | 'beauty' | 'food' | 'travel' | 'general';
export type PromptPlatform = 'blog' | 'facebook' | 'instagram' | 'tiktok';
export type PromptContentType = 'review' | 'comparison' | 'tutorial' | 'unboxing' | 'listicle';
export type PromptTone = 'professional' | 'casual' | 'funny' | 'formal';
export type PromptLength = 'short' | 'medium' | 'long';
export type PromptLanguage = 'vi' | 'en';
export type EmojiUsage = 'none' | 'minimal' | 'moderate' | 'heavy';

export interface PromptStructure {
  intro: boolean;
  hook: boolean;
  summary: boolean;
  keyPoints: boolean;
  prosCons: boolean;
  comparison: boolean;
  priceAnalysis: boolean;
  verdict: boolean;
  callToAction: boolean;
}

// 10-Element Prompt Engineering Framework Types

export interface PromptObjective {
  primary_goal: string;
  secondary_goal?: string;
  success_metrics?: string;
}

export interface PromptConstraints {
  do_list: string[];
  dont_list: string[];
  compliance?: string[];
  seo_requirements?: string[];
}

export interface AIParameters {
  temperature: number; // 0.0 - 1.0
  max_tokens: number;
  top_p?: number; // 0.0 - 1.0
  frequency_penalty?: number; // -2.0 - 2.0
  presence_penalty?: number; // -2.0 - 2.0
}

export interface PromptContext {
  business_type?: string;
  target_audience?: string;
  brand_voice?: string;
  campaign_goal?: string;
}

export interface PromptConfig {
  // Element 1: Context
  context?: PromptContext;

  // Element 4: Requirements
  tone: PromptTone;
  length: PromptLength;
  language: PromptLanguage;
  structure: PromptStructure;
  emojiUsage: EmojiUsage;
  hashtagCount?: number;
  seoOptimized: boolean;
  includeTimestamps: boolean;

  // Element 7: Tone & Style (extended)
  formality?: 'formal' | 'informal' | 'neutral';
  perspective?: 'first_person' | 'second_person' | 'third_person';
  emotional_tone?: 'enthusiastic' | 'balanced' | 'critical' | 'inspirational';
  punctuation_style?: 'neutral' | 'exclamatory' | 'question-based';
}

export interface PromptTemplate {
  id: string;
  user_id?: string; // NULL = system template

  // Metadata
  name: string;
  description?: string;
  category: PromptCategory;
  platform: PromptPlatform;
  content_type: PromptContentType;
  version: '1.0' | '2.0'; // v2.0 = 10-element framework

  // Configuration (Elements 1, 4, 7)
  config: PromptConfig;

  // Template content (Element 4: Structure)
  prompt_template: string;
  variables: Record<string, string>;

  // Element 2: Role Instruction
  role_instruction?: string;

  // Element 3: Objective
  objective?: PromptObjective;

  // Element 5: Constraints
  constraints?: PromptConstraints;

  // Element 6: Examples
  example_input?: Record<string, string>;
  example_output?: string;

  // Element 8: Feedback Loop
  feedback_instructions?: string;

  // Element 9: AI Parameters
  ai_parameters?: AIParameters;

  // Element 10: Additional Notes
  additional_notes?: string;

  // Flags
  is_system: boolean;
  is_public: boolean;
  is_active: boolean;

  // Stats
  usage_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ReviewTemplateUsage {
  id: string;
  review_id: string;
  template_id: string;
  user_id: string;
  variables_used: Record<string, string>;
  created_at: string;
}

// API Types
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: PromptCategory;
  platform: PromptPlatform;
  content_type: PromptContentType;
  version?: '1.0' | '2.0'; // v2.0 = 10-element framework

  // Configuration (Elements 1, 4, 7)
  config: PromptConfig;

  // Template content (Element 4: Structure)
  prompt_template?: string;
  variables?: Record<string, string>;

  // Element 2: Role Instruction
  role_instruction?: string;

  // Element 3: Objective
  objective?: PromptObjective;

  // Element 5: Constraints
  constraints?: PromptConstraints;

  // Element 6: Examples
  example_input?: Record<string, string>;
  example_output?: string;

  // Element 8: Feedback Loop
  feedback_instructions?: string;

  // Element 9: AI Parameters
  ai_parameters?: AIParameters;

  // Element 10: Additional Notes
  additional_notes?: string;

  // Flags
  is_public?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  config?: PromptConfig;
  prompt_template?: string;
  variables?: Record<string, string>;
  example_output?: string;
  is_public?: boolean;
  is_active?: boolean;
}

export interface TemplateRecommendationRequest {
  video_title: string;
  video_description: string;
  platform: PromptPlatform;
}

export interface TemplateRecommendationResponse {
  recommended_template: PromptTemplate;
  confidence: number;
  alternatives: PromptTemplate[];
}

export interface TemplatePreviewRequest {
  template_id: string;
  variables: Record<string, string>;
}

export interface TemplatePreviewResponse {
  final_prompt: string;
  estimated_tokens: number;
}

export interface CreateReviewWithTemplateRequest {
  template_id: string;
  video_url?: string;
  video_info?: VideoInfo; // ✅ Video info từ client
  ai_analysis?: AIAnalysis; // ✅ AI analysis từ client
  variables: Record<string, string>;
  schedule_for?: string;
  category_id?: string;
  affiliate_links?: AffiliateLink[];
}
