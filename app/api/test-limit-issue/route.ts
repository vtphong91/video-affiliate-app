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

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Test 1: Minimal fields
  const { data: minimal } = await admin
    .from('reviews')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Test 2: Current fields (without large text)
  const { data: current } = await admin
    .from('reviews')
    .select(`
      id, user_id, slug, video_url, video_platform, video_id,
      video_title, video_thumbnail,
      channel_name, channel_url, custom_title, summary,
      category_id, status, views, clicks, created_at, updated_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Test 3: Add one more field at a time
  const { data: withCta } = await admin
    .from('reviews')
    .select(`
      id, user_id, slug, video_url, video_platform, video_id,
      video_title, video_thumbnail,
      channel_name, channel_url, custom_title, summary,
      category_id, status, views, clicks, created_at, updated_at, cta
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const missingId = 'f65dd0ed-c3d8-46a2-ae7a-33cd5811a18b';

  return NextResponse.json({
    missingId,
    minimal: {
      count: minimal?.length,
      hasMissing: minimal?.some(r => r.id === missingId),
      firstId: minimal?.[0]?.id,
    },
    current: {
      count: current?.length,
      hasMissing: current?.some(r => r.id === missingId),
      firstId: current?.[0]?.id,
    },
    withCta: {
      count: withCta?.length,
      hasMissing: withCta?.some(r => r.id === missingId),
      firstId: withCta?.[0]?.id,
    },
  });
}
