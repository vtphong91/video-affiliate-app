/**
 * Admin Merchants API
 * GET /api/admin/merchants - List merchants
 * POST /api/admin/merchants - Create merchant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { checkPermission } from '@/lib/auth/middleware/rbac-middleware';
import { merchantService, type CreateMerchantRequest } from '@/lib/affiliate/services/merchant-service';

export const dynamic = 'force-dynamic';

/**
 * GET - List all merchants
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

    // Get all merchants (including inactive)
    const merchants = await merchantService.getAllMerchants(false);

    return NextResponse.json({
      success: true,
      data: merchants
    });

  } catch (error) {
    console.error('Get merchants error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get merchants'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new merchant
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

    // Check admin permission
    const hasPermission = await checkPermission(userId, 'manage_settings');

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateMerchantRequest = await request.json();

    // Validation
    if (!body.name || !body.domain || !body.campaign_id || !body.platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, domain, campaign_id, platform' },
        { status: 400 }
      );
    }

    // Create merchant
    const merchant = await merchantService.createMerchant(body);

    return NextResponse.json({
      success: true,
      data: merchant,
      message: 'Merchant created successfully'
    });

  } catch (error) {
    console.error('Create merchant error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create merchant'
      },
      { status: 500 }
    );
  }
}
