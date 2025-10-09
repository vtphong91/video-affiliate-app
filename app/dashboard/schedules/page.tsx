'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CreateScheduleDialog } from '@/components/schedules/CreateScheduleDialog';
import { ScheduleStats } from '@/components/schedules/ScheduleStats';
import type { Schedule } from '@/lib/db/supabase';

interface ScheduleWithReview extends Schedule {
  reviews: {
    id: string;
    video_title: string;
    video_thumbnail: string;
    slug: string;
  };
}

interface ScheduleStats {
  total: number;
  pending: number;
  posted: number;
  failed: number;
  processing: number;
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleWithReview[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
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
  const { toast } = useToast();

  useEffect(() => {
    fetchSchedules();
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews');
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/schedules-get'); // Use working API
      const result = await response.json();
      
      if (result.success) {
        setSchedules(result.data.schedules);
        calculateStats(result.data.schedules);
      } else {
        setError(result.error || 'Failed to fetch schedules');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Schedules fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (schedulesData: ScheduleWithReview[]) => {
    const newStats = {
      total: schedulesData.length,
      pending: schedulesData.filter(s => s.status === 'pending').length,
      posted: schedulesData.filter(s => s.status === 'posted').length,
      failed: schedulesData.filter(s => s.status === 'failed').length,
      processing: schedulesData.filter(s => s.status === 'processing').length,
    };
    setStats(newStats);
  };

  const handleCreateSchedule = async (scheduleData: any) => {
    // This function is no longer called since CreateScheduleDialog handles API call directly
    // Just refresh the schedules list
    console.log('📋 Refreshing schedules list...');
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Thành công!',
          description: 'Lịch đăng bài đã được xóa',
        });
        fetchSchedules(); // Refresh the list
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
  };

  const handleRetrySchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}/retry`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Thành công!',
          description: 'Lịch đăng bài đã được đưa vào hàng đợi thử lại',
        });
        fetchSchedules(); // Refresh the list
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
  };

  const getFilteredSchedules = () => {
    if (activeTab === 'all') return schedules;
    return schedules.filter(schedule => schedule.status === activeTab);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Chờ đăng', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
      posted: { label: 'Đã đăng', className: 'bg-green-100 text-green-800' },
      failed: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

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
              onClick={fetchSchedules}
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
              <p className="text-gray-600 mt-2">Quản lý lịch đăng bài tự động</p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo Lịch Mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <ScheduleStats stats={stats} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-6">
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
              {getFilteredSchedules().length === 0 ? (
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
                getFilteredSchedules().map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onDelete={handleDeleteSchedule}
                    onRetry={handleRetrySchedule}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Schedule Dialog */}
        <CreateScheduleDialog
          open={showCreateDialog}
          onOpenChange={(open) => {
            setShowCreateDialog(open);
            if (!open) {
              // Refresh schedules when dialog closes
              fetchSchedules();
            }
          }}
          onSubmit={handleCreateSchedule}
          reviews={reviews}
        />
      </div>
    </div>
  );
}
