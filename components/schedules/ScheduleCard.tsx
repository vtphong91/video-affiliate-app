'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Trash2,
  Eye,
  Edit,
  ExternalLink,
  Calendar,
  Target,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/lib/db/supabase';

interface ScheduleWithReview extends Schedule {
  reviews: {
    id: string;
    video_title: string;
    video_thumbnail: string;
    slug: string;
  };
}

interface ScheduleCardProps {
  schedule: ScheduleWithReview;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
}

export function ScheduleCard({ schedule, onDelete, onRetry }: ScheduleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const formatScheduledTime = (timestamp: string) => {
    // GMT+7 Direct Storage - Parse database time directly
    const dbTime = timestamp; // "2025-10-09T10:45:00+00:00"
    
    // Extract date and time from database string
    const dateTimeMatch = dbTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
    if (dateTimeMatch) {
      const [, datePart, timePart] = dateTimeMatch;
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);
      
      // Create GMT+7 date object
      const scheduledGMT7 = new Date(year, month - 1, day, hour, minute, second);
      const nowGMT7 = new Date();
      
      const diffMs = scheduledGMT7.getTime() - nowGMT7.getTime();
      
      if (diffMs < 0) {
        return 'Đã quá hạn';
      }
      
      const minutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMs / 3600000);
      const days = Math.floor(diffMs / 86400000);
      
      if (minutes < 60) {
        return `${minutes} phút nữa`;
      } else if (hours < 24) {
        return `${hours} giờ nữa`;
      } else {
        return `${days} ngày nữa`;
      }
    }
    
    // Fallback if regex fails
    return 'Không xác định';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'posted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
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

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch đăng bài này?')) {
      setIsDeleting(true);
      try {
        await onDelete(schedule.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRetry = async () => {
    if (window.confirm('Bạn có chắc chắn muốn thử lại lịch đăng bài này?')) {
      await onRetry(schedule.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {schedule.reviews.video_title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(schedule.status)}
              {getStatusBadge(schedule.status)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {schedule.status === 'pending' && (
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {schedule.status === 'failed' && (
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Review thumbnail */}
        {schedule.reviews.video_thumbnail && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={schedule.reviews.video_thumbnail} 
              alt={schedule.reviews.video_title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Schedule info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {(() => {
                // GMT+7 Direct Storage - Parse database time correctly
                const dbTime = schedule.scheduled_for; // "2025-10-09T10:45:00+00:00"
                
                // Extract date and time parts from database string
                const dateTimeMatch = dbTime.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                if (dateTimeMatch) {
                  const [, datePart, timePart] = dateTimeMatch;
                  const [year, month, day] = datePart.split('-');
                  const [hour, minute] = timePart.split(':');
                  
                  // Format for display: "10:45 09/10/2025"
                  return `${hour}:${minute} ${day}/${month}/${year}`;
                }
                
                // Fallback to original parsing if regex fails
                return new Date(schedule.scheduled_for).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              })()}
            </span>
            {schedule.status === 'pending' && (
              <span className="text-yellow-600 font-medium">
                ({formatScheduledTime(schedule.scheduled_for)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {schedule.target_type === 'page' ? 'Trang' : 'Nhóm'}: {schedule.target_name || schedule.target_id}
            </span>
          </div>

          {schedule.posted_at && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">
                Đã đăng: {new Date(schedule.posted_at).toLocaleString('vi-VN')}
              </span>
            </div>
          )}

          {schedule.error_message && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              <strong>Lỗi:</strong> {schedule.error_message}
            </div>
          )}
        </div>

        {/* Post message preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span>Nội dung đăng:</span>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-20 overflow-hidden">
            {schedule.post_message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Xem chi tiết
          </Button>
          
          {schedule.facebook_post_url && (
            <Button variant="outline" size="sm" asChild>
              <a 
                href={schedule.facebook_post_url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Xem bài đăng
              </a>
            </Button>
          )}
        </div>

        {/* Retry info */}
        {schedule.status === 'failed' && schedule.retry_count > 0 && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Đã thử lại {schedule.retry_count}/{schedule.max_retries} lần
          </div>
        )}
      </CardContent>
    </Card>
  );
}
