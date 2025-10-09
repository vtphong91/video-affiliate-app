'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, Target, MessageSquare, X } from 'lucide-react';
import { cn, getLandingPageUrl } from '@/lib/utils';
import { formatFacebookPost } from '@/lib/apis/facebook';
import type { Review } from '@/types';

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  reviewId?: string;
  reviewData?: Review;
  reviews?: Review[];
}

export function CreateScheduleDialog({ open, onOpenChange, onSubmit, reviewId, reviewData, reviews: propReviews }: CreateScheduleDialogProps) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [formData, setFormData] = useState({
    reviewId: '',
    scheduledFor: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
      return tomorrow;
    })(),
  });

  useEffect(() => {
    if (open) {
      fetchReviews();
    }
  }, [open]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch('/api/reviews?excludeScheduled=true');
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data || []);
      } else {
        console.error('Error fetching reviews:', result.error);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form data before submit:', formData);
    
    if (!formData.reviewId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn review',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.scheduledFor || isNaN(formData.scheduledFor.getTime())) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn thời gian đăng bài hợp lệ',
        variant: 'destructive',
      });
      return;
    }

    // Validate date is not in the past
    const now = new Date();
    if (formData.scheduledFor <= now) {
      toast({
        title: 'Lỗi',
        description: 'Thời gian đăng bài phải trong tương lai',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // GMT+7 Direct Storage Solution
      // Convert local time to GMT+7 format (no UTC conversion)
      const localTime = formData.scheduledFor;
      const gmt7Time = new Date(localTime.getTime() + (7 * 60 * 60 * 1000)); // Add 7 hours
      const scheduledForGMT7 = gmt7Time.toISOString().replace('Z', ''); // Remove Z, keep GMT+7
      
      console.log('📅 GMT+7 Direct Storage:');
      console.log('  Local time (selected):', localTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
      console.log('  GMT+7 time (sent to API):', scheduledForGMT7);

      // Get review data for real content
      const allReviews = propReviews || reviews;
      const selectedReview = reviewData || allReviews.find(r => r.id === formData.reviewId);
      
      if (!selectedReview) {
        throw new Error('Review not found');
      }

      // Generate real data from review using formatFacebookPost
      const realLandingUrl = getLandingPageUrl(selectedReview.slug);
      const realPostMessage = formatFacebookPost({
        title: selectedReview.video_title,
        summary: selectedReview.summary,
        pros: selectedReview.pros || [],
        cons: selectedReview.cons || [],
        targetAudience: selectedReview.target_audience || [],
        keywords: selectedReview.seo_keywords || [],
        videoUrl: selectedReview.video_url,
        channelName: selectedReview.channel_name,
        landingUrl: realLandingUrl,
        comparisonTable: selectedReview.comparison_table || [],
        cta: selectedReview.cta || '',
      });

      const scheduleData = {
        reviewId: formData.reviewId,
        scheduledFor: scheduledForGMT7, // Send GMT+7 time
        targetType: 'page',
        targetId: 'facebook-page-real', // Real target ID
        targetName: 'Facebook Page Real', // Real target name
        postMessage: realPostMessage, // Real post message from review
        landingPageUrl: realLandingUrl, // Real landing URL from review
        videoUrl: selectedReview.video_url, // Real video URL
        videoThumbnail: selectedReview.video_thumbnail, // Real video thumbnail
        affiliateLinks: selectedReview.affiliate_links, // Real affiliate links
        channelName: selectedReview.channel_name, // Real channel name
      };
      
      console.log('📤 Sending schedule data:', scheduleData);
      
             const response = await fetch('/api/debug-datetime-picker', { // Use debug API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      console.log('📅 Schedule created from CreateScheduleDialog:', data.data);
      
      // Don't call onSubmit with the created schedule data
      // The parent component will handle the success
      toast({
        title: '✅ Thành công!',
        description: 'Lịch đăng bài đã được tạo',
      });
      
      onOpenChange(false); // Close dialog
      // Don't call onSubmit to avoid double API call
    } catch (error) {
      console.error('❌ Schedule creation error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo lịch đăng bài',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewChange = (reviewId: string) => {
    setFormData(prev => ({
      ...prev,
      reviewId,
    }));
  };

  const resetForm = () => {
    setFormData({
      reviewId: '',
      scheduledFor: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
        return tomorrow;
      })(),
    });
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50",
      open ? "block" : "hidden"
    )}>
      <Card className="max-w-2xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tạo Lịch Đăng Bài Mới</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Lên lịch đăng bài tự động lên Facebook Page hoặc Group
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Chọn Review *</Label>
              <select 
                id="review"
                value={formData.reviewId} 
                onChange={(e) => handleReviewChange(e.target.value)}
                disabled={reviewsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {reviewsLoading ? 'Đang tải reviews...' : 'Chọn review để đăng bài'}
                </option>
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <option key={review.id} value={review.id}>
                      {review.video_title}
                    </option>
                  ))
                ) : (
                  !reviewsLoading && <option value="" disabled>Không có review nào</option>
                )}
              </select>
            </div>

            {/* Schedule Time */}
            <div className="space-y-2">
              <Label>Thời gian đăng bài *</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={(() => {
                    try {
                      return formData.scheduledFor.toISOString().split('T')[0];
                    } catch {
                      const fallback = new Date();
                      fallback.setDate(fallback.getDate() + 1);
                      return fallback.toISOString().split('T')[0];
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        newDate.setHours(formData.scheduledFor.getHours());
                        newDate.setMinutes(formData.scheduledFor.getMinutes());
                        setFormData(prev => ({ ...prev, scheduledFor: newDate }));
                      }
                    } catch (error) {
                      console.error('Date change error:', error);
                    }
                  }}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={(() => {
                    try {
                      return formData.scheduledFor.toTimeString().slice(0, 5);
                    } catch {
                      return '09:00';
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(formData.scheduledFor);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      if (!isNaN(newDate.getTime())) {
                        setFormData(prev => ({ ...prev, scheduledFor: newDate }));
                      }
                    } catch (error) {
                      console.error('Time change error:', error);
                    }
                  }}
                  className="w-32"
                />
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Lưu ý:</strong> Make.com sẽ tự động xử lý việc chọn fanpage/group và đăng bài.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang tạo...' : 'Tạo Lịch Đăng Bài'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
