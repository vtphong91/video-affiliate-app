'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/db/supabase';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  Zap,
  Activity,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalReviews: number;
  totalSchedules: number;
  publishedPosts: number;
  pendingSchedules: number;
  failedPosts: number;
  reviewsToday: number;
  postsToday: number;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'error' | 'pending' | 'processing';
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

      // ✅ FIX: Get authentication headers from Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authentication headers if session exists
      if (session?.user) {
        headers['x-user-id'] = session.user.id;
        headers['x-user-email'] = session.user.email || '';
        const userRole = session.user.user_metadata?.role || 'user';
        headers['x-user-role'] = userRole;
        console.log('🔍 Dashboard: Sending auth headers:', {
          userId: session.user.id,
          email: session.user.email,
          role: userRole
        });
      } else {
        console.log('⚠️ Dashboard: No session found, request may fail');
      }

      const response = await fetch('/api/dashboard/stats', { headers });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Không thể tải dữ liệu dashboard');
        console.error('❌ Dashboard API error:', result.error);
      }
    } catch (err) {
      setError('Lỗi kết nối đến server');
      console.error('❌ Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_created':
        return <FileText className="w-4 h-4" />;
      case 'post_scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'post_published':
        return <CheckCircle className="w-4 h-4" />;
      case 'post_failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Không thể tải dữ liệu'}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VideoAffiliate</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/reviews" className="text-gray-600 hover:text-blue-600">
                Reviews
              </Link>
              <Link href="/dashboard/schedules" className="text-gray-600 hover:text-blue-600">
                Lịch đăng
              </Link>
              <Link href="/dashboard/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Tạo mới
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Tổng quan về hoạt động Video Affiliate của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalReviews}</p>
                <p className="text-xs text-gray-500 mt-1">+{data.stats.reviewsToday} hôm nay</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã đăng</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.publishedPosts}</p>
                <p className="text-xs text-gray-500 mt-1">+{data.stats.postsToday} hôm nay</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chờ đăng</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.pendingSchedules}</p>
                <p className="text-xs text-gray-500 mt-1">Lịch pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Thất bại</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.failedPosts}</p>
                <p className="text-xs text-gray-500 mt-1">Cần retry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Reviews by Day Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Reviews 7 ngày qua</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {data.charts.reviewsByDay.map((item, index) => {
                const maxValue = Math.max(...data.charts.reviewsByDay.map(d => d.value), 1);
                const percentage = (item.value / maxValue) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Posts by Day Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Bài đăng 7 ngày qua</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {data.charts.postsByDay.map((item, index) => {
                const maxValue = Math.max(...data.charts.postsByDay.map(d => d.value), 1);
                const percentage = (item.value / maxValue) * 100;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Phân phối Platform</h2>
            <div className="space-y-3">
              {data.charts.platformStats.filter(p => p.value > 0).map((platform, index) => {
                const total = data.charts.platformStats.reduce((sum, p) => sum + p.value, 0);
                const percentage = total > 0 ? (platform.value / total) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: platform.color }}
                        ></div>
                        <span className="text-gray-600">{platform.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{platform.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: platform.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {data.charts.platformStats.every(p => p.value === 0) && (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trạng thái lịch đăng</h2>
            <div className="space-y-3">
              {data.charts.statusStats.filter(s => s.value > 0).map((status, index) => {
                const total = data.stats.totalSchedules;
                const percentage = total > 0 ? (status.value / total) * 100 : 0;

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="text-gray-600">{status.label}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{status.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: status.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {data.stats.totalSchedules === 0 && (
                <p className="text-gray-500 text-center py-4">Chưa có lịch đăng nào</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h2>
          {data.activities && data.activities.length > 0 ? (
            <div className="space-y-4">
              {data.activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-b-0">
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có hoạt động nào</p>
              <p className="text-sm text-gray-400 mt-2">Tạo review đầu tiên để bắt đầu!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
