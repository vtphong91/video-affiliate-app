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
 * Note: TikTok doesn't have a public API, so this uses web scraping
 * Consider using a TikTok API service like RapidAPI's TikTok API
 */
export async function getTikTokVideoInfo(
  videoId: string
): Promise<VideoInfo> {
  try {
    // This is a simplified version
    // In production, you'd want to use a proper TikTok API service
    // or implement more robust scraping with puppeteer

    // For now, return a placeholder with basic info
    // You can integrate with services like:
    // - RapidAPI's TikTok API
    // - tiktok-scraper npm package
    // - Custom scraping solution

    console.warn('TikTok video info fetching needs implementation');

    return {
      platform: 'tiktok',
      videoId,
      title: 'TikTok Video', // Would be scraped
      description: '',
      thumbnail: `https://p16-sign.tiktokcdn.com/obj/${videoId}`, // Placeholder
      duration: '0:00',
      channelName: 'TikTok User',
      channelUrl: '',
      viewCount: 0,
    };
  } catch (error) {
    console.error('Error fetching TikTok video info:', error);
    throw new Error('Failed to fetch TikTok video information');
  }
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
