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
import { calculateTimeRemaining, formatTimestampForDisplay } from '@/lib/utils/timezone-utils';
import { cn } from '@/lib/utils';
import type { Schedule } from '@/types';

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
  onEdit: (schedule: ScheduleWithReview) => void;
  onViewDetails?: (scheduleId: string) => void;
}

export function ScheduleCard({ schedule, onDelete, onRetry, onEdit, onViewDetails }: ScheduleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Debug logging for affiliate_links
  console.log('🔍 ScheduleCard affiliate_links debug:', {
    scheduleId: schedule.id,
    videoTitle: schedule.video_title,
    hasAffiliateLinks: !!schedule.affiliate_links,
    affiliateLinksType: typeof schedule.affiliate_links,
    affiliateLinksLength: Array.isArray(schedule.affiliate_links) ? schedule.affiliate_links.length : 'not array',
    affiliateLinks: schedule.affiliate_links
  });

  const formatScheduledTime = (timestamp: string, status: string) => {
    // Nếu đã đăng hoặc thất bại, không hiển thị countdown
    if (status === 'posted' || status === 'failed') {
      return null;
    }
    
    // Sử dụng utility function để tính thời gian còn lại
    const timeRemaining = calculateTimeRemaining(timestamp);
    
    if (timeRemaining.isOverdue) {
      return `Quá hạn ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    } else {
      return `Còn ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`;
    }
  };

  const formatDateTime = (timestamp: string, status: string) => {
    console.log('🔍 formatDateTime - Input timestamp:', timestamp);

    // ✅ FIX: Use timezone utility function để convert UTC từ database sang GMT+7
    const formatted = formatTimestampForDisplay(timestamp, 'dd/MM/yyyy - HH:mm');
    console.log('🔍 Formatted GMT+7 time:', formatted);

    return formatted;
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
      pending: { 
        label: 'Chờ đăng', 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="h-3 w-3" />
      },
      processing: { 
        label: 'Đang xử lý', 
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <RefreshCw className="h-3 w-3 animate-spin" />
      },
      posted: { 
        label: 'Đã đăng', 
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      failed: { 
        label: 'Thất bại', 
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="h-3 w-3" />
      },
      cancelled: { 
        label: 'Đã hủy', 
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <XCircle className="h-3 w-3" />
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`text-xs border ${config.className} flex items-center gap-1`}>
        {config.icon}
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
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 border-l-4",
      schedule.status === 'posted' && "border-l-green-500 bg-green-50/30",
      schedule.status === 'failed' && "border-l-red-500 bg-red-50/30",
      schedule.status === 'pending' && "border-l-yellow-500 bg-yellow-50/30",
      schedule.status === 'processing' && "border-l-blue-500 bg-blue-50/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {schedule.video_title || schedule.reviews?.video_title || 'Không có tiêu đề'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getStatusIcon(schedule.status)}
              {getStatusBadge(schedule.status)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {schedule.status === 'pending' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onEdit(schedule)}
                title="Sửa thời gian đăng bài"
              >
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
        {schedule.video_thumbnail && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={schedule.video_thumbnail} 
              alt={schedule.video_title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Schedule info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className={cn(
              "font-medium",
              schedule.status === 'posted' && "text-green-600",
              schedule.status === 'failed' && "text-red-600",
              schedule.status === 'pending' && "text-gray-600",
              schedule.status === 'processing' && "text-blue-600"
            )}>
              {formatDateTime(schedule.scheduled_for, schedule.status)}
            </span>
            {formatScheduledTime(schedule.scheduled_for, schedule.status) && (() => {
              const timeRemaining = calculateTimeRemaining(schedule.scheduled_for);
              return (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  schedule.status === 'pending' && timeRemaining.isOverdue && "bg-red-100 text-red-800",
                  schedule.status === 'pending' && !timeRemaining.isOverdue && "bg-blue-100 text-blue-800",
                  schedule.status === 'processing' && "bg-blue-100 text-blue-800"
                )}>
                  ({formatScheduledTime(schedule.scheduled_for, schedule.status)})
                </span>
              );
            })()}
            {schedule.status === 'posted' && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Đã đăng thành công
              </span>
            )}
            {schedule.status === 'failed' && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Đăng thất bại
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">
              {schedule.target_type === 'page' ? 'Trang' : 'Nhóm'}: {schedule.target_name || schedule.target_id}
            </span>
          </div>

          {/* Posted time removed - UTC format not needed on UI */}

          {/* Error details removed - only show status */}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails?.(schedule.id)}
          >
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
