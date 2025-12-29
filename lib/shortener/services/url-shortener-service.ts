/**
 * URL Shortener Service
 * Main service for creating and managing short URLs
 *
 * Features:
 * - Create short URLs with tracking integration
 * - Click tracking (simple counter + detailed logs)
 * - Link expiration management
 * - Statistics and analytics
 */

import { supabaseAdmin } from '@/lib/db/supabase';
import { shortCodeGenerator } from './short-code-generator';

export interface CreateShortUrlRequest {
  originalUrl: string;
  reviewId?: string;
  affSid?: string;
  merchantId?: string;
  userId: string;
  title?: string;
  description?: string;
  expiresInDays?: number;
  variant?: string;
}

export interface ShortUrl {
  id: string;
  short_code: string;
  original_url: string;
  review_id?: string;
  aff_sid?: string;
  merchant_id?: string;
  title?: string;
  description?: string;
  clicks: number;
  last_clicked_at?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  created_by: string;
  variant?: string;
}

export interface ShortUrlStats {
  total_clicks: number;
  unique_ips: number;
  last_30_days_clicks: number;
  top_referrers: Array<{ referrer: string; count: number }>;
  device_breakdown: { mobile: number; desktop: number; tablet: number; unknown: number };
}

class UrlShortenerService {
  /**
   * Create short URL
   *
   * @param request - Short URL creation parameters
   * @returns Created short URL with metadata
   * @throws Error if URL invalid or creation fails
   */
  async createShortUrl(request: CreateShortUrlRequest): Promise<ShortUrl> {
    // Validate original URL
    try {
      new URL(request.originalUrl);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Generate unique short code
    const checkExists = async (code: string): Promise<boolean> => {
      const { data } = await supabaseAdmin
        .from('short_urls')
        .select('id')
        .eq('short_code', code)
        .eq('is_active', true)
        .single();

      return !!data;
    };

    const shortCode = await shortCodeGenerator.generateUniqueCode(checkExists);

    // Calculate expiration
    let expiresAt: string | null = null;
    if (request.expiresInDays && request.expiresInDays > 0) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + request.expiresInDays);
      expiresAt = expireDate.toISOString();
    }

    console.log('📎 Creating short URL:', {
      shortCode,
      originalUrl: request.originalUrl.substring(0, 100) + '...',
      expiresAt
    });

    // Insert to database
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .insert({
        short_code: shortCode,
        original_url: request.originalUrl,
        review_id: request.reviewId || null,
        aff_sid: request.affSid || null,
        merchant_id: request.merchantId || null,
        title: request.title || null,
        description: request.description || null,
        created_by: request.userId,
        expires_at: expiresAt,
        variant: request.variant || null
      })
      .select()
      .single();

    if (error) {
      console.error('Create short URL error:', error);
      throw new Error('Failed to create short URL: ' + error.message);
    }

    console.log('✅ Short URL created:', shortCode);

    return data;
  }

  /**
   * Get short URL by code
   *
   * @param shortCode - The short code to lookup
   * @returns Short URL if found and active, null otherwise
   */
  async getByCode(shortCode: string): Promise<ShortUrl | null> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Check expiration
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        console.log(`⏰ Short URL expired: ${shortCode}`);
        // Mark as inactive
        await this.deactivateShortUrl(data.id);
        return null;
      }
    }

    return data;
  }

  /**
   * Track click on short URL
   * Updates simple counter + optional detailed logging
   *
   * @param shortUrlId - Short URL ID
   * @param metadata - Click metadata (user agent, IP, referrer)
   */
  async trackClick(
    shortUrlId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      referrer?: string;
    }
  ): Promise<void> {
    try {
      // Get current click count first
      const { data: currentData } = await supabaseAdmin
        .from('short_urls')
        .select('clicks')
        .eq('id', shortUrlId)
        .single();

      // Increment simple counter
      const { error: updateError } = await supabaseAdmin
        .from('short_urls')
        .update({
          clicks: (currentData?.clicks || 0) + 1,
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', shortUrlId);

      if (updateError) {
        console.error('Failed to update click counter:', updateError);
        // Don't throw - tracking failure shouldn't break redirect
      }

      // Log detailed click (if enabled via env var)
      const detailedTrackingEnabled = process.env.ENABLE_DETAILED_CLICK_TRACKING === 'true';
      if (detailedTrackingEnabled) {
        await this.logDetailedClick(shortUrlId, metadata);
      }

    } catch (error) {
      console.error('Click tracking error:', error);
      // Swallow error - tracking is non-critical
    }
  }

  /**
   * Log detailed click information
   * Stores to short_url_clicks table with device/browser parsing
   *
   * @param shortUrlId - Short URL ID
   * @param metadata - Click metadata
   */
  private async logDetailedClick(
    shortUrlId: string,
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      referrer?: string;
    }
  ): Promise<void> {
    const deviceType = this.detectDeviceType(metadata.userAgent);
    const browserInfo = this.parseBrowser(metadata.userAgent);

    const { error } = await supabaseAdmin
      .from('short_url_clicks')
      .insert({
        short_url_id: shortUrlId,
        user_agent: metadata.userAgent?.substring(0, 500) || null,
        ip_address: metadata.ipAddress || null,
        referrer: metadata.referrer?.substring(0, 500) || null,
        device_type: deviceType,
        browser: browserInfo.browser,
        os: browserInfo.os
      });

    if (error) {
      console.error('Failed to log detailed click:', error);
    }
  }

  /**
   * Detect device type from user agent
   *
   * @param userAgent - User agent string
   * @returns Device type: mobile, tablet, desktop, or unknown
   */
  private detectDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Parse browser and OS from user agent
   *
   * @param userAgent - User agent string
   * @returns Browser and OS names
   */
  private parseBrowser(userAgent?: string): { browser: string; os: string } {
    if (!userAgent) return { browser: 'unknown', os: 'unknown' };

    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = 'unknown';
    if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    // OS detection
    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { browser, os };
  }

  /**
   * Get short URLs by review
   *
   * @param reviewId - Review ID
   * @returns Array of short URLs for this review
   */
  async getByReview(reviewId: string): Promise<ShortUrl[]> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('review_id', reviewId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get short URLs by review error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get short URLs by user
   *
   * @param userId - User ID
   * @param limit - Maximum number to return
   * @returns Array of user's short URLs
   */
  async getByUser(userId: string, limit: number = 50): Promise<ShortUrl[]> {
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .eq('created_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Get user short URLs error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Deactivate short URL
   * Marks URL as inactive (soft delete)
   *
   * @param id - Short URL ID
   */
  async deactivateShortUrl(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('short_urls')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Deactivate short URL error:', error);
      throw new Error('Failed to deactivate short URL');
    }
  }

  /**
   * Refresh expired link
   * Extends expiration date and reactivates link
   *
   * @param id - Short URL ID
   * @param expiresInDays - New expiration (days from now)
   * @returns Updated short URL
   */
  async refreshShortUrl(id: string, expiresInDays: number = 90): Promise<ShortUrl> {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expiresInDays);

    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .update({
        expires_at: expireDate.toISOString(),
        is_active: true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Refresh short URL error:', error);
      throw new Error('Failed to refresh short URL');
    }

    return data;
  }

  /**
   * Get statistics for short URL
   *
   * @param shortUrlId - Short URL ID
   * @returns Statistics object
   */
  async getStats(shortUrlId: string): Promise<ShortUrlStats> {
    // Get basic stats from short_urls table
    const { data: shortUrl } = await supabaseAdmin
      .from('short_urls')
      .select('clicks, created_at')
      .eq('id', shortUrlId)
      .single();

    if (!shortUrl) {
      throw new Error('Short URL not found');
    }

    // If detailed tracking enabled, get from clicks table
    const detailedTrackingEnabled = process.env.ENABLE_DETAILED_CLICK_TRACKING === 'true';
    if (detailedTrackingEnabled) {
      return this.getDetailedStats(shortUrlId);
    }

    // Basic stats (without detailed clicks table)
    return {
      total_clicks: shortUrl.clicks || 0,
      unique_ips: 0, // Not tracked in basic mode
      last_30_days_clicks: shortUrl.clicks || 0, // Approximation
      top_referrers: [],
      device_breakdown: { mobile: 0, desktop: 0, tablet: 0, unknown: 0 }
    };
  }

  /**
   * Get detailed statistics from clicks table
   *
   * @param shortUrlId - Short URL ID
   * @returns Detailed statistics
   */
  private async getDetailedStats(shortUrlId: string): Promise<ShortUrlStats> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total clicks
    const { count: totalClicks } = await supabaseAdmin
      .from('short_url_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('short_url_id', shortUrlId);

    // Unique IPs
    const { data: uniqueIpData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('ip_address')
      .eq('short_url_id', shortUrlId);

    const uniqueIps = new Set(
      uniqueIpData?.map(r => r.ip_address).filter(ip => ip !== null)
    ).size;

    // Last 30 days
    const { count: last30Days } = await supabaseAdmin
      .from('short_url_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('short_url_id', shortUrlId)
      .gte('clicked_at', thirtyDaysAgo.toISOString());

    // Top referrers
    const { data: referrerData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('referrer')
      .eq('short_url_id', shortUrlId)
      .not('referrer', 'is', null);

    const referrerCounts: Record<string, number> = {};
    referrerData?.forEach(r => {
      if (r.referrer) {
        referrerCounts[r.referrer] = (referrerCounts[r.referrer] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown
    const { data: deviceData } = await supabaseAdmin
      .from('short_url_clicks')
      .select('device_type')
      .eq('short_url_id', shortUrlId);

    const deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
    deviceData?.forEach(r => {
      const type = r.device_type as keyof typeof deviceBreakdown;
      if (type in deviceBreakdown) {
        deviceBreakdown[type]++;
      } else {
        deviceBreakdown.unknown++;
      }
    });

    return {
      total_clicks: totalClicks || 0,
      unique_ips: uniqueIps,
      last_30_days_clicks: last30Days || 0,
      top_referrers: topReferrers,
      device_breakdown: deviceBreakdown
    };
  }

  /**
   * Batch deactivate expired links
   * Useful for maintenance cron job
   *
   * @returns Number of links deactivated
   */
  async deactivateExpiredLinks(): Promise<number> {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .update({ is_active: false })
      .eq('is_active', true)
      .not('expires_at', 'is', null)
      .lt('expires_at', now)
      .select('id');

    if (error) {
      console.error('Batch deactivate error:', error);
      return 0;
    }

    const count = data?.length || 0;
    if (count > 0) {
      console.log(`🧹 Deactivated ${count} expired short URLs`);
    }

    return count;
  }
}

// Singleton instance
export const urlShortenerService = new UrlShortenerService();
