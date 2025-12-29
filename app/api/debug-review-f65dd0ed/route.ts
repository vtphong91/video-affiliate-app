import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

  const reviewId = 'f65dd0ed-c3d8-46a2-ae7a-33cd5811a18b';

  // Get full review data
  const { data: review, error } = await admin
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: 'Review not found' });
  }

  // Calculate field sizes
  const fieldSizes = Object.entries(review).map(([key, value]) => ({
    field: key,
    type: typeof value,
    size: value ? String(value).length : 0,
    isNull: value === null,
    preview: value ? String(value).substring(0, 100) : null,
  })).sort((a, b) => b.size - a.size);

  const largeFields = fieldSizes.filter(f => f.size > 1000);

  return NextResponse.json({
    reviewId,
    found: true,
    totalFields: fieldSizes.length,
    largeFields,
    top10LargestFields: fieldSizes.slice(0, 10),
    allFieldNames: Object.keys(review),
  });
}
