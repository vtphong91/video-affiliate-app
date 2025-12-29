/**
 * Affiliate Link Types
 */

export type LinkMode = 'api' | 'deeplink';
export type AffiliatePlatform = 'accesstrade' | 'isclix';
export type LinkType = 'homepage' | 'product';
export type GenerationMethod = 'api' | 'deeplink' | 'tiktok-api';

/**
 * Affiliate Settings (Global Configuration)
 */
export interface AffiliateSettings {
  id: string;
  api_token?: string;
  api_url: string;
  link_mode: LinkMode;
  publisher_id?: string;
  deeplink_base_url: string;
  utm_source: string;
  utm_campaign: string;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: 'success' | 'failed' | 'pending';
  test_message?: string;
  created_at: string;
  updated_at: string;
  // Security flags (API response only)
  has_api_token?: boolean;
  has_publisher_id?: boolean;
}

/**
 * Merchant
 */
export interface Merchant {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  platform: AffiliatePlatform;
  campaign_id: string;
  deep_link_base?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Affiliate Link
 */
export interface AffiliateLink {
  id: string;
  user_id: string;
  review_id?: string;
  merchant_id: string;
  original_url: string;
  affiliate_url: string;
  short_url?: string;
  link_type: LinkType;
  generation_method: GenerationMethod;
  aff_sid: string; // Tracking ID for analytics
  label?: string;
  display_order: number;
  created_at: string;
  updated_at: string;

  // Relations (when joined)
  merchant?: Merchant;
}

/**
 * Request/Response Types
 */
export interface UpdateSettingsRequest {
  api_token?: string;
  api_url?: string;
  link_mode?: LinkMode;
  publisher_id?: string;
  utm_source?: string;
  utm_campaign?: string;
}

export interface TestApiRequest {
  api_token: string;
  api_url: string;
}

export interface TestApiResponse {
  success: boolean;
  message: string;
  details?: any;
}

export interface CreateAffiliateLinkRequest {
  userId: string;
  reviewId?: string;
  merchantId: string;
  originalUrl: string;
  linkType: LinkType;
  label?: string;
  forceMethod?: GenerationMethod; // Override auto-selection
}

export interface GenerateLinkParams {
  userId: string;
  merchant: Merchant;
  originalUrl: string;
  linkType: LinkType;
}

export interface GenerateLinkResult {
  affiliateUrl: string;
  shortUrl?: string;
  affSid: string;
  generationMethod: GenerationMethod;
}

/**
 * AccessTrade API Types
 */
export interface AccessTradeCreateLinkRequest {
  campaign_id: string;
  urls: string[];
  url_enc?: boolean;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
}

export interface AccessTradeCreateLinkResponse {
  success: boolean;
  data?: {
    error_link: string[];
    success_link: Array<{
      aff_link: string;
      first_link?: string;
      short_link: string;
      url_origin: string;
    }>;
    suspend_url: string[];
  };
  message?: string;
}
