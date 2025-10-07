'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, TrendingUp, FileText, PlusCircle, Settings, Loader2, ExternalLink } from 'lucide-react';
import type { Review } from '@/types';

interface DashboardStats {
  totalReviews: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    totalViews: 0,
    totalClicks: 0,
    totalConversions: 0,
  });
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all reviews
      const response = await fetch('/api/reviews?limit=10');
      const data = await response.json();

      if (data.success && data.reviews) {
        const reviews = data.reviews;

        // Calculate stats
        const totalReviews = reviews.length;
        const totalViews = reviews.reduce((sum: number, r: Review) => sum + (r.views || 0), 0);
        const totalClicks = reviews.reduce((sum: number, r: Review) => sum + (r.clicks || 0), 0);
        const totalConversions = reviews.reduce((sum: number, r: Review) => sum + (r.conversions || 0), 0);

        setStats({
          totalReviews,
          totalViews,
          totalClicks,
          totalConversions,
        });

        // Get recent 5 reviews
        setRecentReviews(reviews.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng quan về reviews và hiệu suất
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Tạo Review Mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Reviews
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-gray-500 mt-1">
              Landing pages đã tạo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Lượt Xem
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalViews.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tổng lượt xem tất cả reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clicks
            </CardTitle>
            <MousePointer className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalClicks.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Clicks vào affiliate links
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Conversions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalConversions.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chuyển đổi thành công
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews Gần Đây</CardTitle>
          <Link href="/dashboard/reviews">
            <Button variant="ghost" size="sm">
              Xem tất cả
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                Chưa có review nào
              </p>
              <p className="mb-4">
                Bắt đầu tạo landing page review đầu tiên của bạn
              </p>
              <Link href="/dashboard/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo Review Ngay
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={review.video_thumbnail}
                    alt={review.video_title}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {review.custom_title || review.video_title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {review.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointer className="h-4 w-4" />
                      {review.clicks}
                    </div>
                  </div>
                  <Badge
                    variant={review.status === 'published' ? 'default' : 'secondary'}
                  >
                    {review.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                  <Link href={`/dashboard/reviews/${review.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bắt Đầu Nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/create">
              <Button variant="outline" className="w-full justify-start">
                <PlusCircle className="mr-2 h-4 w-4" />
                Tạo review từ video YouTube/TikTok
              </Button>
            </Link>
            <Link href="/dashboard/categories">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Quản lý danh mục
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Cấu hình API keys
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hướng Dẫn</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Tạo danh mục cho reviews (Xe máy, Điện gia dụng...)</li>
              <li>Nhập link video YouTube hoặc TikTok</li>
              <li>Chọn danh mục và AI tự động phân tích</li>
              <li>Chỉnh sửa và thêm affiliate links</li>
              <li>Đăng lên Facebook và chia sẻ</li>
              <li>Theo dõi views, clicks và conversions</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
