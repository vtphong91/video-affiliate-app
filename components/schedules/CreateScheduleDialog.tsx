'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CalendarIcon, Clock, Target, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';
import { createTimestampFromDatePicker, debugTimezone } from '@/lib/utils/timezone-utils';

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateScheduleDialog({ open, onOpenChange, onSubmit }: CreateScheduleDialogProps) {
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
        console.log('📊 Reviews API response:', result);
        const reviewsData = result.data?.reviews || result.data || [];
        console.log('✅ Reviews loaded:', reviewsData);
        setReviews(reviewsData);
      } else {
        console.error('❌ Reviews API failed:', result.error);
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
      // localTime is a Date object representing the local time selected by the user.
      const localTime = formData.scheduledFor;
      
      console.log('🔍 Form data - localTime:', localTime);
      console.log('🔍 Form data - localTime type:', typeof localTime);
      console.log('🔍 Form data - localTime instanceof Date:', localTime instanceof Date);
      
      // Validate that localTime is a Date object
      if (!localTime || !(localTime instanceof Date)) {
        console.error('❌ Invalid localTime:', localTime);
        throw new Error('Invalid date selected. Please select a valid date and time.');
      }
      
      // Extract time string from Date object
      const timeString = `${localTime.getHours().toString().padStart(2, '0')}:${localTime.getMinutes().toString().padStart(2, '0')}`;
      
      console.log('🔍 Form data - timeString:', timeString);
      
      // Tạo timestamp từ datetimepicker theo timezone được cấu hình
      const scheduledForString = createTimestampFromDatePicker(localTime, timeString);
      
      console.log('🔍 scheduledForString:', scheduledForString);
      
      // Debug timezone handling - only if localTime is a valid Date
      try {
        if (localTime instanceof Date) {
          debugTimezone(localTime, 'CreateScheduleDialog - Before API call');
        }
      } catch (debugError) {
        console.error('❌ Debug timezone error:', debugError);
        // Continue without debug if it fails
      }

      // Get selected review data
      const selectedReview = reviews.find(r => r.id === formData.reviewId);
      if (!selectedReview) {
        throw new Error('Review not found');
      }

      // Generate real post message from review
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const landingPageUrl = `${baseUrl}/review/${selectedReview.slug}`;
      
      // Create post message similar to formatFacebookPost
      let postMessage = `🔥 ${selectedReview.custom_title || selectedReview.video_title}\n\n`;
      postMessage += `📝 ${selectedReview.summary}\n\n`;
      
      if (selectedReview.pros && selectedReview.pros.length > 0) {
        postMessage += '✅ ƯU ĐIỂM:\n';
        selectedReview.pros.slice(0, 5).forEach((pro) => {
          postMessage += `• ${pro}\n`;
        });
        postMessage += '\n';
      }
      
      if (selectedReview.cons && selectedReview.cons.length > 0) {
        postMessage += '⚠️ NHƯỢC ĐIỂM CẦN LƯU Ý:\n';
        selectedReview.cons.slice(0, 3).forEach((con) => {
          postMessage += `• ${con}\n`;
        });
        postMessage += '\n';
      }
      
      if (selectedReview.target_audience && selectedReview.target_audience.length > 0) {
        postMessage += '👥 PHÙ HỢP VỚI:\n';
        selectedReview.target_audience.forEach((audience) => {
          postMessage += `• ${audience}\n`;
        });
        postMessage += '\n';
      }
      
      postMessage += `🎥 Xem video gốc:\n${selectedReview.video_url}\n\n`;
      
      const channelCredit = selectedReview.channel_name || 'kênh gốc';
      postMessage += `⚖️ Bản quyền video thuộc về ${channelCredit}\n`;
      postMessage += `Mọi quyền thuộc về kênh gốc. Đây chỉ là nội dung tham khảo.\n\n`;
      
      // Add hashtags
      if (selectedReview.seo_keywords && selectedReview.seo_keywords.length > 0) {
        const hashtags = selectedReview.seo_keywords
          .slice(0, 10)
          .map((k) => `#${k.replace(/\s+/g, '').replace(/[^\w\u00C0-\u1EF9]/g, '')}`);
        postMessage += `\n\n${hashtags.join(' ')}`;
      }

      const scheduleData = {
        reviewId: formData.reviewId,
        scheduledFor: scheduledForString,
        targetType: 'page',
        targetId: 'make-com-handled',
        targetName: 'Make.com Auto',
        postMessage: postMessage,
        landingPageUrl: landingPageUrl,
        affiliate_links: selectedReview.affiliate_links || [],
      };
      
      console.log('📤 Sending schedule data:', scheduleData);
      
      const response = await fetch('/api/schedules', {
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
