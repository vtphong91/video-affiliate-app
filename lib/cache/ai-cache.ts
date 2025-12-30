/**
 * AI Analysis Cache
 *
 * Caches AI video analysis results to avoid repeated expensive API calls
 * TTL: 30 days (configurable)
 * Storage: Supabase ai_analysis_cache table
 */
// @ts-nocheck
import { supabaseAdmin } from '@/lib/db/supabase';
import type { AIAnalysis } from '@/types';

const CACHE_TTL_DAYS = 30; // 30 days cache

interface CacheEntry {
  id: string;
  video_id: string;
  video_platform: string;
  analysis: AIAnalysis;
  created_at: string;
  updated_at: string;
  hit_count: number;
  last_accessed_at: string;
}

interface CacheStats {
  totalEntries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageAge: number;
}

/**
 * Get cached AI analysis for a video
 * Returns null if not found or expired
 */
export async function getCachedAnalysis(
  videoId: string,
  platform: string = 'youtube'
): Promise<AIAnalysis | null> {
  try {
    console.log(`🔍 AI Cache: Checking cache for ${platform}:${videoId}`);

    const { data, error } = await supabaseAdmin
      .from('ai_analysis_cache')
      .select('*')
      .eq('video_id', videoId)
      .eq('video_platform', platform)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - normal case
        console.log('❌ AI Cache: MISS - not found');
        return null;
      }
      console.error('❌ AI Cache: Error fetching from cache:', error);
      return null;
    }

    if (!data) {
      console.log('❌ AI Cache: MISS - no data');
      return null;
    }

    // Check if expired
    const createdAt = new Date(data.created_at);
    const age = Date.now() - createdAt.getTime();
    const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

    if (age > maxAge) {
      console.log(`⚠️ AI Cache: EXPIRED (${Math.floor(age / (24 * 60 * 60 * 1000))} days old)`);

      // Delete expired entry
      await supabaseAdmin
        .from('ai_analysis_cache')
        .delete()
        .eq('video_id', videoId)
        .eq('video_platform', platform);

      return null;
    }

    // Update hit count and last accessed
    await supabaseAdmin
      .from('ai_analysis_cache')
      .update({
        hit_count: (data.hit_count || 0) + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('video_id', videoId)
      .eq('video_platform', platform);

    console.log(`✅ AI Cache: HIT (${data.hit_count + 1} hits, ${Math.floor(age / (24 * 60 * 60 * 1000))} days old)`);
    return data.analysis as AIAnalysis;

  } catch (error) {
    console.error('❌ AI Cache: Exception in getCachedAnalysis:', error);
    return null;
  }
}

/**
 * Set/update cached AI analysis for a video
 */
export async function setCachedAnalysis(
  videoId: string,
  analysis: AIAnalysis,
  platform: string = 'youtube'
): Promise<boolean> {
  try {
    console.log(`💾 AI Cache: Saving cache for ${platform}:${videoId}`);

    const { error } = await supabaseAdmin
      .from('ai_analysis_cache')
      .upsert({
        video_id: videoId,
        video_platform: platform,
        analysis,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hit_count: 0,
        last_accessed_at: new Date().toISOString()
      }, {
        onConflict: 'video_id,video_platform'
      });

    if (error) {
      console.error('❌ AI Cache: Error saving to cache:', error);
      return false;
    }

    console.log('✅ AI Cache: Saved successfully');
    return true;

  } catch (error) {
    console.error('❌ AI Cache: Exception in setCachedAnalysis:', error);
    return false;
  }
}

/**
 * Invalidate (delete) cached analysis for a video
 */
export async function invalidateCachedAnalysis(
  videoId: string,
  platform: string = 'youtube'
): Promise<boolean> {
  try {
    console.log(`🗑️ AI Cache: Invalidating cache for ${platform}:${videoId}`);

    const { error } = await supabaseAdmin
      .from('ai_analysis_cache')
      .delete()
      .eq('video_id', videoId)
      .eq('video_platform', platform);

    if (error) {
      console.error('❌ AI Cache: Error deleting from cache:', error);
      return false;
    }

    console.log('✅ AI Cache: Invalidated successfully');
    return true;

  } catch (error) {
    console.error('❌ AI Cache: Exception in invalidateCachedAnalysis:', error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStats | null> {
  try {
    // Get total entries
    const { count: totalEntries } = await supabaseAdmin
      .from('ai_analysis_cache')
      .select('*', { count: 'exact', head: true });

    // Get total hit count
    const { data: hitData } = await supabaseAdmin
      .from('ai_analysis_cache')
      .select('hit_count');

    const cacheHits = hitData?.reduce((sum, entry) => sum + (entry.hit_count || 0), 0) || 0;

    // Estimate cache misses (entries with 0 hits are cache misses that were then cached)
    const cacheMisses = hitData?.filter(entry => entry.hit_count === 0).length || 0;

    const hitRate = cacheHits + cacheMisses > 0
      ? (cacheHits / (cacheHits + cacheMisses)) * 100
      : 0;

    // Get average age
    const { data: ageData } = await supabaseAdmin
      .from('ai_analysis_cache')
      .select('created_at');

    const averageAge = ageData && ageData.length > 0
      ? ageData.reduce((sum, entry) => {
          const age = Date.now() - new Date(entry.created_at).getTime();
          return sum + age;
        }, 0) / ageData.length / (24 * 60 * 60 * 1000) // Convert to days
      : 0;

    return {
      totalEntries: totalEntries || 0,
      cacheHits,
      cacheMisses,
      hitRate: Math.round(hitRate * 10) / 10, // Round to 1 decimal
      averageAge: Math.round(averageAge * 10) / 10
    };

  } catch (error) {
    console.error('❌ AI Cache: Error getting stats:', error);
    return null;
  }
}

/**
 * Clean old cache entries (older than TTL)
 */
export async function cleanOldCache(daysOld: number = CACHE_TTL_DAYS): Promise<number> {
  try {
    console.log(`🧹 AI Cache: Cleaning entries older than ${daysOld} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabaseAdmin
      .from('ai_analysis_cache')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('❌ AI Cache: Error cleaning cache:', error);
      return 0;
    }

    const deletedCount = data?.length || 0;
    console.log(`✅ AI Cache: Cleaned ${deletedCount} old entries`);
    return deletedCount;

  } catch (error) {
    console.error('❌ AI Cache: Exception in cleanOldCache:', error);
    return 0;
  }
}

/**
 * Preload cache for popular videos
 * (Can be called via cron job)
 */
export async function preloadPopularVideos(
  videoIds: Array<{ id: string; platform: string }>
): Promise<number> {
  try {
    console.log(`🔄 AI Cache: Preloading ${videoIds.length} videos`);
    let preloadedCount = 0;

    for (const { id, platform } of videoIds) {
      const cached = await getCachedAnalysis(id, platform);
      if (!cached) {
        // Video not cached - would need to analyze and cache here
        // This is just a placeholder for future implementation
        preloadedCount++;
      }
    }

    return preloadedCount;

  } catch (error) {
    console.error('❌ AI Cache: Error preloading videos:', error);
    return 0;
  }
}
