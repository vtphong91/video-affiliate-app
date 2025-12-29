/**
 * Admin Affiliate Settings API
 * GET /api/admin/affiliate-settings - Get settings
 * PATCH /api/admin/affiliate-settings - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { checkPermission } from '@/lib/auth/middleware/rbac-middleware';
import { affiliateSettingsService } from '@/lib/affiliate/services/settings-service';
import type { UpdateSettingsRequest } from '@/lib/affiliate/types';

export const dynamic = 'force-dynamic';

/**
 * GET - Get current affiliate settings
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permission
    const hasPermission = await checkPermission(userId, 'manage_settings');

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get settings
    const settings = await affiliateSettingsService.getSettings();

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          error: 'Settings not found',
          message: 'Please run database migration first'
        },
        { status: 404 }
      );
    }

    // Mask API token and publisher_id (don't send full values to client)
    const safeSettings = {
      ...settings,
      api_token: settings.api_token
        ? `${settings.api_token.slice(0, 8)}...${settings.api_token.slice(-4)}`
        : null,
      has_api_token: !!settings.api_token,
      publisher_id: settings.publisher_id ? '***************' : null,
      has_publisher_id: !!settings.publisher_id
    };

    return NextResponse.json({
      success: true,
      data: safeSettings
    });

  } catch (error) {
    console.error('Get affiliate settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get settings'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update affiliate settings
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('🔧 PATCH /api/admin/affiliate-settings - Starting...');
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

    const body: UpdateSettingsRequest = await request.json();
    console.log('📦 Request body:', { ...body, api_token: body.api_token ? '***REDACTED***' : undefined });

    // Validate
    if (body.link_mode && !['api', 'deeplink'].includes(body.link_mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid link_mode. Must be "api" or "deeplink"' },
        { status: 400 }
      );
    }

    // Update settings
    const updated = await affiliateSettingsService.updateSettings(body);

    // Mask token and publisher_id in response
    const safeSettings = {
      ...updated,
      api_token: updated.api_token
        ? `${updated.api_token.slice(0, 8)}...${updated.api_token.slice(-4)}`
        : null,
      has_api_token: !!updated.api_token,
      publisher_id: updated.publisher_id ? '***************' : null,
      has_publisher_id: !!updated.publisher_id
    };

    return NextResponse.json({
      success: true,
      data: safeSettings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update affiliate settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update settings'
      },
      { status: 500 }
    );
  }
}
