import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  extractYouTubeVideoId,
  isValidYouTubeUrl,
  getYouTubeVideoInfo,
} from './apis/youtube';
import {
  extractTikTokVideoId,
  isValidTikTokUrl,
  getTikTokVideoInfo,
} from './apis/tiktok';
import type { VideoInfo, VideoPlatform } from '@/types';

/**
 * Tailwind CSS class merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(url: string): VideoPlatform | null {
  if (isValidYouTubeUrl(url)) return 'youtube';
  if (isValidTikTokUrl(url)) return 'tiktok';
  return null;
}

/**
 * Extract video ID from URL
 */
export function extractVideoId(url: string): string | null {
  const platform = detectVideoPlatform(url);
  if (!platform) return null;

  if (platform === 'youtube') {
    return extractYouTubeVideoId(url);
  }
  if (platform === 'tiktok') {
    return extractTikTokVideoId(url);
  }

  return null;
}

/**
 * Get video info from URL
 */
export async function getVideoInfoFromUrl(url: string): Promise<VideoInfo> {
  const platform = detectVideoPlatform(url);
  if (!platform) {
    throw new Error('Invalid video URL. Only YouTube and TikTok are supported.');
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  if (platform === 'youtube') {
    return await getYouTubeVideoInfo(videoId);
  }
  if (platform === 'tiktok') {
    return await getTikTokVideoInfo(videoId);
  }

  throw new Error('Unsupported platform');
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-+|-+$/g, '') // Trim - from start/end
    .substring(0, 100); // Limit length
}

/**
 * Generate unique slug (add number suffix if exists)
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format view count (1.5K, 2.3M, etc.)
 */
export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

/**
 * Get video embed URL
 */
export function getVideoEmbedUrl(platform: VideoPlatform, videoId: string): string {
  if (platform === 'youtube') {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (platform === 'tiktok') {
    return `https://www.tiktok.com/embed/v2/${videoId}`;
  }
  return '';
}

/**
 * Get full landing page URL
 */
export function getLandingPageUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/review/${slug}`;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Calculate reading time (approximate)
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
