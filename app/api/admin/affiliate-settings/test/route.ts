/**
 * Test AccessTrade API Connection
 * POST /api/admin/affiliate-settings/test
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { checkPermission } from '@/lib/auth/middleware/rbac-middleware';
import { affiliateSettingsService } from '@/lib/affiliate/services/settings-service';
import type { TestApiRequest } from '@/lib/affiliate/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds timeout for API test

/**
 * POST - Test API connection
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 POST /api/admin/affiliate-settings/test - Starting...');
    console.log('📋 Headers:', {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie')?.substring(0, 100) + '...'
    });

    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID from request:', userId);

    if (!userId) {
      console.error('❌ No user ID found - Unauthorized');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login again' },
        { status: 401 }
      );
    }

    // Check admin permission
    console.log('🔐 Checking permissions for user:', userId);
    const hasPermission = await checkPermission(userId, 'manage_settings');
    console.log('✅ Has permission:', hasPermission);

    if (!hasPermission) {
      console.error('❌ User does not have manage_settings permission');
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body: TestApiRequest = await request.json();

    // Validation
    if (!body.api_token) {
      return NextResponse.json(
        { success: false, error: 'api_token is required' },
        { status: 400 }
      );
    }

    if (!body.api_url) {
      return NextResponse.json(
        { success: false, error: 'api_url is required' },
        { status: 400 }
      );
    }

    // If using existing token, fetch from database
    let tokenToTest = body.api_token;
    if (body.api_token === 'USE_EXISTING') {
      console.log('🔑 Using existing token from database...');
      const existingToken = await affiliateSettingsService.getApiToken();

      if (!existingToken) {
        return NextResponse.json(
          { success: false, error: 'No existing token found in database' },
          { status: 400 }
        );
      }

      tokenToTest = existingToken;
    }

    console.log('🧪 Testing AccessTrade API connection...', {
      api_url: body.api_url,
      token_preview: tokenToTest.slice(0, 8) + '...',
      using_existing: body.api_token === 'USE_EXISTING'
    });

    // Test API connection
    const testResult = await affiliateSettingsService.testApiConnection({
      api_token: tokenToTest,
      api_url: body.api_url
    });

    // Save test result to database
    await affiliateSettingsService.saveTestResult(testResult);

    console.log('🧪 API test result:', testResult);

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      details: testResult.details
    });

  } catch (error) {
    console.error('Test API connection error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test API connection'
      },
      { status: 500 }
    );
  }
}
