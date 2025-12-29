'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Link as LinkIcon,
  ExternalLink,
  Copy,
  Search,
  Filter,
  TrendingUp,
  MousePointerClick,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface AffiliateLinkHistory {
  id: string;
  reviewId: string;
  reviewTitle: string;
  reviewSlug: string;
  merchantId: string | null;
  merchantName: string;
  originalUrl: string;
  trackingUrl: string;
  shortUrl: string | null;
  generationMethod: string;
  affSid: string | null;
  clicks: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalLinks: number;
  totalClicks: number;
  totalReviews: number;
  avgClicksPerLink: number;
}

interface Merchant {
  id: string;
  name: string;
  domain: string;
}

export default function AffiliateLinksPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<AffiliateLinkHistory[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    totalClicks: 0,
    totalReviews: 0,
    avgClicksPerLink: 0,
  });

  // Filters
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadMerchants();
    loadLinks();
  }, [page, selectedMerchant]);

  const loadMerchants = async () => {
    try {
      const response = await fetch('/api/merchants');
      const data = await response.json();
      if (data.success) {
        setMerchants(data.data || []);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
    }
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (selectedMerchant !== 'all') {
        params.append('merchantId', selectedMerchant);
      }

      const response = await fetch(`/api/affiliate-links/history?${params}`);
      const data = await response.json();

      if (data.success) {
        setLinks(data.data.links);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        // Show empty state instead of error toast
        setLinks([]);
        setStats({
          totalLinks: 0,
          totalClicks: 0,
          totalReviews: 0,
          avgClicksPerLink: 0,
        });
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Error loading links:', error);
      // Show empty state instead of error toast
      setLinks([]);
      setStats({
        totalLinks: 0,
        totalClicks: 0,
        totalReviews: 0,
        avgClicksPerLink: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép!',
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  // Filter links by search query
  const filteredLinks = links.filter((link) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.reviewTitle.toLowerCase().includes(query) ||
      link.merchantName.toLowerCase().includes(query) ||
      link.originalUrl.toLowerCase().includes(query) ||
      link.trackingUrl.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Affiliate Links</h1>
        <p className="text-gray-600 mt-1">
          Xem lịch sử và thống kê tất cả affiliate links đã tạo
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalLinks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalClicks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">{stats.totalReviews}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Trung Bình Clicks/Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold">{stats.avgClicksPerLink}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ Lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tên review, merchant, URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Merchant Filter */}
            <div className="space-y-2">
              <Label>Merchant</Label>
              <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả merchants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả merchants</SelectItem>
                  {merchants.map((merchant) => (
                    <SelectItem key={merchant.id} value={merchant.id}>
                      {merchant.name} ({merchant.domain})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={() => loadLinks()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Affiliate Links ({filteredLinks.length})</CardTitle>
          <CardDescription>
            Danh sách tất cả affiliate links đã tạo từ reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-16">
              <LinkIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Chưa có affiliate links
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Bạn chưa tạo affiliate links nào. Hãy tạo review và thêm affiliate links để bắt đầu tracking.
              </p>
              <Link href="/dashboard/create">
                <Button>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Tạo Review Mới
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Review</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Link Gốc</TableHead>
                    <TableHead>Link Affiliate</TableHead>
                    <TableHead className="text-center">Method</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      {/* Review */}
                      <TableCell>
                        <Link
                          href={`/dashboard/reviews/${link.reviewId}/edit`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {link.reviewTitle}
                        </Link>
                      </TableCell>

                      {/* Merchant */}
                      <TableCell>
                        <Badge variant="secondary">{link.merchantName}</Badge>
                      </TableCell>

                      {/* Original URL */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 max-w-[200px] truncate">
                            {truncateUrl(link.originalUrl, 40)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(link.originalUrl, 'Link gốc')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>

                      {/* Tracking URL */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-green-700 max-w-[200px] truncate">
                            {link.shortUrl || truncateUrl(link.trackingUrl, 40)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(
                                link.shortUrl || link.trackingUrl,
                                'Link affiliate'
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <a
                            href={link.shortUrl || link.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="ghost">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>

                      {/* Generation Method */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            link.generationMethod === 'api' ? 'default' : 'outline'
                          }
                        >
                          {link.generationMethod.toUpperCase()}
                        </Badge>
                      </TableCell>

                      {/* Clicks */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MousePointerClick className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{link.clicks}</span>
                        </div>
                      </TableCell>

                      {/* Created Date */}
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDate(link.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <Link href={`/review/${link.reviewSlug}`} target="_blank">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Xem
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
