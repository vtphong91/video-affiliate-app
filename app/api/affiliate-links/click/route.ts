/**
 * Click Tracking Endpoint (Phase 4-Lite)
 * POST /api/affiliate-links/click
 *
 * Tracks click on affiliate link and redirects to tracking URL.
 * Simple implementation using JSONB update (no separate clicks table).
 */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface ClickTrackingRequest {
  reviewId: string;
  affSid: string;
  referrer?: string;
}

/**
 * POST - Track click and return redirect URL
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClickTrackingRequest = await request.json();
    const { reviewId, affSid, referrer } = body;

    if (!reviewId || !affSid) {
      return NextResponse.json(
        { success: false, error: 'reviewId and affSid are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Get review with affiliate links
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('affiliate_links')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Find the specific link by affSid
    const affiliateLinks = review.affiliate_links || [];
    const linkIndex = affiliateLinks.findIndex((link: any) => link.affSid === affSid);

    if (linkIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Affiliate link not found' },
        { status: 404 }
      );
    }

    const link = affiliateLinks[linkIndex];
    const redirectUrl = link.trackingUrl || link.url;

    if (!redirectUrl) {
      return NextResponse.json(
        { success: false, error: 'No redirect URL available' },
        { status: 400 }
      );
    }

    // Update click counter
    const updatedLinks = [...affiliateLinks];
    updatedLinks[linkIndex] = {
      ...link,
      clicks: (link.clicks || 0) + 1,
      lastClickedAt: new Date().toISOString()
    };

    // Save updated affiliate links back to JSONB
    const { error: updateError } = await supabaseAdmin
      .from('reviews')
      .update({
        affiliate_links: updatedLinks,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Failed to update click count:', updateError);
      // Don't fail the request, just log the error
      // User should still be redirected
    }

    console.log('📊 Click tracked:', {
      reviewId,
      affSid: affSid.slice(0, 12),
      clicks: updatedLinks[linkIndex].clicks,
      merchant: link.merchantName || link.platform
    });

    // Return redirect URL for client-side redirect
    return NextResponse.json({
      success: true,
      redirectUrl,
      clicks: updatedLinks[linkIndex].clicks
    });

  } catch (error) {
    console.error('Click tracking error:', error);

    // Even if tracking fails, we should try to redirect
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track click'
      },
      { status: 500 }
    );
  }
}
