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
import { formatFacebookPost } from '@/lib/apis/facebook';
import { supabase } from '@/lib/db/supabase';

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateScheduleDialog({ open, onOpenChange, onSubmit }: CreateScheduleDialogProps) {
  console.log('🔍 CreateScheduleDialog: Component rendered with open:', open);
  
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

  // Helper functions for date/time handling
  const getDateInputValue = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      return fallback.toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const getTimeInputValue = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 1);
      fallback.setHours(9, 0, 0, 0);
      return fallback.toTimeString().slice(0, 5);
    }
    return date.toTimeString().slice(0, 5);
  };

  const updateScheduledFor = (newDate: Date) => {
    if (!newDate || isNaN(newDate.getTime())) {
      console.error('❌ Invalid date provided to updateScheduledFor:', newDate);
      return;
    }
    
    console.log('🔄 Updating scheduledFor from:', formData.scheduledFor, 'to:', newDate);
    setFormData(prev => ({ ...prev, scheduledFor: newDate }));
  };

  useEffect(() => {
    console.log('🔍 CreateScheduleDialog: useEffect triggered, open:', open);
    if (open) {
      console.log('🔍 CreateScheduleDialog: Opening dialog, calling fetchReviews');
      fetchReviews();
    } else {
      console.log('🔍 CreateScheduleDialog: Dialog closed');
    }
  }, [open]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      console.log('🔍 CreateScheduleDialog: Fetching reviews...');
      
      // Fetch both reviews and used review IDs
      const [reviewsResponse, usedIdsResponse] = await Promise.all([
        fetch('/api/reviews-fast'), // Use fast API
        fetch('/api/schedules/used-review-ids')
      ]);
      
      console.log('🔍 CreateScheduleDialog: Reviews response status:', reviewsResponse.status);
      console.log('🔍 CreateScheduleDialog: Used IDs response status:', usedIdsResponse.status);
      
      const reviewsResult = await reviewsResponse.json();
      const usedIdsResult = await usedIdsResponse.json();
      
      if (reviewsResult.success) {
        const allReviews = reviewsResult.data || [];
        const usedReviewIds = usedIdsResult.success ? usedIdsResult.usedReviewIds : [];
        
        console.log('🔍 CreateScheduleDialog: Used IDs data:', usedIdsResult);
        console.log('🔍 CreateScheduleDialog: Used review IDs:', usedReviewIds);
        
        // Filter out reviews that are already used in schedules
        const availableReviews = allReviews.filter((review: any) => {
          const isUsed = usedReviewIds.includes(review.id);
          console.log(`🔍 Review ${review.id} (${review.video_title}): ${isUsed ? 'USED' : 'AVAILABLE'}`);
          return !isUsed;
        });
        
        console.log(`✅ Total reviews: ${allReviews.length}, Used: ${usedReviewIds.length}, Available: ${availableReviews.length}`);
        console.log('🔍 Available reviews:', availableReviews.map(r => ({ id: r.id, title: r.video_title })));
        
        setReviews(availableReviews);
      } else {
        console.error('❌ Reviews API failed:', reviewsResult.error);
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
          debugTimezone('CreateScheduleDialog - Before API call', localTime);
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

      console.log('🔍 Selected review affiliate_links:', {
        reviewId: selectedReview.id,
        videoTitle: selectedReview.video_title,
        affiliate_links: selectedReview.affiliate_links,
        affiliate_links_type: typeof selectedReview.affiliate_links,
        affiliate_links_length: Array.isArray(selectedReview.affiliate_links) ? selectedReview.affiliate_links.length : 'not array'
      });

      // Generate real post message from review
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const landingPageUrl = `${baseUrl}/review/${selectedReview.slug}`;
      
      // Sử dụng function chuẩn từ Facebook module với field mapping đúng
      const postMessage = formatFacebookPost({
        title: selectedReview.video_title,
        summary: selectedReview.summary || 'Đánh giá chi tiết về sản phẩm',
        pros: selectedReview.pros || [],
        cons: selectedReview.cons || [],
        targetAudience: selectedReview.target_audience || [],
        keywords: selectedReview.seo_keywords || [],
        channelName: selectedReview.channel_name,
        landingUrl: landingPageUrl
      });

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
      console.log('🔍 Schedule data affiliate_links:', {
        affiliate_links: scheduleData.affiliate_links,
        affiliate_links_type: typeof scheduleData.affiliate_links,
        affiliate_links_length: Array.isArray(scheduleData.affiliate_links) ? scheduleData.affiliate_links.length : 'not array'
      });
      
      console.log('🔍 Step 1: Starting fast schedule creation...');
      
      console.log('🔍 Step 2: Making API call...');
      
      const response = await fetch('/api/schedules-fast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData),
      });

      console.log('🔍 Step 3: API response received');
      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      const data = await response.json();
      console.log('📥 Response data:', data);

      console.log('🔍 Step 4: Checking response validity...');

      if (!response.ok || !data.success) {
        console.error('❌ API call failed:', { status: response.status, data });
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      console.log('🔍 Step 7: Schedule created successfully');
      
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
    const defaultDate = (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9:00 AM tomorrow
      return tomorrow;
    })();
    
    setFormData({
      reviewId: '',
      scheduledFor: defaultDate,
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
                  value={getDateInputValue(formData.scheduledFor)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      // Preserve existing time when changing date
                      newDate.setHours(formData.scheduledFor.getHours());
                      newDate.setMinutes(formData.scheduledFor.getMinutes());
                      newDate.setSeconds(formData.scheduledFor.getSeconds());
                      updateScheduledFor(newDate);
                    }
                  }}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={getTimeInputValue(formData.scheduledFor)}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    
                    // Validate parsed values
                    if (hours !== undefined && minutes !== undefined && 
                        !isNaN(hours) && !isNaN(minutes) &&
                        hours >= 0 && hours <= 23 && 
                        minutes >= 0 && minutes <= 59) {
                      
                      const newDate = new Date(formData.scheduledFor);
                      newDate.setHours(hours, minutes, 0, 0);
                      updateScheduledFor(newDate);
                    }
                  }}
                  className="w-32"
                />
              </div>
              <div className="text-sm text-gray-600">
                <strong>Thời gian đã chọn:</strong> {formData.scheduledFor.toLocaleString('vi-VN')}
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
