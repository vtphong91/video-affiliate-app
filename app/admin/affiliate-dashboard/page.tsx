'use client';

/**
 * Affiliate Dashboard - Tổng hợp monitoring và quản lý
 * Bao gồm: Analytics, Link Management, URL Shortener, Settings
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart3,
  Link as LinkIcon,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  ExternalLink,
  RefreshCw,
  Settings as SettingsIcon
} from 'lucide-react';
import Link from 'next/link';

interface AffiliateStats {
  totalLinks: number;
  totalClicks: number;
  totalShortUrls: number;
  totalShortUrlClicks: number;
  clicksToday: number;
  conversionRate: number;
  topMerchant: string;
  topPerformingLink: string;
}

interface RecentLink {
  id: string;
  merchant_name: string;
  affiliate_url: string;
  short_url?: string;
  clicks: number;
  generation_method: string;
  created_at: string;
}

interface ShortUrlStats {
  code: string;
  original_url: string;
  clicks: number;
  created_at: string;
  merchant_name?: string;
}

export default function AffiliateDashboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [recentLinks, setRecentLinks] = useState<RecentLink[]>([]);
  const [topShortUrls, setTopShortUrls] = useState<ShortUrlStats[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load affiliate stats
      const statsResponse = await fetch('/api/admin/affiliate-settings/stats', {
        credentials: 'include'
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load recent links (sẽ implement API sau)
      setRecentLinks([]);
      setTopShortUrls([]);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Tổng hợp monitoring và quản lý hệ thống affiliate
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Link href="/admin/affiliate-settings">
            <Button variant="outline">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Cài đặt
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Affiliate Links</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats?.totalLinks || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đã tạo</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats?.totalClicks || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">+{stats?.clicksToday || 0} hôm nay</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MousePointerClick className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Short URLs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats?.totalShortUrls || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(stats?.totalShortUrlClicks || 0)} clicks
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỉ lệ chuyển đổi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(stats?.conversionRate || 0).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">CTR trung bình</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="links">Affiliate Links</TabsTrigger>
          <TabsTrigger value="short-urls">Short URLs</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        {/* Tab: Tổng quan */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Merchants */}
            <Card>
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
                <CardDescription>Merchants có nhiều clicks nhất</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.topMerchant ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{stats.topMerchant}</span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(stats.totalClicks)} clicks
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Links */}
            <Card>
              <CardHeader>
                <CardTitle>Links mới nhất</CardTitle>
                <CardDescription>10 affiliate links gần đây</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLinks.length > 0 ? (
                  <div className="space-y-3">
                    {recentLinks.slice(0, 5).map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{link.merchant_name}</p>
                          <p className="text-xs text-gray-500 truncate">{link.affiliate_url}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-semibold">{link.clicks} clicks</p>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {link.generation_method}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Chưa có affiliate links</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất 7 ngày qua</CardTitle>
              <CardDescription>Clicks và conversions theo ngày</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Biểu đồ sẽ được hiển thị sau khi có dữ liệu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Affiliate Links */}
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý Affiliate Links</CardTitle>
                  <CardDescription>
                    Danh sách tất cả affiliate tracking links đã tạo
                  </CardDescription>
                </div>
                <Link href="/admin/affiliate-settings?tab=test-link">
                  <Button>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Tạo Link Mới
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <LinkIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Chức năng quản lý affiliate links đang được phát triển</p>
                <p className="text-sm mt-2">
                  Hiện tại bạn có thể tạo links tại tab &quot;Test Link&quot; trong Affiliate Settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Short URLs */}
        <TabsContent value="short-urls">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý Short URLs</CardTitle>
                  <CardDescription>
                    Danh sách URL rút gọn và thống kê clicks
                  </CardDescription>
                </div>
                <Link href="/admin/affiliate-settings?tab=short-urls">
                  <Button>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Tạo Short URL
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Chức năng quản lý short URLs đang được phát triển</p>
                <p className="text-sm mt-2">
                  Vui lòng sử dụng tab &quot;Short URLs&quot; trong Affiliate Settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích chi tiết</CardTitle>
              <CardDescription>
                Báo cáo và thống kê về hiệu suất affiliate links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Clicks hôm nay</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {formatNumber(stats?.clicksToday || 0)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Tổng clicks</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatNumber(stats?.totalClicks || 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">CTR trung bình</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {(stats?.conversionRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="text-center py-12 text-gray-500 border-t">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Analytics nâng cao đang được phát triển</p>
                <p className="text-sm mt-2">
                  Sẽ bao gồm: Biểu đồ theo thời gian, phân tích theo merchants, device tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
