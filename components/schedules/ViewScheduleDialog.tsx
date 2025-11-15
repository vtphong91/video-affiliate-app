'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Target,
  MessageSquare,
  Video,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Users,
  Tag,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { formatTimestampForDisplay } from '@/lib/utils/timezone-utils';
import { cn } from '@/lib/utils';

interface Schedule {
  id: string;
  scheduled_for: string;
  post_message: string;
  status: string;
  target_type: string;
  target_id: string;
  target_name?: string;
  facebook_post_url?: string;
  posted_at?: string;
  error_details?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  // Video & Review data
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
  affiliate_links?: any[];
}

interface ViewScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

export function ViewScheduleDialog({ isOpen, onClose, schedule }: ViewScheduleDialogProps) {
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (schedule && isOpen) {
      fetchWebhookLogs();
    }
  }, [schedule, isOpen]);

  const fetchWebhookLogs = async () => {
    if (!schedule) return;

    setIsLoadingLogs(true);
    try {
      const response = await fetch(`/api/schedules/${schedule.id}/logs`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWebhookLogs(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching webhook logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'posted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'Chờ đăng',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      processing: {
        label: 'Đang xử lý',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      posted: {
        label: 'Đã đăng',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      failed: {
        label: 'Thất bại',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`border ${config.className} flex items-center gap-1`}>
        {getStatusIcon(status)}
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Video className="h-6 w-6 text-blue-600" />
            Chi Tiết Lịch Đăng Bài
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Trạng thái</span>
                {getStatusBadge(schedule.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(schedule.scheduled_for)}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">Đích đến</span>
              </div>
              <div className="text-sm text-gray-800">
                {schedule.target_type === 'page' ? 'Trang' : 'Nhóm'}: {schedule.target_name || schedule.target_id}
              </div>
            </div>
          </div>

          {/* Video Info */}
          {schedule.video_thumbnail && (
            <div className="border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-100">
                <img
                  src={schedule.video_thumbnail}
                  alt={schedule.video_title || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-lg mb-2">
                  {schedule.video_title || 'Không có tiêu đề'}
                </h3>
                {schedule.channel_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    Kênh: {schedule.channel_name}
                  </p>
                )}
                {schedule.video_url && (
                  <a
                    href={schedule.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Xem video gốc
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Post Message */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">Nội dung đăng bài</h3>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {schedule.post_message}
            </div>
          </div>

          {/* Review Summary */}
          {schedule.review_summary && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Tóm tắt đánh giá</h3>
              <p className="text-sm text-gray-700">{schedule.review_summary}</p>
            </div>
          )}

          {/* Pros & Cons */}
          {(schedule.review_pros || schedule.review_cons) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedule.review_pros && schedule.review_pros.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Ưu điểm</h3>
                  </div>
                  <ul className="space-y-2">
                    {schedule.review_pros.map((pro: any, index: number) => (
                      <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{typeof pro === 'string' ? pro : pro.text || pro.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {schedule.review_cons && schedule.review_cons.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Nhược điểm</h3>
                  </div>
                  <ul className="space-y-2">
                    {schedule.review_cons.map((con: any, index: number) => (
                      <li key={index} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-600 mt-1">•</span>
                        <span>{typeof con === 'string' ? con : con.text || con.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Key Points */}
          {schedule.review_key_points && schedule.review_key_points.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Điểm nổi bật</h3>
              </div>
              <ul className="space-y-2">
                {schedule.review_key_points.map((point: any, index: number) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{typeof point === 'string' ? point : point.text || point.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Audience */}
          {schedule.review_target_audience && schedule.review_target_audience.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Đối tượng mục tiêu</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.review_target_audience.map((audience: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {typeof audience === 'string' ? audience : audience.text || audience.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* SEO Keywords */}
          {schedule.review_seo_keywords && schedule.review_seo_keywords.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Từ khóa SEO</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {schedule.review_seo_keywords.map((keyword: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {typeof keyword === 'string' ? keyword : keyword.text || keyword.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Affiliate Links */}
          {schedule.affiliate_links && schedule.affiliate_links.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Link sản phẩm</h3>
              </div>
              <div className="space-y-2">
                {schedule.affiliate_links.map((link: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.product_name || link.name || `Sản phẩm ${index + 1}`}</p>
                        {link.price && (
                          <p className="text-sm text-gray-600 mt-1">Giá: {link.price}</p>
                        )}
                      </div>
                      {link.url && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {schedule.review_cta && (
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold text-purple-900 mb-2">Call-to-Action</h3>
              <p className="text-sm text-purple-800">{schedule.review_cta}</p>
            </div>
          )}

          {/* Posted Info */}
          {schedule.status === 'posted' && schedule.posted_at && (
            <div className="border rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Đã đăng thành công</h3>
              </div>
              <p className="text-sm text-green-800">
                Thời gian: {formatDateTime(schedule.posted_at)}
              </p>
              {schedule.facebook_post_url && (
                <a
                  href={schedule.facebook_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Xem bài đăng trên Facebook
                </a>
              )}
            </div>
          )}

          {/* Error Info */}
          {schedule.status === 'failed' && (
            <div className="border rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Đăng bài thất bại</h3>
              </div>
              {schedule.error_details && (
                <p className="text-sm text-red-800 mb-2">
                  Lỗi: {schedule.error_details}
                </p>
              )}
              <p className="text-sm text-red-800">
                Đã thử lại: {schedule.retry_count}/{schedule.max_retries} lần
              </p>
              {schedule.next_retry_at && (
                <p className="text-sm text-red-800">
                  Thử lại lúc: {formatDateTime(schedule.next_retry_at)}
                </p>
              )}
            </div>
          )}

          {/* Webhook Logs */}
          {webhookLogs.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Lịch sử webhook</h3>
              <div className="space-y-2">
                {webhookLogs.map((log: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-medium",
                        log.status === 'success' ? "text-green-600" : "text-red-600"
                      )}>
                        {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                      </span>
                      <span className="text-gray-600">
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                    {log.error_message && (
                      <p className="text-red-600 text-xs">{log.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
