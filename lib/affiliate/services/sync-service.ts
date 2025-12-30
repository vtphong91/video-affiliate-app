/**
 * Affiliate Links Sync Service
 * Syncs affiliate links from reviews.affiliate_links (JSONB) to affiliate_links table
 * for historical tracking and analytics
 */
// @ts-nocheck
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import type { AffiliateLink } from '@/types';

export class AffiliateLinksSyncService {
  /**
   * Sync affiliate links from JSONB to affiliate_links table
   * This runs AFTER saving to reviews.affiliate_links
   *
   * @param reviewId - Review ID
   * @param userId - User ID
   * @param affiliateLinksArray - Array of affiliate links from JSONB
   */
  async syncToAffiliateLinkTable(
    reviewId: string,
    userId: string,
    affiliateLinksArray: AffiliateLink[]
  ): Promise<{ success: boolean; synced: number; errors: string[] }> {
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    if (!Array.isArray(affiliateLinksArray) || affiliateLinksArray.length === 0) {
      console.log('⏭️ No affiliate links to sync');
      return { success: true, synced: 0, errors: [] };
    }

    console.log('🔄 Syncing affiliate links to table:', {
      reviewId,
      userId,
      linksCount: affiliateLinksArray.length
    });

    const errors: string[] = [];
    let syncedCount = 0;

    // Check if links already exist for this review (prevent duplicates on updates)
    const { data: existingLinks } = await supabaseAdmin
      .from('affiliate_links')
      .select('id, original_url')
      .eq('review_id', reviewId);

    const existingUrls = new Set(existingLinks?.map((link: any) => link.original_url) || []);

    // Get merchant mapping for lookup
    const { data: merchants } = await supabaseAdmin
      .from('merchants')
      .select('id, name, domain');

    const merchantMap = new Map(
      merchants?.map((m: any) => [m.name.toLowerCase(), m]) || []
    );

    // Get affiliate settings for UTM structure
    const { data: settings } = await supabaseAdmin
      .from('affiliate_settings')
      .select('utm_source, utm_campaign')
      .single();

    const utmSource = settings?.utm_source || 'video-affiliate';
    const utmContentType = settings?.utm_campaign || 'review';

    // Process each link
    for (let index = 0; index < affiliateLinksArray.length; index++) {
      const link = affiliateLinksArray[index];

      try {
        // Skip if already synced (based on original URL)
        if (existingUrls.has(link.url)) {
          console.log(`⏭️ Skipping already synced link: ${link.url.substring(0, 50)}...`);
          continue;
        }

        // Find merchant by platform name or domain
        let merchantId = link.merchantId;
        let merchantName = link.merchantName || link.platform || 'Unknown';

        if (!merchantId) {
          // Try to find merchant by name/platform
          const platformLower = link.platform?.toLowerCase() || '';

          // Try exact match first
          let merchant = merchantMap.get(platformLower);

          // Try partial matches for common platforms
          if (!merchant) {
            if (platformLower.includes('shopee')) {
              merchant = merchantMap.get('shopee');
            } else if (platformLower.includes('lazada')) {
              merchant = merchantMap.get('lazada');
            } else if (platformLower.includes('tiki')) {
              merchant = merchantMap.get('tiki');
            } else if (platformLower.includes('tiktok')) {
              merchant = merchantMap.get('tiktok shop');
            }
          }

          if (merchant) {
            merchantId = merchant.id;
            merchantName = merchant.name;
          }
        }

        // If still no merchant, try to find default/fallback merchant
        if (!merchantId && merchants && merchants.length > 0) {
          // Use first active merchant as fallback (usually Shopee)
          const fallbackMerchant = merchants.find((m: any) => m.domain === 'shopee.vn');
          if (fallbackMerchant) {
            merchantId = fallbackMerchant.id;
            merchantName = `${link.platform || 'Unknown'} (fallback)`;
            console.warn(`⚠️ Using fallback merchant for: ${link.platform}`);
          }
        }

        // Skip only if absolutely no merchant available
        if (!merchantId) {
          console.warn(`⚠️ Cannot sync link - no merchant mapping: ${link.platform}`);
          errors.push(`No merchant mapping: ${link.platform}`);
          continue;
        }

        // Generate aff_sid if not present
        let affSid = link.affSid;
        if (!affSid) {
          const timestamp = Date.now();
          affSid = `${userId.slice(0, 8)}_${merchantId.slice(0, 8)}_${timestamp}`;
        }

        // Determine tracking URL
        const trackingUrl = link.trackingUrl || link.affiliateUrl || link.url;

        // Build UTM parameters for tracking
        // utm_campaign = merchant name (for tracking which merchant)
        // utm_content = content type (e.g., "review")
        const utmCampaign = merchantName.toLowerCase().replace(/\s+/g, '-');
        const utmContent = utmContentType;

        // Insert into affiliate_links table
        const { error: insertError } = await supabaseAdmin
          .from('affiliate_links')
          .insert({
            user_id: userId,
            review_id: reviewId,
            merchant_id: merchantId,
            original_url: link.url,
            affiliate_url: trackingUrl,
            short_url: link.shortUrl || null,
            link_type: 'product', // Default to product
            generation_method: link.generationMethod || 'unknown',
            aff_sid: affSid,
            label: link.price ? `${link.price} ${link.discount || ''}`.trim() : null,
            display_order: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ Failed to sync link:', insertError);
          errors.push(`Failed to sync ${link.url.substring(0, 50)}: ${insertError.message}`);
        } else {
          syncedCount++;
          console.log(`✅ Synced link ${index + 1}/${affiliateLinksArray.length}:`, {
            merchant: merchantName,
            aff_sid: affSid,
            utm_campaign: utmCampaign,
            utm_content: utmContent
          });
        }
      } catch (error) {
        console.error('❌ Error syncing link:', error);
        errors.push(
          `Error syncing link ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log('✅ Sync complete:', {
      total: affiliateLinksArray.length,
      synced: syncedCount,
      errors: errors.length
    });

    return {
      success: errors.length === 0,
      synced: syncedCount,
      errors
    };
  }

  /**
   * Delete synced links when review is deleted
   */
  async deleteSyncedLinks(reviewId: string): Promise<void> {
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    const { error } = await supabaseAdmin
      .from('affiliate_links')
      .delete()
      .eq('review_id', reviewId);

    if (error) {
      console.error('❌ Failed to delete synced links:', error);
    } else {
      console.log('✅ Deleted synced links for review:', reviewId);
    }
  }

  /**
   * Update synced links when review is updated
   * Strategy: Delete old + Re-sync new
   */
  async updateSyncedLinks(
    reviewId: string,
    userId: string,
    newAffiliateLinks: AffiliateLink[]
  ): Promise<{ success: boolean; synced: number; errors: string[] }> {
    // Delete existing synced links
    await this.deleteSyncedLinks(reviewId);

    // Re-sync with new data
    return await this.syncToAffiliateLinkTable(reviewId, userId, newAffiliateLinks);
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(userId?: string): Promise<{
    totalInReviews: number;
    totalInTable: number;
    syncRate: number;
  }> {
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Count links in reviews.affiliate_links (JSONB)
    let reviewQuery = supabaseAdmin
      .from('reviews')
      .select('affiliate_links');

    if (userId) {
      reviewQuery = reviewQuery.eq('user_id', userId);
    }

    const { data: reviews } = await reviewQuery;

    let totalInReviews = 0;
    reviews?.forEach((review: any) => {
      if (Array.isArray(review.affiliate_links)) {
        totalInReviews += review.affiliate_links.length;
      }
    });

    // Count links in affiliate_links table
    let tableQuery = supabaseAdmin
      .from('affiliate_links')
      .select('id', { count: 'exact', head: true });

    if (userId) {
      tableQuery = tableQuery.eq('user_id', userId);
    }

    const { count: totalInTable } = await tableQuery;

    const syncRate = totalInReviews > 0
      ? Math.round((totalInTable || 0) / totalInReviews * 100)
      : 0;

    return {
      totalInReviews,
      totalInTable: totalInTable || 0,
      syncRate
    };
  }
}

// Export singleton instance
export const affiliateLinksSyncService = new AffiliateLinksSyncService();
