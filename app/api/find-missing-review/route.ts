import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllReviewsForUser } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Get all IDs from database (just ID field)
  const { data: dbIds } = await admin
    .from('reviews')
    .select('id, created_at, video_title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get all IDs from service layer
  const serviceReviews = await getAllReviewsForUser(userId);
  const serviceIds = new Set(serviceReviews.map(r => r.id));

  // Find missing reviews
  const missingReviews = dbIds?.filter(r => !serviceIds.has(r.id)) || [];

  return NextResponse.json({
    dbCount: dbIds?.length || 0,
    serviceCount: serviceReviews.length,
    difference: (dbIds?.length || 0) - serviceReviews.length,
    missingReviews: missingReviews.map(r => ({
      id: r.id,
      created_at: r.created_at,
      title: r.video_title,
    })),
    dbFirst5: dbIds?.slice(0, 5).map(r => ({
      id: r.id,
      created_at: r.created_at,
      title: r.video_title?.substring(0, 50),
    })),
    serviceFirst5: serviceReviews.slice(0, 5).map(r => ({
      id: r.id,
      created_at: r.created_at,
      title: r.video_title?.substring(0, 50),
    })),
  });
}
