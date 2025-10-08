'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityItem['type'], status?: ActivityItem['status']) => {
    switch (type) {
      case 'review_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'post_scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'post_published':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'post_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'webhook_sent':
        return status === 'success' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> : 
          <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null;

    const statusConfig = {
      success: { label: 'Thành công', className: 'bg-green-100 text-green-800' },
      error: { label: 'Lỗi', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Đang xử lý', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status];
    return (
      <Badge className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return timestampDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  
                  {activity.metadata?.facebookPostUrl && (
                    <a
                      href={activity.metadata.facebookPostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      Xem bài đăng →
                    </a>
                  )}
                  
                  {activity.metadata?.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">
                      Lỗi: {activity.metadata.errorMessage}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
