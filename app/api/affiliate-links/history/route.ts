// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

/**
 * GET /api/affiliate-links/history
 * Lấy lịch sử tất cả affiliate links đã tạo
 *
 * Query params:
 * - merchantId: Filter by merchant (optional)
 * - reviewId: Filter by review (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Affiliate Links History API - Starting...');

    const userId = await getUserIdFromRequest(request);
    console.log('🔗 User ID:', userId);

    if (!userId) {
      console.log('❌ No user ID - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    const reviewId = searchParams.get('reviewId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('🔗 Query params:', { merchantId, reviewId, page, limit, offset });

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Query reviews with affiliate_links JSONB array
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        id,
        title,
        slug,
        affiliate_links,
        created_at,
        updated_at,
        user_id
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (reviewId) {
      query = query.eq('id', reviewId);
    }

    console.log('🔗 Executing query...');
    const { data: reviews, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching affiliate links history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch affiliate links history', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Query success - Reviews found:', reviews?.length, 'Total count:', count);

    // Flatten affiliate_links from all reviews into a single array
    const allLinks: any[] = [];

    reviews?.forEach((review) => {
      const links = review.affiliate_links as any[];
      if (Array.isArray(links) && links.length > 0) {
        links.forEach((link) => {
          // Skip links without tracking URLs (not generated yet)
          if (!link.trackingUrl && !link.affiliateUrl) {
            return;
          }

          allLinks.push({
            // Link info
            id: link.affSid || `${review.id}_${link.url}`,
            reviewId: review.id,
            reviewTitle: review.title,
            reviewSlug: review.slug,
            merchantId: link.merchantId || null,
            merchantName: link.merchantName || 'Unknown',
            originalUrl: link.url,
            trackingUrl: link.trackingUrl || link.affiliateUrl,
            shortUrl: link.shortUrl || null,
            generationMethod: link.generationMethod || 'unknown',
            affSid: link.affSid || null,

            // Stats
            clicks: link.clicks || 0,
            lastClickedAt: link.lastClickedAt || null,

            // Metadata
            createdAt: review.created_at,
            updatedAt: review.updated_at,
          });
        });
      }
    });

    // Apply merchant filter if provided
    let filteredLinks = allLinks;
    if (merchantId) {
      filteredLinks = allLinks.filter(link => link.merchantId === merchantId);
    }

    // Sort by creation date (newest first)
    filteredLinks.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate stats
    const stats = {
      totalLinks: filteredLinks.length,
      totalClicks: filteredLinks.reduce((sum, link) => sum + link.clicks, 0),
      totalReviews: reviews?.length || 0,
      avgClicksPerLink: filteredLinks.length > 0
        ? Math.round(filteredLinks.reduce((sum, link) => sum + link.clicks, 0) / filteredLinks.length)
        : 0,
    };

    console.log('✅ Returning response - Links:', filteredLinks.length, 'Stats:', stats);

    return NextResponse.json({
      success: true,
      data: {
        links: filteredLinks,
        stats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in affiliate links history API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
