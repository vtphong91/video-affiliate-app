/**
 * Affiliate Link Service
 * Orchestrates link generation using different generators and manages database storage
 */

import { supabaseAdmin } from '@/lib/db/supabase';
import { affiliateSettingsService } from './settings-service';
import { merchantService } from './merchant-service';
import { deeplinkGenerator } from '../generators/deeplink-generator';
import { accessTradeGenerator } from '../generators/accesstrade-generator';
import type {
  AffiliateLink,
  CreateAffiliateLinkRequest,
  GenerateLinkParams,
  GenerateLinkResult,
  GenerationMethod
} from '../types';

export class AffiliateLinkService {
  /**
   * Create affiliate link with auto-fallback logic
   */
  async createAffiliateLink(request: CreateAffiliateLinkRequest): Promise<AffiliateLink> {
    const { userId, reviewId, merchantId, originalUrl, linkType, label, forceMethod } = request;

    // Get merchant
    const merchant = await merchantService.getMerchantById(merchantId);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    if (!merchant.is_active) {
      throw new Error(`Merchant "${merchant.name}" is not active`);
    }

    // Get affiliate settings
    const settings = await affiliateSettingsService.getSettings();
    if (!settings || !settings.is_active) {
      throw new Error('Affiliate settings not configured. Please configure in admin settings.');
    }

    // Prepare generation params
    const params: GenerateLinkParams = {
      userId,
      merchant,
      originalUrl,
      linkType
    };

    // Determine generation method
    let generationMethod: GenerationMethod;
    if (forceMethod) {
      generationMethod = forceMethod;
    } else {
      // Auto-select based on settings and availability
      generationMethod = await this.selectGenerationMethod(settings);
    }

    console.log('🔗 Creating affiliate link:', {
      merchant: merchant.name,
      method: generationMethod,
      forced: !!forceMethod
    });

    // Generate link with fallback
    let result: GenerateLinkResult;
    try {
      result = await this.generateLinkWithFallback(params, settings, generationMethod);
    } catch (error) {
      console.error('Failed to generate affiliate link:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to generate affiliate link'
      );
    }

    // Get next display order for this review
    const displayOrder = reviewId
      ? await this.getNextDisplayOrder(reviewId)
      : 0;

    // Save to database
    const { data: affiliateLink, error } = await supabaseAdmin
      .from('affiliate_links')
      .insert({
        user_id: userId,
        review_id: reviewId || null,
        merchant_id: merchantId,
        original_url: originalUrl,
        affiliate_url: result.affiliateUrl,
        short_url: result.shortUrl || null,
        link_type: linkType,
        generation_method: result.generationMethod,
        label: label || null,
        display_order: displayOrder,
        aff_sid: result.affSid,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save affiliate link:', error);
      throw new Error(`Failed to save affiliate link: ${error.message}`);
    }

    console.log('✅ Affiliate link created:', {
      id: affiliateLink.id,
      merchant: merchant.name,
      method: result.generationMethod,
      url_length: result.affiliateUrl.length
    });

    return affiliateLink;
  }

  /**
   * Generate link with automatic fallback
   */
  private async generateLinkWithFallback(
    params: GenerateLinkParams,
    settings: any,
    preferredMethod: GenerationMethod
  ): Promise<GenerateLinkResult> {
    // Try preferred method first
    try {
      if (preferredMethod === 'api') {
        return await this.generateViaApi(params, settings);
      } else {
        return await this.generateViaDeeplink(params, settings);
      }
    } catch (error) {
      console.warn(`Failed with ${preferredMethod}, trying fallback...`, error);

      // Fallback to alternative method
      try {
        if (preferredMethod === 'api') {
          console.log('🔄 Falling back to deeplink generation');
          return await this.generateViaDeeplink(params, settings);
        } else {
          // Deeplink failed, try API if available
          if (settings.api_token && settings.link_mode === 'api') {
            console.log('🔄 Falling back to API generation');
            return await this.generateViaApi(params, settings);
          }
          throw error; // No fallback available
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('All link generation methods failed');
      }
    }
  }

  /**
   * Generate link via AccessTrade API
   */
  private async generateViaApi(
    params: GenerateLinkParams,
    settings: any
  ): Promise<GenerateLinkResult> {
    if (!settings.api_token) {
      throw new Error('API token not configured');
    }

    return await accessTradeGenerator.generateLink(params, {
      apiToken: settings.api_token,
      apiUrl: settings.api_url,
      utmSource: settings.utm_source || 'video-affiliate',
      utmCampaign: settings.utm_campaign || 'review'
    });
  }

  /**
   * Generate link via manual deeplink
   */
  private async generateViaDeeplink(
    params: GenerateLinkParams,
    settings: any
  ): Promise<GenerateLinkResult> {
    if (!settings.publisher_id) {
      throw new Error('Publisher ID not configured for deeplink generation');
    }

    return await deeplinkGenerator.generateLink(params, {
      publisherId: settings.publisher_id,
      deeplinkBaseUrl: settings.deeplink_base_url || 'https://go.isclix.com/deep_link',
      utmSource: settings.utm_source || 'video-affiliate',
      utmCampaign: settings.utm_campaign || 'review'
    });
  }

  /**
   * Select generation method based on settings
   */
  private async selectGenerationMethod(settings: any): Promise<GenerationMethod> {
    // If API mode and configured, use API
    if (settings.link_mode === 'api' && settings.api_token) {
      return 'api';
    }

    // Otherwise use deeplink
    if (settings.publisher_id) {
      return 'deeplink';
    }

    throw new Error('No valid link generation method available. Please configure settings.');
  }

  /**
   * Get all affiliate links for a review
   */
  async getLinksByReview(reviewId: string): Promise<AffiliateLink[]> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('review_id', reviewId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to get affiliate links:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get all affiliate links for a user
   */
  async getLinksByUser(userId: string): Promise<AffiliateLink[]> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to get user affiliate links:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get affiliate link by ID
   */
  async getLinkById(id: string): Promise<AffiliateLink | null> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .select(`
        *,
        merchant:merchants(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to get affiliate link:', error);
      return null;
    }

    return data;
  }

  /**
   * Update affiliate link
   */
  async updateLink(id: string, updates: {
    label?: string;
    display_order?: number;
  }): Promise<AffiliateLink> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update affiliate link: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete affiliate link
   */
  async deleteLink(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('affiliate_links')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete affiliate link: ${error.message}`);
    }
  }

  /**
   * Reorder affiliate links for a review
   */
  async reorderLinks(reviewId: string, linkIds: string[]): Promise<void> {
    // Update display_order for each link
    const updates = linkIds.map((linkId, index) =>
      supabaseAdmin
        .from('affiliate_links')
        .update({
          display_order: index,
          updated_at: new Date().toISOString()
        })
        .eq('id', linkId)
        .eq('review_id', reviewId)
    );

    await Promise.all(updates);
  }

  /**
   * Get next display order for a review
   */
  private async getNextDisplayOrder(reviewId: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_links')
      .select('display_order')
      .eq('review_id', reviewId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return 0;
    }

    return (data.display_order || 0) + 1;
  }

  /**
   * Get link generation statistics
   */
  async getStats(userId?: string): Promise<{
    total: number;
    byMethod: Record<GenerationMethod, number>;
    byMerchant: Array<{ merchant_name: string; count: number }>;
  }> {
    const query = supabaseAdmin
      .from('affiliate_links')
      .select('generation_method, merchant:merchants(name)');

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        total: 0,
        byMethod: { api: 0, deeplink: 0, 'tiktok-api': 0 },
        byMerchant: []
      };
    }

    // Count by method
    const byMethod = data.reduce((acc, link) => {
      const method = link.generation_method as GenerationMethod;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<GenerationMethod, number>);

    // Count by merchant
    const merchantCounts = data.reduce((acc, link) => {
      const name = link.merchant?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byMerchant = Object.entries(merchantCounts)
      .map(([merchant_name, count]) => ({ merchant_name, count: count as number }))
      .sort((a, b) => (b.count as number) - (a.count as number));

    return {
      total: data.length,
      byMethod: {
        api: byMethod.api || 0,
        deeplink: byMethod.deeplink || 0,
        'tiktok-api': byMethod['tiktok-api'] || 0
      },
      byMerchant
    };
  }
}

// Export singleton instance
export const affiliateLinkService = new AffiliateLinkService();
