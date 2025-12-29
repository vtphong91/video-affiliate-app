import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getAllReviewsForUser } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

// Debug endpoint to find missing review
export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Method 1: Direct Supabase query (like test endpoint)
  const { data: directReviews, error: directError } = await supabaseAdmin
    .from('reviews')
    .select('id, video_title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Method 2: Through service layer
  const serviceReviews = await getAllReviewsForUser(userId);

  const directIds = new Set(directReviews?.map(r => r.id) || []);
  const serviceIds = new Set(serviceReviews.map(r => r.id));

  // Find missing reviews
  const missingInService = directReviews?.filter(r => !serviceIds.has(r.id)) || [];
  const missingInDirect = serviceReviews.filter(r => !directIds.has(r.id));

  return NextResponse.json({
    directCount: directReviews?.length || 0,
    serviceCount: serviceReviews.length,
    difference: (directReviews?.length || 0) - serviceReviews.length,
    missingInService: missingInService.map(r => ({
      id: r.id,
      title: r.video_title,
      created_at: r.created_at
    })),
    missingInDirect: missingInDirect.map(r => ({
      id: r.id,
      title: r.video_title,
      created_at: r.created_at
    })),
    directError,
  });
}
