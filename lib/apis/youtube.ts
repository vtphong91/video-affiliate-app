import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript';
import type { VideoInfo } from '@/types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        maxres?: { url: string };
        high?: { url: string };
        medium: { url: string };
      };
      channelTitle: string;
      channelId: string;
    };
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
}

interface YouTubeCaptionListResponse {
  items: Array<{
    id: string;
    snippet: {
      language: string;
      trackKind: string;
    };
  }>;
}

/**
 * Extract video ID from YouTube URL
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, youtube.com/embed/ID, youtube.com/v/ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/, // ✅ YouTube Shorts support
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Convert ISO 8601 duration to readable format
 */
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '0:00';

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get YouTube video information
 */
export async function getYouTubeVideoInfo(
  videoId: string
): Promise<VideoInfo> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Fetch video metadata and transcript in parallel
    const [videoResponse, transcript] = await Promise.all([
      axios.get<YouTubeVideoResponse>(
        `${YOUTUBE_API_BASE}/videos`,
        {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId,
            key: YOUTUBE_API_KEY,
          },
        }
      ),
      getYouTubeTranscript(videoId), // Fetch transcript in parallel
    ]);

    console.log('📺 YouTube API - Transcript result:', {
      videoId,
      hasTranscript: !!transcript,
      transcriptLength: transcript?.length,
      transcriptPreview: transcript?.substring(0, 100)
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = videoResponse.data.items[0];
    const thumbnail =
      video.snippet.thumbnails.maxres?.url ||
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium.url;

    const videoInfo = {
      platform: 'youtube' as const,
      videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail,
      duration: parseDuration(video.contentDetails.duration),
      channelName: video.snippet.channelTitle,
      channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      viewCount: parseInt(video.statistics.viewCount),
      publishedAt: new Date().toISOString(),
      transcript: transcript || undefined, // ✅ Add transcript if available
    };

    console.log('📺 YouTube API - Final videoInfo:', {
      title: videoInfo.title.substring(0, 50),
      hasTranscript: !!videoInfo.transcript,
      transcriptLength: videoInfo.transcript?.length
    });

    return videoInfo;
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    throw new Error('Failed to fetch video information');
  }
}

/**
 * Get video transcript/captions using youtube-transcript package
 * This fetches the auto-generated or manual captions from YouTube
 */
export async function getYouTubeTranscript(
  videoId: string
): Promise<string | null> {
  try {
    // Fetch transcript items (array of { text, duration, offset })
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'vi', // Try Vietnamese first
    });

    // Combine all text segments into a single string
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(' ')
      .trim();

    return fullTranscript || null;
  } catch (error) {
    // If Vietnamese transcript not available, try English
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      });

      const fullTranscript = transcriptItems
        .map((item) => item.text)
        .join(' ')
        .trim();

      return fullTranscript || null;
    } catch (fallbackError) {
      // If no transcript available at all, log and return null
      console.log('No transcript available for video:', videoId);
      return null;
    }
  }
}

/**
 * Check if captions are available
 */
export async function hasYouTubeCaptions(videoId: string): Promise<boolean> {
  if (!YOUTUBE_API_KEY) return false;

  try {
    const response = await axios.get<YouTubeCaptionListResponse>(
      `${YOUTUBE_API_BASE}/captions`,
      {
        params: {
          part: 'snippet',
          videoId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    return response.data.items.length > 0;
  } catch (error) {
    console.error('Error checking captions:', error);
    return false;
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}
