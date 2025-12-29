/**
 * Bulk Generate Affiliate Links
 * POST /api/affiliate-links/bulk-generate
 *
 * Generate multiple affiliate tracking links at once with parallel processing.
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
export const maxDuration = 60; // 60 seconds for bulk operations

interface BulkGenerateRequest {
  merchantId: string;
  links: Array<{
    originalUrl: string;
    linkType?: 'product' | 'homepage';
  }>;
  forceMethod?: GenerationMethod;
}

interface BulkGenerateResult {
  success: boolean;
  affiliateUrl?: string;
  shortUrl?: string;
  affSid?: string;
  generationMethod?: GenerationMethod;
  error?: string;
  originalUrl: string;
}

/**
 * POST - Bulk generate affiliate links
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

    const body: BulkGenerateRequest = await request.json();
    const { merchantId, links, forceMethod } = body;

    // Validation
    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'merchantId is required' },
        { status: 400 }
      );
    }

    if (!links || links.length === 0) {
      return NextResponse.json(
        { success: false, error: 'links array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (links.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 links per bulk request' },
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
          error: 'Affiliate settings not configured'
        },
        { status: 400 }
      );
    }

    // Determine generation method
    let generationMethod: GenerationMethod;
    if (forceMethod) {
      generationMethod = forceMethod;
    } else {
      if (settings.link_mode === 'api' && settings.api_token) {
        generationMethod = 'api';
      } else if (settings.publisher_id) {
        generationMethod = 'deeplink';
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'No valid generation method available'
          },
          { status: 400 }
        );
      }
    }

    console.log('🔗 Bulk generating links:', {
      merchant: merchant.name,
      count: links.length,
      method: generationMethod
    });

    // Generate all links in parallel
    const results = await Promise.allSettled(
      links.map(async (linkRequest) => {
        const { originalUrl, linkType = 'product' } = linkRequest;

        // Validate URL
        try {
          new URL(originalUrl);
        } catch {
          throw new Error(`Invalid URL: ${originalUrl}`);
        }

        // Try to generate with fallback
        let result;
        try {
          // Try preferred method
          if (generationMethod === 'api') {
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
        } catch (primaryError) {
          // Try fallback
          try {
            if (generationMethod === 'api' && settings.publisher_id) {
              result = await deeplinkGenerator.generateLink(
                { userId, merchant, originalUrl, linkType },
                {
                  publisherId: settings.publisher_id,
                  deeplinkBaseUrl: settings.deeplink_base_url || 'https://go.isclix.com/deep_link',
                  utmSource: settings.utm_source || 'video-affiliate',
                  utmCampaign: settings.utm_campaign || 'review'
                }
              );
            } else if (generationMethod === 'deeplink' && settings.api_token) {
              result = await accessTradeGenerator.generateLink(
                { userId, merchant, originalUrl, linkType },
                {
                  apiToken: settings.api_token,
                  apiUrl: settings.api_url,
                  utmSource: settings.utm_source || 'video-affiliate',
                  utmCampaign: settings.utm_campaign || 'review'
                }
              );
            } else {
              throw primaryError;
            }
          } catch (fallbackError) {
            throw new Error(
              primaryError instanceof Error
                ? primaryError.message
                : 'Generation failed'
            );
          }
        }

        // Auto-shorten if no short URL from API
        let finalShortUrl = result.shortUrl;

        if (!finalShortUrl) {
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
          } catch (shortenerError) {
            console.error('Failed to create custom short URL:', shortenerError);
            // Continue without short URL - not critical
          }
        }

        return {
          success: true,
          affiliateUrl: result.affiliateUrl,
          shortUrl: finalShortUrl,
          affSid: result.affSid,
          generationMethod: result.generationMethod,
          originalUrl
        };
      })
    );

    // Process results
    const processedResults: BulkGenerateResult[] = results.map((result, index) => {
      const originalUrl = links[index].originalUrl;

      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'Generation failed',
          originalUrl
        };
      }
    });

    const successCount = processedResults.filter(r => r.success).length;
    const failedCount = processedResults.filter(r => !r.success).length;

    console.log('✅ Bulk generation complete:', {
      total: links.length,
      success: successCount,
      failed: failedCount,
      merchant: merchant.name
    });

    return NextResponse.json({
      success: true,
      data: {
        total: links.length,
        generated: successCount,
        failed: failedCount,
        results: processedResults,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          domain: merchant.domain
        }
      },
      message: failedCount === 0
        ? `Successfully generated ${successCount} links`
        : `Generated ${successCount} links, ${failedCount} failed`
    });

  } catch (error) {
    console.error('Bulk generate error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk generate links'
      },
      { status: 500 }
    );
  }
}
