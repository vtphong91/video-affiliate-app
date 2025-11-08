import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { ActivityLogger } from '@/lib/utils/activity-logger';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await db.getReview(params.id);
    
    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    console.log('🗑️ Deleting review:', params.id);

    // Get review details before deleting
    const review = await db.getReview(params.id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found'
        },
        { status: 404 }
      );
    }

    const reviewTitle = review.video_title || 'Unknown';

    // Delete the review
    await db.deleteReview(params.id);

    console.log('✅ Review deleted successfully:', params.id);

    // Log activity
    if (userId) {
      await ActivityLogger.reviewDeleted(userId, reviewTitle, params.id);
    }

    // Return success with cache-control headers
    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error deleting review:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PATCH /api/reviews/[id] - Starting update');
    console.log('📋 Review ID:', params.id);

    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID:', userId);

    // Parse request body with error handling
    let updates;
    try {
      updates = await request.json();
      console.log('📝 Update data:', JSON.stringify(updates, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        },
        { status: 400 }
      );
    }

    // Validate that we have something to update
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No update data provided'
        },
        { status: 400 }
      );
    }

    // Update review
    console.log('🔄 Calling db.updateReview...');
    const review = await db.updateReview(params.id, updates);
    console.log('✅ Review updated successfully:', review?.id);

    // Log activity
    if (userId && review) {
      try {
        await ActivityLogger.reviewUpdated(userId, review.video_title, review.id);
      } catch (logError) {
        console.warn('⚠️ Failed to log activity:', logError);
        // Don't fail the request if activity logging fails
      }
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating review:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
