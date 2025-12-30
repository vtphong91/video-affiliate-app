/**
 * AccessTrade API Generator
 * Official AccessTrade API v1 for link generation
 * Better cookie tracking and conversion attribution
 */

import type {
  GenerateLinkParams,
  GenerateLinkResult,
  AccessTradeCreateLinkRequest,
  AccessTradeCreateLinkResponse
} from '../types';

export class AccessTradeGenerator {
  /**
   * Generate affiliate link using AccessTrade API
   */
  async generateLink(params: GenerateLinkParams, settings: {
    apiToken: string;
    apiUrl: string;
    utmSource: string;
    utmCampaign: string;
  }): Promise<GenerateLinkResult> {
    const { merchant, originalUrl, userId } = params;
    const { apiToken, apiUrl, utmSource, utmCampaign } = settings;

    // Validate inputs
    if (!apiToken) {
      throw new Error('API token is required for AccessTrade API');
    }

    if (!merchant.campaign_id) {
      throw new Error(`Campaign ID is missing for merchant: ${merchant.name}`);
    }

    // Generate unique tracking ID (aff_sid)
    const timestamp = Date.now();
    const affSid = `${userId.slice(0, 8)}_${merchant.id.slice(0, 8)}_${timestamp}`;

    // Build API request
    // UTM Structure for tracking:
    // - utm_source: video-affiliate (fixed)
    // - utm_medium: affiliate (fixed)
    // - utm_campaign: merchant name (dynamic) ← For tracking which merchant
    // - utm_content: content type from settings (e.g., "review")
    const requestBody: AccessTradeCreateLinkRequest = {
      campaign_id: merchant.campaign_id,
      urls: [originalUrl],
      url_enc: false, // Don't double-encode
      utm_source: utmSource,
      utm_medium: 'affiliate',
      utm_campaign: merchant.name.toLowerCase().replace(/\s+/g, '-'), // Merchant name for campaign tracking
      utm_content: utmCampaign, // Content type (e.g., "review")
      sub1: userId,
      sub2: merchant.id,
      sub3: merchant.campaign_id,
      sub4: timestamp.toString()
    };

    console.log('📡 Calling AccessTrade API:', {
      merchant: merchant.name,
      campaign_id: merchant.campaign_id,
      url: originalUrl,
      api_url: apiUrl
    });

    // Call AccessTrade API
    const response = await fetch(`${apiUrl}/product_link/create`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data: AccessTradeCreateLinkResponse = await response.json();

    // Handle API errors
    if (!response.ok) {
      console.error('❌ AccessTrade API error:', {
        status: response.status,
        data
      });

      if (response.status === 401) {
        throw new Error('Invalid API token - Please update AccessTrade settings');
      }

      if (response.status === 403) {
        throw new Error('Access denied - Check API permissions');
      }

      if (response.status === 400) {
        throw new Error(data.message || 'Invalid request - Check campaign ID and URL');
      }

      throw new Error(`AccessTrade API error: ${data.message || 'Unknown error'}`);
    }

    // Check response success
    if (!data.success || !data.data?.success_link || data.data.success_link.length === 0) {
      console.error('❌ No successful links in response:', data);

      // Check for error links
      if (data.data?.error_link && data.data.error_link.length > 0) {
        throw new Error(`Failed to generate link: ${data.data.error_link.join(', ')}`);
      }

      // Check for suspended URLs
      if (data.data?.suspend_url && data.data.suspend_url.length > 0) {
        throw new Error(`URL suspended by AccessTrade: ${data.data.suspend_url.join(', ')}`);
      }

      throw new Error('Failed to generate affiliate link via API');
    }

    // Extract successful link
    const successLink = data.data.success_link[0];
    const affiliateUrl = successLink.aff_link;
    const shortUrl = successLink.short_link;

    console.log('✅ AccessTrade API success:', {
      merchant: merchant.name,
      aff_sid: affSid,
      affiliate_url: affiliateUrl,
      short_url: shortUrl,
      url_length: affiliateUrl.length
    });

    return {
      affiliateUrl,
      shortUrl,
      affSid,
      generationMethod: 'api'
    };
  }

  /**
   * Test API connection with dummy request
   */
  async testConnection(apiToken: string, apiUrl: string): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const response = await fetch(`${apiUrl}/product_link/create`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaign_id: 'test',
          urls: ['https://shopee.vn']
        })
      });

      const data: AccessTradeCreateLinkResponse = await response.json();

      // Check response status
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid API token - Authentication failed',
          details: data
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: 'Access denied - Check API permissions',
          details: data
        };
      }

      // If we get 400 with error about campaign_id, token is valid
      if (response.status === 400 && data.message) {
        return {
          success: true,
          message: 'API connection successful! Token is valid.',
          details: {
            note: 'Test request failed as expected (invalid campaign_id), but authentication works.'
          }
        };
      }

      // If we get successful response
      if (data.success) {
        return {
          success: true,
          message: 'API connection successful!',
          details: data
        };
      }

      // Unknown error
      return {
        success: false,
        message: `API test failed: ${data.message || 'Unknown error'}`,
        details: data
      };

    } catch (error) {
      console.error('Test API error:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error - Cannot connect to API'
      };
    }
  }

  /**
   * Validate AccessTrade API configuration
   */
  async validateConfig(settings: {
    apiToken?: string;
    apiUrl?: string;
  }): Promise<{ valid: boolean; error?: string }> {
    if (!settings.apiToken) {
      return {
        valid: false,
        error: 'API token is required for AccessTrade API'
      };
    }

    if (!settings.apiUrl) {
      return {
        valid: false,
        error: 'API URL is required'
      };
    }

    // Validate URL format
    try {
      new URL(settings.apiUrl);
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid API URL format'
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const accessTradeGenerator = new AccessTradeGenerator();
