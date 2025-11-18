'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Target,
  MessageSquare,
  ExternalLink,
  Video,
  User,
  Globe,
  Link as LinkIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatTimestampForDisplay } from '@/lib/utils/timezone-utils';
import { supabase } from '@/lib/db/supabase';
import type { Schedule } from '@/types';

interface ScheduleDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string | null;
}

interface ScheduleWithReview extends Schedule {
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

export function ScheduleDetailDialog({ isOpen, onClose, scheduleId }: ScheduleDetailDialogProps) {
  const [schedule, setSchedule] = useState<ScheduleWithReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && scheduleId) {
      fetchScheduleDetails();
    } else {
      setSchedule(null);
      setError(null);
    }
  }, [isOpen, scheduleId]);

  const fetchScheduleDetails = async () => {
    if (!scheduleId) return;

    try {
      setLoading(true);
      setError(null);

      // Get authentication headers
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.user) {
        headers['x-user-id'] = session.user.id;
        headers['x-user-email'] = session.user.email || '';
        headers['x-user-role'] = session.user.user_metadata?.role || 'user';
      }

      const response = await fetch(`/api/schedules/${scheduleId}`, {
        headers,
      });

      const result = await response.json();

      if (result.success) {
        setSchedule(result.data);
      } else {
        setError(result.error || 'Không thể tải chi tiết lịch đăng bài');
      }
    } catch (err) {
      console.error('Error fetching schedule details:', err);
      setError('Lỗi khi tải chi tiết lịch đăng bài');
    } finally {
      setLoading(false);
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
      <Badge className={`text-sm border ${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết lịch đăng bài</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải chi tiết...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Lỗi</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
            <Button onClick={fetchScheduleDetails} variant="outline" className="mt-4">
              Thử lại
            </Button>
          </div>
        )}

        {!loading && !error && schedule && (
          <div className="space-y-6">
            {/* Status and Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                      {getStatusBadge(schedule.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Thời gian đăng:</span>
                      <span className="font-medium">
                        {formatTimestampForDisplay(schedule.scheduled_for)}
                      </span>
                    </div>
                    {schedule.posted_at && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Đã đăng lúc:</span>
                        <span className="font-medium">{formatDate(schedule.posted_at)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Đăng lên:</span>
                      <span className="font-medium">
                        {schedule.target_type === 'page' ? 'Trang' : 'Nhóm'}: {schedule.target_name || schedule.target_id}
                      </span>
                    </div>
                    {schedule.status === 'failed' && schedule.retry_count > 0 && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <RefreshCw className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">Đã thử lại:</span>
                        <span className="font-medium">{schedule.retry_count}/{schedule.max_retries} lần</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Info */}
            {schedule.video_title && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Thông tin video
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedule.video_thumbnail && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={schedule.video_thumbnail} 
                          alt={schedule.video_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tiêu đề:</span>
                        <p className="font-medium">{schedule.video_title}</p>
                      </div>
                      {schedule.channel_name && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Kênh:</span>
                          <p className="text-gray-700">{schedule.channel_name}</p>
                        </div>
                      )}
                      {schedule.video_url && (
                        <div>
                          <a 
                            href={schedule.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Xem video gốc
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Post Message */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Nội dung đăng bài
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
                  {schedule.post_message || 'Không có nội dung'}
                </div>
                {schedule.landing_page_url && (
                  <div className="mt-4">
                    <a 
                      href={schedule.landing_page_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {schedule.landing_page_url}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Summary */}
            {schedule.review_summary && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Tóm tắt review</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{schedule.review_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Pros and Cons */}
            {(schedule.review_pros?.length > 0 || schedule.review_cons?.length > 0) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4">Ưu và nhược điểm</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schedule.review_pros?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">✅ Ưu điểm</h4>
                        <ul className="space-y-1">
                          {schedule.review_pros.map((pro: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {schedule.review_cons?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">❌ Nhược điểm</h4>
                        <ul className="space-y-1">
                          {schedule.review_cons.map((con: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Affiliate Links */}
            {schedule.affiliate_links && Array.isArray(schedule.affiliate_links) && schedule.affiliate_links.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Affiliate Links
                  </h3>
                  <div className="space-y-3">
                    {schedule.affiliate_links.map((link: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{link.platform || 'Nền tảng'}</div>
                            {link.price && (
                              <div className="text-sm text-gray-600">Giá: {link.price}</div>
                            )}
                            {link.discount && (
                              <div className="text-sm text-green-600">Giảm: {link.discount}</div>
                            )}
                          </div>
                          {link.url && (
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Mua ngay
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Facebook Post Info */}
            {schedule.facebook_post_url && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Bài đăng Facebook
                  </h3>
                  <a 
                    href={schedule.facebook_post_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Xem bài đăng trên Facebook
                  </a>
                  {schedule.facebook_post_id && (
                    <p className="text-sm text-gray-500 mt-2">Post ID: {schedule.facebook_post_id}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {schedule.status === 'failed' && schedule.error_message && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2 text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Lỗi đăng bài
                  </h3>
                  <p className="text-red-700 whitespace-pre-wrap">{schedule.error_message}</p>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Thông tin khác</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tạo lúc:</span>
                    <p className="font-medium">{formatDate(schedule.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cập nhật lúc:</span>
                    <p className="font-medium">{formatDate(schedule.updated_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Schedule ID:</span>
                    <p className="font-mono text-xs">{schedule.id}</p>
                  </div>
                  {schedule.review_id && (
                    <div>
                      <span className="text-gray-600">Review ID:</span>
                      <p className="font-mono text-xs">{schedule.review_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

