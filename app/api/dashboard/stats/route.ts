import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalReviews: number;
  totalSchedules: number;
  publishedPosts: number;
  pendingSchedules: number;
  failedPosts: number;
  reviewsToday: number;
  postsToday: number;
  averageResponseTime: number;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ActivityItem {
  id: string;
  type: 'review_created' | 'post_scheduled' | 'post_published' | 'post_failed' | 'webhook_sent';
  title: string;
  description: string;
  timestamp: Date | string;
  status?: 'success' | 'error' | 'pending' | 'processing';
  metadata?: {
    reviewId?: string;
    scheduleId?: string;
    facebookPostUrl?: string;
    errorMessage?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get basic stats
    const reviews = await db.getReviews();
    const schedules = await db.getSchedules?.() || [];
    
    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats: DashboardStats = {
      totalReviews: reviews.length,
      totalSchedules: schedules.length,
      publishedPosts: schedules.filter(s => s.status === 'posted').length,
      pendingSchedules: schedules.filter(s => s.status === 'pending').length,
      failedPosts: schedules.filter(s => s.status === 'failed').length,
      reviewsToday: reviews.filter(r => new Date(r.created_at) >= today).length,
      postsToday: schedules.filter(s => 
        s.status === 'posted' && new Date(s.posted_at || s.created_at) >= today
      ).length,
      averageResponseTime: 245, // Mock data
    };

    // Generate chart data
    const reviewsByDay: ChartData[] = [];
    const postsByDay: ChartData[] = [];
    
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const reviewsCount = reviews.filter(r => {
        const reviewDate = new Date(r.created_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      }).length;
      
      const postsCount = schedules.filter(s => {
        const postDate = new Date(s.posted_at || s.created_at);
        return s.status === 'posted' && postDate >= dayStart && postDate <= dayEnd;
      }).length;
      
      reviewsByDay.push({
        label: dayName,
        value: reviewsCount,
        color: '#3B82F6',
      });
      
      postsByDay.push({
        label: dayName,
        value: postsCount,
        color: '#10B981',
      });
    }

    // Platform distribution
    const platformStats: ChartData[] = [
      { label: 'YouTube', value: reviews.filter(r => r.video_url?.includes('youtube')).length, color: '#FF0000' },
      { label: 'TikTok', value: reviews.filter(r => r.video_url?.includes('tiktok')).length, color: '#000000' },
      { label: 'Facebook', value: reviews.filter(r => r.video_url?.includes('facebook')).length, color: '#1877F2' },
      { label: 'Khác', value: reviews.filter(r => 
        !r.video_url?.includes('youtube') && 
        !r.video_url?.includes('tiktok') && 
        !r.video_url?.includes('facebook')
      ).length, color: '#6B7280' },
    ];

    // Status distribution
    const statusStats: ChartData[] = [
      { label: 'Đã đăng', value: stats.publishedPosts, color: '#10B981' },
      { label: 'Chờ lịch', value: stats.pendingSchedules, color: '#F59E0B' },
      { label: 'Thất bại', value: stats.failedPosts, color: '#EF4444' },
      { label: 'Đang xử lý', value: schedules.filter(s => s.status === 'processing').length, color: '#3B82F6' },
    ];

    // Get real activity logs
    const activityLogs = await db.getActivityLogs();
    const activities: ActivityItem[] = activityLogs.map(log => ({
      id: log.id,
      type: log.type as ActivityItem['type'],
      title: log.title,
      description: log.description,
      timestamp: log.created_at,
      status: log.status as ActivityItem['status'],
      metadata: log.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats,
        charts: {
          reviewsByDay,
          postsByDay,
          platformStats,
          statusStats,
        },
        activities,
      },
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard statistics' 
      },
      { status: 500 }
    );
  }
}
