import axios from 'axios';
import type { VideoInfo } from '@/types';

/**
 * Extract TikTok video ID from URL
 */
export function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /vm\.tiktok\.com\/([A-Za-z0-9]+)/,
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
 * Get TikTok video information
 * Uses RapidAPI if key is available, otherwise returns placeholder data
 *
 * To enable real TikTok data fetching:
 * 1. Sign up at https://rapidapi.com/
 * 2. Subscribe to "TikTok Video No Watermark2" API
 * 3. Add RAPIDAPI_KEY to your .env file
 */
export async function getTikTokVideoInfo(
  videoId: string
): Promise<VideoInfo> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  // If RapidAPI key is configured, use it
  if (RAPIDAPI_KEY) {
    try {
      console.log('🎯 Fetching TikTok video via RapidAPI...');
      return await getTikTokVideoInfoViaRapidAPI(videoId);
    } catch (error) {
      console.error('❌ RapidAPI failed:', error);
      console.warn('⚠️ Falling back to placeholder data');
      // Fall through to placeholder below
    }
  } else {
    console.warn('⚠️ RAPIDAPI_KEY not configured. TikTok videos will return placeholder data.');
    console.info('💡 To enable real TikTok data: Add RAPIDAPI_KEY to .env (see .env.example)');
  }

  // Return placeholder data when RapidAPI is not available or failed
  return {
    platform: 'tiktok',
    videoId,
    title: 'TikTok Video (API Key Required)',
    description: 'Add RAPIDAPI_KEY to .env to fetch real TikTok video data. See .env.example for instructions.',
    thumbnail: `https://p16-sign.tiktokcdn.com/obj/${videoId}`, // Placeholder
    duration: '0:00',
    channelName: 'TikTok User',
    channelUrl: '',
    viewCount: 0,
  };
}

/**
 * Get TikTok video info using RapidAPI (requires RAPIDAPI_KEY)
 * Alternative implementation using a paid API service
 */
export async function getTikTokVideoInfoViaRapidAPI(
  videoId: string
): Promise<VideoInfo> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key not configured');
  }

  try {
    const response = await axios.get(
      `https://tiktok-video-no-watermark2.p.rapidapi.com/`,
      {
        params: { url: `https://www.tiktok.com/video/${videoId}` },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com',
        },
      }
    );

    const data = response.data.data;

    return {
      platform: 'tiktok',
      videoId,
      title: data.title || 'TikTok Video',
      description: data.desc || '',
      thumbnail: data.cover || '',
      duration: formatTikTokDuration(data.duration),
      channelName: data.author?.nickname || 'TikTok User',
      channelUrl: data.author?.id
        ? `https://www.tiktok.com/@${data.author.id}`
        : '',
      viewCount: data.play_count || 0,
    };
  } catch (error) {
    console.error('Error fetching TikTok video via RapidAPI:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
}

/**
 * Format TikTok duration (usually in seconds)
 */
function formatTikTokDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate TikTok URL
 */
export function isValidTikTokUrl(url: string): boolean {
  return extractTikTokVideoId(url) !== null;
}

/**
 * Get TikTok embed HTML
 */
export function getTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

/**
 * Note: For production use, consider:
 * 1. Using tiktok-scraper npm package (may break with TikTok updates)
 * 2. Using paid API services like RapidAPI, Apify, etc.
 * 3. Implementing puppeteer-based scraping (slower but more reliable)
 * 4. Using TikTok's official API (requires business account)
 */

// Example using tiktok-scraper package (commented out)
/*
import TikTokScraper from 'tiktok-scraper';

export async function getTikTokVideoInfoWithScraper(
  url: string
): Promise<VideoInfo> {
  try {
    const videoMeta = await TikTokScraper.getVideoMeta(url);

    return {
      platform: 'tiktok',
      videoId: videoMeta.id,
      title: videoMeta.text || 'TikTok Video',
      description: videoMeta.text || '',
      thumbnail: videoMeta.covers.default,
      duration: formatTikTokDuration(videoMeta.videoMeta.duration),
      channelName: videoMeta.authorMeta.name,
      channelUrl: `https://www.tiktok.com/@${videoMeta.authorMeta.name}`,
      viewCount: videoMeta.playCount,
    };
  } catch (error) {
    console.error('Error scraping TikTok video:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
}
*/
