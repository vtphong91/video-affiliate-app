/**
 * Deeplink Generator
 * Manual deeplink generation for iSclix/AccessTrade
 * Format: https://go.isclix.com/deep_link/{publisher_id}/{campaign_id}?url=...
 */

import type { GenerateLinkParams, GenerateLinkResult } from '../types';

export class DeeplinkGenerator {
  /**
   * Generate deeplink URL manually
   */
  async generateLink(params: GenerateLinkParams, settings: {
    publisherId: string;
    deeplinkBaseUrl: string;
    utmSource: string;
    utmCampaign: string;
  }): Promise<GenerateLinkResult> {
    const { merchant, originalUrl, userId } = params;
    const { publisherId, deeplinkBaseUrl, utmSource, utmCampaign } = settings;

    // Validate inputs
    if (!publisherId) {
      throw new Error('Publisher ID is required for deeplink generation');
    }

    if (!merchant.campaign_id) {
      throw new Error(`Campaign ID is missing for merchant: ${merchant.name}`);
    }

    // Use merchant's custom deeplink base if available
    const baseUrl = merchant.deep_link_base || deeplinkBaseUrl;

    // Generate unique tracking ID (aff_sid) for this link
    // Format: {userId}_{merchantId}_{timestamp}
    const timestamp = Date.now();
    const affSid = `${userId.slice(0, 8)}_${merchant.id.slice(0, 8)}_${timestamp}`;

    // Build target URL with UTM parameters
    // UTM Structure: campaign=merchant, content=review type
    const targetUrl = this.buildTargetUrl(originalUrl, {
      utmSource,
      utmCampaign: merchant.name.toLowerCase().replace(/\s+/g, '-'), // Merchant name
      utmMedium: 'affiliate',
      utmContent: utmCampaign, // Content type (e.g., "review")
      sub1: userId,
      sub2: merchant.id,
      sub3: merchant.campaign_id,
      sub4: timestamp.toString()
    });

    // Encode target URL
    const encodedUrl = encodeURIComponent(targetUrl);

    // Build deeplink URL
    // Format: https://go.isclix.com/deep_link/{publisher_id}/{campaign_id}?url={encoded_url}
    const affiliateUrl = `${baseUrl}/${publisherId}/${merchant.campaign_id}?url=${encodedUrl}`;

    console.log('🔗 Generated deeplink:', {
      merchant: merchant.name,
      campaign_id: merchant.campaign_id,
      aff_sid: affSid,
      url_length: affiliateUrl.length
    });

    return {
      affiliateUrl,
      affSid,
      generationMethod: 'deeplink'
    };
  }

  /**
   * Build target URL with tracking parameters
   */
  private buildTargetUrl(originalUrl: string, params: {
    utmSource: string;
    utmCampaign: string;
    utmMedium: string;
    utmContent: string;
    sub1: string;
    sub2: string;
    sub3: string;
    sub4: string;
  }): string {
    try {
      const url = new URL(originalUrl);

      // Add UTM parameters
      url.searchParams.set('utm_source', params.utmSource);
      url.searchParams.set('utm_campaign', params.utmCampaign);
      url.searchParams.set('utm_medium', params.utmMedium);
      url.searchParams.set('utm_content', params.utmContent);

      // Add sub parameters for backup tracking
      url.searchParams.set('aff_sub1', params.sub1);
      url.searchParams.set('aff_sub2', params.sub2);
      url.searchParams.set('aff_sub3', params.sub3);
      url.searchParams.set('aff_sub4', params.sub4);

      return url.toString();
    } catch (error) {
      // If URL parsing fails, append parameters manually
      const separator = originalUrl.includes('?') ? '&' : '?';
      const queryParams = new URLSearchParams({
        utm_source: params.utmSource,
        utm_campaign: params.utmCampaign,
        utm_medium: params.utmMedium,
        utm_content: params.utmContent,
        aff_sub1: params.sub1,
        aff_sub2: params.sub2,
        aff_sub3: params.sub3,
        aff_sub4: params.sub4,
      });

      return `${originalUrl}${separator}${queryParams.toString()}`;
    }
  }

  /**
   * Validate deeplink configuration
   */
  async validateConfig(settings: {
    publisherId?: string;
    deeplinkBaseUrl?: string;
  }): Promise<{ valid: boolean; error?: string }> {
    if (!settings.publisherId) {
      return {
        valid: false,
        error: 'Publisher ID is required for deeplink generation'
      };
    }

    if (!settings.deeplinkBaseUrl) {
      return {
        valid: false,
        error: 'Deeplink base URL is required'
      };
    }

    // Validate URL format
    try {
      new URL(settings.deeplinkBaseUrl);
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid deeplink base URL format'
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const deeplinkGenerator = new DeeplinkGenerator();
