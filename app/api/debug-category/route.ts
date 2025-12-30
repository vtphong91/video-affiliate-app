// @ts-nocheck
import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categoryId = 'beee6b97-aa0d-48af-8e75-369918b19e24';

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  const { data: category, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  return NextResponse.json({
    category,
    error,
    exists: !!category,
  });
}
