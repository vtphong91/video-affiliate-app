/**
 * Create Short URL Endpoint
 * POST /api/shortener/create
 *
 * Creates a shortened URL for any long URL (especially affiliate links)
 * Returns short code and full short URL
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';

export const dynamic = 'force-dynamic';

interface CreateShortUrlRequest {
  originalUrl: string;
  reviewId?: string;
  affSid?: string;
  merchantId?: string;
  title?: string;
  description?: string;
  expiresInDays?: number;
}

/**
 * POST - Create short URL
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication required
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateShortUrlRequest = await request.json();
    const {
      originalUrl,
      reviewId,
      affSid,
      merchantId,
      title,
      description,
      expiresInDays
    } = body;

    // Validation
    if (!originalUrl) {
      return NextResponse.json(
        { success: false, error: 'originalUrl is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('📎 Creating short URL for user:', userId.substring(0, 8));

    // Create short URL
    const shortUrl = await urlShortenerService.createShortUrl({
      originalUrl,
      reviewId,
      affSid,
      merchantId,
      userId,
      title,
      description,
      expiresInDays: expiresInDays || 90 // Default 90 days expiration
    });

    // Build full short URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const fullShortUrl = `${baseUrl}/s/${shortUrl.short_code}`;

    console.log('✅ Short URL created:', fullShortUrl);

    return NextResponse.json({
      success: true,
      data: {
        id: shortUrl.id,
        short_code: shortUrl.short_code,
        short_url: fullShortUrl,
        original_url: shortUrl.original_url,
        review_id: shortUrl.review_id,
        aff_sid: shortUrl.aff_sid,
        merchant_id: shortUrl.merchant_id,
        title: shortUrl.title,
        expires_at: shortUrl.expires_at,
        created_at: shortUrl.created_at
      },
      message: 'Short URL created successfully'
    });

  } catch (error) {
    console.error('Create short URL error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create short URL'
      },
      { status: 500 }
    );
  }
}
