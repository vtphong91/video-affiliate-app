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

    // Query affiliate_links table directly (with join to merchants and reviews)
    let query = supabaseAdmin
      .from('affiliate_links')
      .select(`
        id,
        review_id,
        merchant_id,
        original_url,
        affiliate_url,
        short_url,
        aff_sid,
        generation_method,
        label,
        created_at,
        updated_at,
        merchants (
          id,
          name,
          domain,
          logo_url
        ),
        reviews (
          id,
          video_title,
          slug
        )
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

    console.log('✅ Query success - Links found:', reviews?.length, 'Total count:', count);

    // Map data from affiliate_links table
    const allLinks: any[] = [];

    reviews?.forEach((linkData: any) => {
      allLinks.push({
        // Link info
        id: linkData.id,
        reviewId: linkData.review_id,
        reviewTitle: linkData.reviews?.video_title || 'Unknown Review',
        reviewSlug: linkData.reviews?.slug || '',
        merchantId: linkData.merchant_id,
        merchantName: linkData.merchants?.name || 'Unknown',
        merchantDomain: linkData.merchants?.domain || '',
        merchantLogo: linkData.merchants?.logo_url || '',
        originalUrl: linkData.original_url,
        trackingUrl: linkData.affiliate_url,
        shortUrl: linkData.short_url || null,
        generationMethod: linkData.generation_method || 'unknown',
        affSid: linkData.aff_sid || null,
        label: linkData.label || null,

        // Stats (will be from clicks tracking later)
        clicks: 0, // TODO: Add clicks tracking
        lastClickedAt: null,

        // Metadata
        createdAt: linkData.created_at,
        updatedAt: linkData.updated_at,
      });
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
    const uniqueReviews = new Set(filteredLinks.map(link => link.reviewId));
    const stats = {
      totalLinks: count || 0,
      totalClicks: filteredLinks.reduce((sum, link) => sum + link.clicks, 0),
      totalReviews: uniqueReviews.size,
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
