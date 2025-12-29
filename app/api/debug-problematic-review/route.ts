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

  const newestId = '13cf25b4-531c-4a43-8fbb-7d3ee8e01a0b';

  // Get ALL fields with select('*')
  const { data: reviewStar, error: starError } = await admin
    .from('reviews')
    .select('*')
    .eq('id', newestId)
    .single();

  // Check which fields are NULL or problematic
  const nullFields = reviewStar ? Object.entries(reviewStar).filter(([k, v]) => v === null).map(([k]) => k) : [];
  const undefinedFields = reviewStar ? Object.entries(reviewStar).filter(([k, v]) => v === undefined).map(([k]) => k) : [];

  return NextResponse.json({
    found: !!reviewStar,
    error: starError,
    nullFields,
    undefinedFields,
    fieldCount: reviewStar ? Object.keys(reviewStar).length : 0,
    allFields: reviewStar ? Object.keys(reviewStar) : [],
    review: reviewStar,
  });
}
