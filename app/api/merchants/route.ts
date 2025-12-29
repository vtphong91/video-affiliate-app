/**
 * Public Merchants API
 * GET /api/merchants - List merchants (optionally only active ones)
 *
 * This is a public endpoint for review creation/editing workflow.
 * Admin endpoints are in /api/admin/merchants
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { merchantService } from '@/lib/affiliate/services/merchant-service';

export const dynamic = 'force-dynamic';

/**
 * GET - List merchants
 * Query params:
 *   - active_only=true (default: true) - Only return active merchants
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication for this endpoint
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') !== 'false'; // Default true

    // Get merchants
    const merchants = await merchantService.getAllMerchants(activeOnly);

    return NextResponse.json({
      success: true,
      data: merchants,
      count: merchants.length
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
