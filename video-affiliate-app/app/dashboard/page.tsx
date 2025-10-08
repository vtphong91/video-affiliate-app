'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Chart } from '@/components/dashboard/Chart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  Zap
} from 'lucide-react';

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

interface DashboardData {
  stats: DashboardStats;
  charts: {
    reviewsByDay: ChartData[];
    postsByDay: ChartData[];
    platformStats: ChartData[];
    statusStats: ChartData[];
  };
  activities: ActivityItem[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Tổng quan hệ thống Video Affiliate App</p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Tổng quan hệ thống Video Affiliate App</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng Reviews"
            value={data.stats.totalReviews}
            change={{ value: 12, type: 'increase' }}
            icon={FileText}
            description="Tổng số reviews đã tạo"
          />
          <StatsCard
            title="Lịch Đăng Bài"
            value={data.stats.totalSchedules}
            change={{ value: 8, type: 'increase' }}
            icon={Calendar}
            description="Số lịch đã lên"
          />
          <StatsCard
            title="Đã Đăng"
            value={data.stats.publishedPosts}
            change={{ value: 5, type: 'increase' }}
            icon={CheckCircle}
            description="Bài đã đăng thành công"
          />
          <StatsCard
            title="Chờ Đăng"
            value={data.stats.pendingSchedules}
            change={{ value: -2, type: 'decrease' }}
            icon={Clock}
            description="Đang chờ lịch đăng"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Chart
            title="Reviews theo ngày (7 ngày qua)"
            data={data.charts.reviewsByDay}
            type="bar"
            height={300}
          />
          <Chart
            title="Bài đăng theo ngày (7 ngày qua)"
            data={data.charts.postsByDay}
            type="line"
            height={300}
          />
        </div>

        {/* Platform & Status Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Chart
            title="Phân bố theo Platform"
            data={data.charts.platformStats}
            type="doughnut"
            height={300}
          />
          <Chart
            title="Trạng thái đăng bài"
            data={data.charts.statusStats}
            type="doughnut"
            height={300}
          />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity 
            activities={data.activities}
            className="lg:col-span-2"
          />
          <div className="space-y-6">
            <QuickActions />
            <SystemStatus />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Reviews Hôm Nay"
            value={data.stats.reviewsToday}
            icon={TrendingUp}
            description="Reviews được tạo hôm nay"
            className="bg-gradient-to-r from-blue-50 to-blue-100"
          />
          <StatsCard
            title="Bài Đăng Hôm Nay"
            value={data.stats.postsToday}
            icon={Users}
            description="Bài đã đăng hôm nay"
            className="bg-gradient-to-r from-green-50 to-green-100"
          />
          <StatsCard
            title="Thời Gian Phản Hồi TB"
            value={`${data.stats.averageResponseTime}ms`}
            icon={Zap}
            description="Thời gian phản hồi trung bình"
            className="bg-gradient-to-r from-purple-50 to-purple-100"
          />
        </div>
      </div>
    </div>
  );
}