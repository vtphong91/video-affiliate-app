/**
 * Generate Affiliate Link Endpoint (Lightweight)
 * POST /api/affiliate-links/generate
 *
 * Generates affiliate tracking link without saving to affiliate_links table.
 * This is a lightweight version for review edit workflow where links are
 * saved in reviews.affiliate_links JSONB column instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { affiliateSettingsService } from '@/lib/affiliate/services/settings-service';
import { merchantService } from '@/lib/affiliate/services/merchant-service';
import { accessTradeGenerator } from '@/lib/affiliate/generators/accesstrade-generator';
import { deeplinkGenerator } from '@/lib/affiliate/generators/deeplink-generator';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';
import type { GenerationMethod } from '@/lib/affiliate/types';

export const dynamic = 'force-dynamic';

interface GenerateLinkRequest {
  merchantId: string;
  originalUrl: string;
  linkType?: 'product' | 'homepage';
  forceMethod?: GenerationMethod;
}

/**
 * POST - Generate affiliate link
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: GenerateLinkRequest = await request.json();
    const { merchantId, originalUrl, linkType = 'product', forceMethod } = body;

    // Validation
    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'merchantId is required' },
        { status: 400 }
      );
    }

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

    // Get merchant
    const merchant = await merchantService.getMerchantById(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      );
    }

    if (!merchant.is_active) {
      return NextResponse.json(
        { success: false, error: `Merchant "${merchant.name}" is not active` },
        { status: 400 }
      );
    }

    // Get affiliate settings
    const settings = await affiliateSettingsService.getSettings();
    if (!settings || !settings.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Affiliate settings not configured. Please configure in admin settings.'
        },
        { status: 400 }
      );
    }

    console.log('🔗 Generating affiliate link:', {
      merchant: merchant.name,
      originalUrl,
      linkType,
      forceMethod
    });

    // Determine generation method
    let generationMethod: GenerationMethod;
    if (forceMethod) {
      generationMethod = forceMethod;
    } else {
      // Auto-select based on settings
      if (settings.link_mode === 'api' && settings.api_token) {
        generationMethod = 'api';
      } else if (settings.publisher_id) {
        generationMethod = 'deeplink';
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'No valid generation method available. Please configure API token or Publisher ID.'
          },
          { status: 400 }
        );
      }
    }

    // Generate link with fallback
    let result;
    let usedFallback = false;

    try {
      // Try preferred method
      if (generationMethod === 'api') {
        console.log('📡 Trying AccessTrade API...');
        result = await accessTradeGenerator.generateLink(
          { userId, merchant, originalUrl, linkType },
          {
            apiToken: settings.api_token!,
            apiUrl: settings.api_url,
            utmSource: settings.utm_source || 'video-affiliate',
            utmCampaign: settings.utm_campaign || 'review'
          }
        );
      } else {
        console.log('🔗 Trying Deeplink generation...');
        result = await deeplinkGenerator.generateLink(
          { userId, merchant, originalUrl, linkType },
          {
            publisherId: settings.publisher_id!,
            deeplinkBaseUrl: settings.deeplink_base_url || 'https://go.isclix.com/deep_link',
            utmSource: settings.utm_source || 'video-affiliate',
            utmCampaign: settings.utm_campaign || 'review'
          }
        );
      }

      console.log('✅ Generation successful:', {
        method: result.generationMethod,
        urlLength: result.affiliateUrl.length,
        hasShortUrl: !!result.shortUrl
      });

    } catch (primaryError) {
      console.warn(`❌ ${generationMethod} failed:`, primaryError);

      // Try fallback method
      try {
        if (generationMethod === 'api' && settings.publisher_id) {
          console.log('🔄 Falling back to deeplink...');
          result = await deeplinkGenerator.generateLink(
            { userId, merchant, originalUrl, linkType },
            {
              publisherId: settings.publisher_id,
              deeplinkBaseUrl: settings.deeplink_base_url || 'https://go.isclix.com/deep_link',
              utmSource: settings.utm_source || 'video-affiliate',
              utmCampaign: settings.utm_campaign || 'review'
            }
          );
          usedFallback = true;
          console.log('✅ Fallback successful');

        } else if (generationMethod === 'deeplink' && settings.api_token) {
          console.log('🔄 Falling back to API...');
          result = await accessTradeGenerator.generateLink(
            { userId, merchant, originalUrl, linkType },
            {
              apiToken: settings.api_token,
              apiUrl: settings.api_url,
              utmSource: settings.utm_source || 'video-affiliate',
              utmCampaign: settings.utm_campaign || 'review'
            }
          );
          usedFallback = true;
          console.log('✅ Fallback successful');

        } else {
          // No fallback available
          throw primaryError;
        }

      } catch (fallbackError) {
        console.error('❌ Both methods failed:', {
          primary: primaryError,
          fallback: fallbackError
        });

        return NextResponse.json(
          {
            success: false,
            error: primaryError instanceof Error
              ? primaryError.message
              : 'Failed to generate affiliate link'
          },
          { status: 500 }
        );
      }
    }

    // Auto-shorten if no short URL from AccessTrade API
    let finalShortUrl = result.shortUrl;

    if (!finalShortUrl) {
      console.log('🔗 No short URL from API, creating custom short URL...');

      try {
        const customShortUrl = await urlShortenerService.createShortUrl({
          originalUrl: result.affiliateUrl,
          affSid: result.affSid,
          merchantId: merchant.id,
          userId,
          title: `${merchant.name} - Affiliate Link`,
          expiresInDays: 90
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        finalShortUrl = `${baseUrl}/s/${customShortUrl.short_code}`;

        console.log('✅ Custom short URL created:', finalShortUrl);
      } catch (shortenerError) {
        console.error('Failed to create custom short URL:', shortenerError);
        // Continue without short URL - not critical
      }
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        affiliateUrl: result.affiliateUrl,
        shortUrl: finalShortUrl || null,
        affSid: result.affSid,
        generationMethod: result.generationMethod,
        usedFallback,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          domain: merchant.domain,
          logo_url: merchant.logo_url
        }
      },
      message: usedFallback
        ? `Link generated using fallback method (${result.generationMethod})`
        : 'Link generated successfully'
    });

  } catch (error) {
    console.error('Generate link error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate link'
      },
      { status: 500 }
    );
  }
}
