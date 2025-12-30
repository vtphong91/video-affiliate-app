/**
 * Affiliate Settings Stats API
 * GET /api/admin/affiliate-settings/stats
 *
 * Trả về thống kê tổng hợp về affiliate links và short URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest, getUserRoleFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

interface AffiliateStats {
  totalLinks: number;
  totalClicks: number;
  totalShortUrls: number;
  totalShortUrlClicks: number;
  clicksToday: number;
  conversionRate: number;
  topMerchant: string;
  topPerformingLink: string;
}

/**
 * GET - Lấy thống kê affiliate
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const userRole = await getUserRoleFromRequest(request);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    // Get fresh admin client with cache-busting
    const supabaseAdmin = getFreshSupabaseAdminClient();

    // Get total affiliate links
    const { count: totalLinks } = await supabaseAdmin
      .from('affiliate_links')
      .select('id', { count: 'exact', head: true });

    // Get total short URLs
    const { count: totalShortUrls } = await supabaseAdmin
      .from('short_urls')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total short URL clicks
    const { data: shortUrlsData } = await supabaseAdmin
      .from('short_urls')
      .select('clicks')
      .eq('is_active', true);

    const totalShortUrlClicks = shortUrlsData?.reduce((sum, url) => sum + (url.clicks || 0), 0) || 0;

    // Get clicks from reviews (affiliate_links JSONB)
    const { data: reviews } = await supabaseAdmin
      .from('reviews')
      .select('affiliate_links');

    let totalClicks = 0;
    let clicksToday = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    reviews?.forEach(review => {
      const links = review.affiliate_links || [];
      links.forEach((link: any) => {
        totalClicks += link.clicks || 0;

        // Check if clicked today
        if (link.lastClickedAt) {
          const clickDate = new Date(link.lastClickedAt);
          if (clickDate >= today) {
            clicksToday += 1;
          }
        }
      });
    });

    // Get top merchant
    const { data: merchantStats } = await supabaseAdmin
      .from('affiliate_links')
      .select('merchant_id, merchants(name)')
      .limit(1000);

    const merchantCounts: Record<string, { name: string; count: number }> = {};
    merchantStats?.forEach(link => {
      const merchantId = link.merchant_id;
      const merchantName = (link.merchants as any)?.name || 'Unknown';

      if (!merchantCounts[merchantId]) {
        merchantCounts[merchantId] = { name: merchantName, count: 0 };
      }
      merchantCounts[merchantId].count++;
    });

    const topMerchant = Object.values(merchantCounts)
      .sort((a, b) => b.count - a.count)[0]?.name || 'N/A';

    // Calculate conversion rate (example: clicks / total links * 100)
    const conversionRate = totalLinks > 0
      ? (totalClicks / totalLinks) * 100
      : 0;

    const stats: AffiliateStats = {
      totalLinks: totalLinks || 0,
      totalClicks,
      totalShortUrls: totalShortUrls || 0,
      totalShortUrlClicks,
      clicksToday,
      conversionRate,
      topMerchant,
      topPerformingLink: 'N/A', // TODO: Implement
    };

    console.log('📊 Affiliate stats:', stats);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get affiliate stats error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats'
      },
      { status: 500 }
    );
  }
}
