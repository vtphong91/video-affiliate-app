import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeVideoInfo, extractYouTubeVideoId } from '@/lib/apis/youtube';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    const videoId = searchParams.get('videoId');

    if (!url && !videoId) {
      return NextResponse.json(
        { error: 'URL or videoId is required' },
        { status: 400 }
      );
    }

    let extractedVideoId = videoId;

    if (url && !videoId) {
      extractedVideoId = extractYouTubeVideoId(url);
      if (!extractedVideoId) {
        return NextResponse.json(
          { error: 'Invalid YouTube URL' },
          { status: 400 }
        );
      }
    }

    if (!extractedVideoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID' },
        { status: 400 }
      );
    }

    const videoInfo = await getYouTubeVideoInfo(extractedVideoId);

    return NextResponse.json(videoInfo);
  } catch (error) {
    console.error('Error fetching YouTube video:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch video info';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
