'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Target,
  MessageSquare,
  Link as LinkIcon,
  ExternalLink,
  Video,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { formatTimestampForDisplay, calculateTimeRemaining } from '@/lib/utils/timezone-utils';
import type { Schedule } from '@/types';

interface ScheduleDetailDialogProps {
  schedule: Schedule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDetailDialog({ schedule, open, onOpenChange }: ScheduleDetailDialogProps) {
  if (!schedule) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'posted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'posted':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ đăng';
      case 'processing': return 'Đang xử lý';
      case 'posted': return 'Đã đăng';
      case 'failed': return 'Thất bại';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const timeRemaining = calculateTimeRemaining(schedule.scheduled_for);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                Chi Tiết Lịch Đăng Bài
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge className={`border ${getStatusColor(schedule.status)} flex items-center gap-1`}>
                  {getStatusIcon(schedule.status)}
                  {getStatusText(schedule.status)}
                </Badge>
                {schedule.status === 'pending' && !timeRemaining.isOverdue && (
                  <Badge variant="outline" className="text-xs">
                    Còn {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Video Info Section */}
          {schedule.video_title && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start gap-3 mb-3">
                <Video className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Video Gốc</h3>
                  <div className="flex gap-4">
                    {schedule.video_thumbnail && (
                      <img
                        src={schedule.video_thumbnail}
                        alt={schedule.video_title}
                        className="w-40 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{schedule.video_title}</p>
                      {schedule.channel_name && (
                        <p className="text-sm text-gray-600">Kênh: {schedule.channel_name}</p>
                      )}
                      {schedule.video_url && (
                        <a
                          href={schedule.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Xem video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Info Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Thời gian đăng</h3>
              </div>
              <p className="text-lg font-medium text-blue-900">
                {formatTimestampForDisplay(schedule.scheduled_for)}
              </p>
              <p className="text-xs text-gray-600 mt-1">GMT+7 (Asia/Ho_Chi_Minh)</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Đích đến</h3>
              </div>
              <p className="text-lg font-medium text-purple-900">
                {schedule.target_type === 'page' ? 'Facebook Page' : 'Facebook Group'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{schedule.target_name || schedule.target_id}</p>
            </div>
          </div>

          {/* Post Message Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Nội dung bài đăng</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {schedule.post_message}
              </pre>
            </div>
          </div>

          {/* Landing Page Section */}
          {schedule.landing_page_url && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Landing Page</h3>
              </div>
              <a
                href={schedule.landing_page_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                {schedule.landing_page_url}
              </a>
            </div>
          )}

          {/* Affiliate Links Section */}
          {schedule.affiliate_links && Array.isArray(schedule.affiliate_links) && schedule.affiliate_links.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Affiliate Links ({schedule.affiliate_links.length})
                </h3>
              </div>
              <div className="space-y-3">
                {schedule.affiliate_links.map((link, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{link.platform}</Badge>
                          {link.price && (
                            <span className="text-sm font-semibold text-green-600">
                              {link.price}
                            </span>
                          )}
                          {link.discount && (
                            <Badge variant="outline" className="text-red-600 border-red-300">
                              {link.discount}
                            </Badge>
                          )}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          {link.url}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Summary Section */}
          {schedule.review_summary && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Tóm tắt Review</h3>
              <p className="text-sm text-gray-700">{schedule.review_summary}</p>
            </div>
          )}

          {/* Pros & Cons Section */}
          {((schedule.review_pros && schedule.review_pros.length > 0) ||
            (schedule.review_cons && schedule.review_cons.length > 0)) && (
            <div className="grid grid-cols-2 gap-4">
              {schedule.review_pros && schedule.review_pros.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-green-700 mb-3">✅ Ưu điểm</h3>
                  <ul className="space-y-2">
                    {schedule.review_pros.map((pro, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {schedule.review_cons && schedule.review_cons.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-red-700 mb-3">❌ Nhược điểm</h3>
                  <ul className="space-y-2">
                    {schedule.review_cons.map((con, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Status Info Section */}
          {(schedule.posted_at || schedule.error_message || schedule.facebook_post_url) && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Trạng thái đăng bài</h3>
              <div className="space-y-2 text-sm">
                {schedule.posted_at && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 min-w-[120px]">Thời gian đăng:</span>
                    <span className="text-gray-900">{formatTimestampForDisplay(schedule.posted_at)}</span>
                  </div>
                )}
                {schedule.facebook_post_url && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 min-w-[120px]">Link bài đăng:</span>
                    <a
                      href={schedule.facebook_post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Xem trên Facebook
                    </a>
                  </div>
                )}
                {schedule.error_message && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 min-w-[120px]">Lỗi:</span>
                    <span className="text-red-600">{schedule.error_message}</span>
                  </div>
                )}
                {schedule.status === 'failed' && schedule.retry_count !== undefined && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 min-w-[120px]">Số lần thử lại:</span>
                    <span className="text-gray-900">
                      {schedule.retry_count}/{schedule.max_retries || 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Đóng
            </Button>
            {schedule.landing_page_url && (
              <Button asChild className="flex-1">
                <a
                  href={schedule.landing_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Xem Landing Page
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
