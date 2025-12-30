// @ts-nocheck
import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const reviewId = '0c1c13db-4b78-415d-aadd-6dc70090acc8';

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  return NextResponse.json({
    review,
    error,
    hasCategoryId: !!review?.category_id,
    categoryId: review?.category_id,
  });
}
