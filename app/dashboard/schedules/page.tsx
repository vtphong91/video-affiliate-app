'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { supabase } from '@/lib/db/supabase';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ScheduleCard } from '@/components/schedules/ScheduleCard';
import { ScheduleStats } from '@/components/schedules/ScheduleStats';
import { cachedFetch, invalidateCache } from '@/lib/utils/request-cache';
import { useAuthHeaders } from '@/lib/hooks/useAuthHeaders';

// ✅ Lazy load heavy dialog components
const CreateScheduleDialog = lazy(() => import('@/components/schedules/CreateScheduleDialog').then(mod => ({ default: mod.CreateScheduleDialog })));
const EditScheduleDialog = lazy(() => import('@/components/schedules/EditScheduleDialog').then(mod => ({ default: mod.EditScheduleDialog })));
const ViewScheduleDialog = lazy(() => import('@/components/schedules/ViewScheduleDialog').then(mod => ({ default: mod.ViewScheduleDialog })));

type ScheduleWithReview = any & {
  video_title?: string;
  video_thumbnail?: string;
  video_url?: string;
  channel_name?: string;
  review_summary?: string;
  review_pros?: any[];
  review_cons?: any[];
  review_key_points?: any[];
  review_target_audience?: any[];
  review_cta?: string;
  review_seo_keywords?: any[];
}

interface ScheduleStatsType {
  total: number;
  pending: number;
  posted: number;
  failed: number;
  processing: number;
}

export default function SchedulesPage() {
  const headers = useAuthHeaders();
  const [schedules, setSchedules] = useState<ScheduleWithReview[]>([]);
  const [stats, setStats] = useState<ScheduleStatsType>({
    total: 0,
    pending: 0,
    posted: 0,
    failed: 0,
    processing: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleWithReview | null>(null);
  const [viewingSchedule, setViewingSchedule] = useState<ScheduleWithReview | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const { toast } = useToast();

  // Auto refresh state - Increased to 5 minutes for better performance
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes default

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  // ✅ Memoized fetch function with caching
  const fetchSchedules = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setIsAutoRefreshing(true);
      }

      const statusParam = activeTab === 'all' ? '' : `&status=${activeTab}`;

      // ✅ Use cachedFetch with 30 second TTL
      const result = await cachedFetch(
        `/api/schedules?page=${currentPage}&limit=${itemsPerPage}${statusParam}`,
        {
          headers,
          ttl: 30000, // 30 seconds cache
          force: isAutoRefresh, // Force refresh on manual/auto refresh
        }
      );

      if (result.success) {
        setSchedules(result.data.schedules);
        setTotalPages(result.data.totalPages || 1);
        setTotalItems(result.data.total || 0);

        // ✅ Use stats from API response instead of calculating locally
        if (result.data.stats) {
          setStats(result.data.stats);
          console.log('📊 Stats from API:', result.data.stats);
        } else {
          // Fallback: calculate from current page schedules (old behavior)
          calculateStats(result.data.schedules);
        }

        setError(null);
      } else {
        setError(result.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Schedules fetch error:', err);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      } else {
        setIsAutoRefreshing(false);
      }
    }
  }, [currentPage, activeTab, headers, itemsPerPage]);

  useEffect(() => {
    // Only fetch if headers are ready
    if (headers['x-user-id']) {
      fetchSchedules();
    }
  }, [fetchSchedules, headers]);

  // ✅ Optimized auto refresh - Only when tab is visible AND enabled
  useEffect(() => {
    if (!autoRefreshEnabled || !headers['x-user-id']) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Auto refreshing schedules...');
        setIsAutoRefreshing(true);
        fetchSchedules(true).finally(() => {
          setIsAutoRefreshing(false);
          setLastRefreshTime(new Date());
        });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, refreshInterval, fetchSchedules, headers]);

  // ✅ Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled && headers['x-user-id']) {
        console.log('👁️ Tab visible, refreshing schedules...');
        setIsAutoRefreshing(true);
        fetchSchedules(true).finally(() => {
          setIsAutoRefreshing(false);
          setLastRefreshTime(new Date());
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefreshEnabled, fetchSchedules, headers]);

  // ✅ Manual refresh function
  const handleManualRefresh = useCallback(async () => {
    setIsAutoRefreshing(true);
    try {
      // Invalidate cache for this page
      invalidateCache(/\/api\/schedules/);
      await fetchSchedules(true);
      setLastRefreshTime(new Date());
      toast({
        title: '✅ Đã cập nhật',
        description: 'Danh sách lịch đăng bài đã được cập nhật',
      });
    } catch (error) {
      console.error('Manual refresh error:', error);
      toast({
        title: '❌ Lỗi cập nhật',
        description: 'Không thể cập nhật danh sách lịch đăng bài',
        variant: 'destructive',
      });
    } finally {
      setIsAutoRefreshing(false);
    }
  }, [fetchSchedules, toast]);

  const calculateStats = useCallback((schedulesData: ScheduleWithReview[]) => {
    const newStats = {
      total: schedulesData.length,
      pending: schedulesData.filter(s => s.status === 'pending').length,
      posted: schedulesData.filter(s => s.status === 'posted').length,
      failed: schedulesData.filter(s => s.status === 'failed').length,
      processing: schedulesData.filter(s => s.status === 'processing').length,
    };
    setStats(newStats);
  }, []);

  const handleCreateSchedule = useCallback(async (scheduleData: any) => {
    console.log('📋 Refreshing schedules list...');
    // Invalidate cache and refresh
    invalidateCache(/\/api\/schedules/);
    fetchSchedules(true);
  }, [fetchSchedules]);

  const handleDeleteSchedule = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Thành công!',
          description: 'Lịch đăng bài đã được xóa',
        });
        // Invalidate cache and refresh
        invalidateCache(/\/api\/schedules/);
        fetchSchedules(true);
      } else {
        throw new Error(result.error || 'Failed to delete schedule');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa lịch đăng bài',
        variant: 'destructive',
      });
    }
  }, [headers, toast, fetchSchedules]);

  const handleRetrySchedule = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}/retry`, {
        method: 'POST',
        headers,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Thành công!',
          description: 'Lịch đăng bài đã được đưa vào hàng đợi thử lại',
        });
        // Invalidate cache and refresh
        invalidateCache(/\/api\/schedules/);
        fetchSchedules(true);
      } else {
        throw new Error(result.error || 'Failed to retry schedule');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể thử lại lịch đăng bài',
        variant: 'destructive',
      });
    }
  }, [headers, toast, fetchSchedules]);

  const handleEditSchedule = useCallback((schedule: ScheduleWithReview) => {
    setEditingSchedule(schedule);
    setShowEditDialog(true);
  }, []);

  const handleViewSchedule = useCallback((schedule: ScheduleWithReview) => {
    setViewingSchedule(schedule);
    setShowViewDialog(true);
  }, []);

  const handleUpdateSchedule = useCallback(async (scheduleId: string, newScheduledFor: string) => {
    try {
      console.log('🔄 Starting schedule update:', { scheduleId, newScheduledFor });

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          scheduled_for: newScheduledFor,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '✅ Cập nhật thành công',
          description: 'Thời gian đăng bài đã được cập nhật thành công!',
        });

        setShowEditDialog(false);
        setEditingSchedule(null);

        // Invalidate cache and refresh
        invalidateCache(/\/api\/schedules/);
        setTimeout(() => fetchSchedules(true), 500);

        return true;
      } else {
        toast({
          title: '❌ Lỗi cập nhật',
          description: result.error || 'Không thể cập nhật lịch đăng bài',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      toast({
        title: '❌ Lỗi',
        description: error instanceof Error ? error.message : 'Không thể cập nhật lịch đăng bài',
        variant: 'destructive',
      });
      return false;
    }
  }, [headers, toast, fetchSchedules]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Lịch Đăng Bài</h1>
            <p className="text-gray-600 mt-2">Quản lý lịch đăng bài tự động</p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <Button
              onClick={() => fetchSchedules(true)}
              className="mt-4"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch Đăng Bài</h1>
              <p className="text-gray-600 mt-2">
                Quản lý lịch đăng bài tự động
                {isAutoRefreshing && (
                  <span className="ml-2 text-blue-600 text-sm inline-flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Đang cập nhật...
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto Refresh Controls */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={autoRefreshEnabled}
                    onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                    className="rounded"
                  />
                  Auto refresh
                </label>
                <select
                  value={refreshInterval / (60 * 1000)}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 60 * 1000)}
                  className="px-2 py-1 border rounded text-xs"
                  disabled={!autoRefreshEnabled}
                >
                  <option value={3}>3 phút</option>
                  <option value={5}>5 phút</option>
                  <option value={10}>10 phút</option>
                  <option value={15}>15 phút</option>
                </select>
                <span className="text-xs text-gray-500">
                  Cập nhật lần cuối: {lastRefreshTime.toLocaleTimeString('vi-VN')}
                </span>
              </div>

              <Button
                onClick={handleManualRefresh}
                variant="outline"
                className="flex items-center gap-2"
                disabled={loading || isAutoRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${(loading || isAutoRefreshing) ? 'animate-spin' : ''}`} />
                {loading ? 'Đang tải...' : isAutoRefreshing ? 'Đang cập nhật...' : 'Làm mới'}
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tạo Lịch Mới
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <ScheduleStats stats={stats} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tất cả ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Chờ đăng ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="processing" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Đang xử lý ({stats.processing})
            </TabsTrigger>
            <TabsTrigger value="posted" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Đã đăng ({stats.posted})
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Thất bại ({stats.failed})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schedules.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'all' ? 'Chưa có lịch đăng bài nào' : `Không có lịch ${activeTab}`}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'all'
                      ? 'Tạo lịch đăng bài đầu tiên để bắt đầu tự động hóa'
                      : `Không có lịch đăng bài nào ở trạng thái ${activeTab}`
                    }
                  </p>
                  {activeTab === 'all' && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo Lịch Đầu Tiên
                    </Button>
                  )}
                </div>
              ) : (
                schedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={handleDeleteSchedule}
                    onRetry={handleRetrySchedule}
                    onEdit={handleEditSchedule}
                    onView={handleViewSchedule}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {schedules.length > 0 && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              showInfo={true}
            />
          </div>
        )}

        {/* ✅ Lazy loaded dialogs - Only render when needed */}
        {showCreateDialog && (
          <Suspense fallback={<div>Loading...</div>}>
            <CreateScheduleDialog
              open={showCreateDialog}
              onOpenChange={(open) => {
                setShowCreateDialog(open);
                if (!open) {
                  invalidateCache(/\/api\/schedules/);
                  fetchSchedules(true);
                }
              }}
              onSubmit={handleCreateSchedule}
            />
          </Suspense>
        )}

        {showEditDialog && (
          <Suspense fallback={<div>Loading...</div>}>
            <EditScheduleDialog
              isOpen={showEditDialog}
              onClose={() => {
                setShowEditDialog(false);
                setEditingSchedule(null);
              }}
              schedule={editingSchedule}
              onUpdate={handleUpdateSchedule}
            />
          </Suspense>
        )}

        {showViewDialog && (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewScheduleDialog
              isOpen={showViewDialog}
              onClose={() => {
                setShowViewDialog(false);
                setViewingSchedule(null);
              }}
              schedule={viewingSchedule}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
