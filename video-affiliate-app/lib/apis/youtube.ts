import axios from 'axios';
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
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
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
    const response = await axios.get<YouTubeVideoResponse>(
      `${YOUTUBE_API_BASE}/videos`,
      {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const thumbnail =
      video.snippet.thumbnails.maxres?.url ||
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium.url;

    return {
      platform: 'youtube',
      videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail,
      duration: parseDuration(video.contentDetails.duration),
      channelName: video.snippet.channelTitle,
      channelUrl: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      viewCount: parseInt(video.statistics.viewCount),
      publishedAt: new Date().toISOString(), // Could parse from snippet.publishedAt
    };
  } catch (error) {
    console.error('Error fetching YouTube video info:', error);
    throw new Error('Failed to fetch video information');
  }
}

/**
 * Get video transcript/captions (requires additional API call)
 * Note: YouTube API v3 doesn't provide direct transcript access
 * This is a placeholder - you might need to use youtube-transcript package
 */
export async function getYouTubeTranscript(
  videoId: string
): Promise<string | null> {
  // This would require the youtube-transcript npm package or similar
  // For now, return null as it's optional
  console.log('Transcript fetching not implemented yet for:', videoId);
  return null;
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
